import { FastifyInstance } from 'fastify';
import { Alert } from '../models/Alert';
import { alertHistory } from '../services/alertHistory';
import { shouldSend } from '../services/rateLimiter';
import { broadcastAlert } from '../websocket/broadcaster';
import { logger } from '../../../shared/utils/logger';

export async function alertRoutes(app: FastifyInstance) {

  /**
   * @route   GET /health
   * @desc    Check alert service health and status
   * @access  Public
   * @returns { success, data: { status, service, timestamp } }
   */
  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'alert-service', timestamp: new Date().toISOString() }
  }));

  /**
   * @route   GET /alerts/history
   * @desc    Fetch recent alerts from MongoDB (persistent storage)
   * @access  Private
   * @query   {number} [limit=50] - Max alerts to return (ordered by newest first)
   * @returns { success, data: Alert[] }
   */
  app.get('/alerts/history', async (req) => {
    const { limit = 50 } = req.query as any;
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(parseInt(limit)).lean();
    return { success: true, data: alerts };
  });

  /**
   * @route   GET /alerts/unacknowledged
   * @desc    Fetch all unacknowledged alerts for the dashboard badge
   * @access  Private
   * @returns { success, data: Alert[], count: number }
   */
  app.get('/alerts/unacknowledged', async () => {
    const alerts = await Alert.find({ acknowledged: false }).sort({ createdAt: -1 }).lean();
    return { success: true, data: alerts, count: alerts.length };
  });

  /**
   * @route   PUT /alerts/:alertId/acknowledge
   * @desc    Mark an alert as acknowledged (dismissed by operator)
   * @access  Private
   * @param   {string} alertId - Unique alert UUID
   * @returns { success, data: Alert, message }
   */
  app.put('/alerts/:alertId/acknowledge', async (req, reply) => {
    const { alertId } = req.params as any;
    const alert = await Alert.findOneAndUpdate(
      { alertId },
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Alert not found' });
    return { success: true, data: alert, message: 'Alert acknowledged' };
  });

  /**
   * @route   GET /stats/live
   * @desc    Get real-time Socket.IO connection statistics
   * @access  Private
   * @returns { success, data: { connectedClients, recentAlerts, timestamp } }
   */
  app.get('/stats/live', async (req) => {
    const io = (app as any).io;
    const alertsNsp = io?.of('/alerts');
    const connectedSockets = await alertsNsp?.fetchSockets();
    return {
      success: true,
      data: {
        connectedClients: connectedSockets?.length || 0,
        recentAlerts: alertHistory.getLast(5).length,
        timestamp: new Date().toISOString(),
      },
    };
  });

  /**
   * @route   POST /internal/event
   * @desc    Internal route — event-service sends processed surveillance events here.
   *          This replaces the Kafka processed.events and alerts.triggered topics.
   *          Saves alert to MongoDB and broadcasts via Socket.IO to dashboard.
   *          NOT exposed via API Gateway (internal only).
   * @access  Internal (no auth required — only called by event-service)
   * @body    SurveillanceEvent object from event-service
   * @returns { success: boolean }
   */
  app.post('/internal/event', async (req, reply) => {
    try {
      const event = req.body as any;

      if (!event || !event.type) {
        return reply.status(400).send({ success: false, error: 'Invalid event payload' });
      }

      const io = (global as any).alertIO;

      // Apply rate limiting — prevent alert flood for same person + event type
      const trackId = event.personTrackId || event.trackId || 0;
      if (!shouldSend(trackId, event.type)) {
        logger.debug({ trackId, type: event.type }, 'Alert rate limited — skipping');
        return { success: true, message: 'rate_limited' };
      }

      // Build alert object
      const alert = {
        alertId: crypto.randomUUID(),
        eventId: event.eventId,
        message: event.message || buildMessage(event),
        severity: event.severity,
        type: event.type,
        cameraId: event.cameraId,
        trackId,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      };

      // Save to MongoDB
      await Alert.create(alert);

      // Broadcast to all connected WebSocket clients
      if (io) {
        broadcastAlert(io, alert);
      } else {
        logger.warn('Socket.IO instance not available — alert not broadcast');
      }

      logger.info(
        { alertId: alert.alertId, severity: alert.severity, type: alert.type },
        'Alert created and broadcast'
      );

      return { success: true };
    } catch (err) {
      logger.error({ err }, 'Internal event processing failed');
      return reply.status(500).send({ success: false });
    }
  });

  // Helper: build human readable alert message
  function buildMessage(event: any): string {
    const messages: Record<string, string> = {
      intrusion:         `🚨 Intrusion on ${event.cameraId} — Person #${event.personTrackId} entered restricted zone ${event.zoneName || ''}`,
      loitering:         `⚠️ Loitering on ${event.cameraId} — Person #${event.personTrackId} stationary for ${event.duration || 30}s`,
      zone_entry:        `📍 Zone entry on ${event.cameraId} — Person #${event.personTrackId} entered ${event.zoneName || 'zone'}`,
      zone_exit:         `📍 Zone exit on ${event.cameraId} — Person #${event.personTrackId} left ${event.zoneName || 'zone'}`,
      unattended_object: `📦 Unattended object detected on ${event.cameraId}`,
    };
    return messages[event.type] || `Surveillance alert: ${event.type} on ${event.cameraId}`;
  }
}
