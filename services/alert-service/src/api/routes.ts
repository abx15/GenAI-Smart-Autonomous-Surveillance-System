import { FastifyInstance } from 'fastify';
import { Alert } from '../models/Alert';
import { alertHistory } from '../services/alertHistory';

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
}
