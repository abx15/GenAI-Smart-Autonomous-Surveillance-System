import { FastifyInstance } from 'fastify';
import { Event } from '../models/Event';
import { Zone } from '../models/Zone';
import { eventStore } from '../services/eventStore';
import { logger } from '../../../../shared/utils/logger';

export async function eventRoutes(app: FastifyInstance) {

  /**
   * @route   GET /health
   * @desc    Check event service health and status
   * @access  Public
   * @returns { success, data: { status, service, timestamp } }
   */
  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'event-service', timestamp: new Date().toISOString() }
  }));

  /**
   * @route   GET /events
   * @desc    Fetch paginated surveillance events with optional filters
   * @access  Private (requires JWT Bearer token)
   * @query   {string}  [type]       - Filter by event type: intrusion | loitering | zone_entry | zone_exit
   * @query   {string}  [severity]   - Filter by severity: critical | high | medium | low
   * @query   {string}  [camera]     - Filter by camera ID (e.g., CAM-01)
   * @query   {boolean} [resolved]   - Filter by resolved status (true/false)
   * @query   {number}  [limit=50]   - Max results per page (default: 50)
   * @query   {number}  [page=1]     - Page number for pagination
   * @query   {string}  [startDate]  - ISO date string: filter events after this date
   * @query   {string}  [endDate]    - ISO date string: filter events before this date
   * @query   {number}  [minutes]    - Shortcut: get events from last N minutes
   * @returns {object}  { success, data: Event[], pagination: { total, page, limit, totalPages } }
   * @example GET /events?type=intrusion&severity=critical&limit=20&page=1
   */
  app.get('/events', async (req, reply) => {
    try {
      const { type, severity, camera, resolved, limit = 50, page = 1, startDate, endDate, minutes } = req.query as any;

      // If minutes provided, use recent events
      if (minutes) {
        const events = await eventStore.getRecentEvents(parseInt(minutes));
        return { success: true, data: events, total: events.length };
      }

      const result = await eventStore.getEvents({
        type, severity,
        cameraId: camera,
        resolved: resolved !== undefined ? resolved === 'true' : undefined,
        limit: parseInt(limit),
        page: parseInt(page),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      return {
        success: true,
        data: result.events,
        pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
      };
    } catch (err) {
      logger.error({ err }, 'GET /events failed');
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch events' });
    }
  });

  /**
   * @route   GET /events/stats
   * @desc    Get aggregated event statistics by type and severity
   * @access  Private
   * @returns { success, data: { typeCounts, severityCounts, statusCounts } }
   */
  app.get('/events/stats', async (req, reply) => {
    try {
      const stats = await eventStore.getStats();
      return { success: true, data: stats };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch stats' });
    }
  });

  /**
   * @route   GET /events/recent
   * @desc    Fetch events from the last N minutes (default: 10)
   * @access  Private
   * @query   {number} [minutes=10] - Time window in minutes
   * @returns { success, data: Event[] }
   */
  app.get('/events/recent', async (req, reply) => {
    try {
      const { minutes = 10 } = req.query as any;
      const events = await eventStore.getRecentEvents(parseInt(minutes));
      return { success: true, data: events };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch recent events' });
    }
  });

  /**
   * @route   GET /events/:eventId
   * @desc    Fetch detailed information about a single event
   * @access  Private
   * @param   {string} eventId - Unique event UUID
   * @returns { success, data: Event }
   */
  app.get('/events/:eventId', async (req, reply) => {
    try {
      const { eventId } = req.params as any;
      const event = await Event.findOne({ eventId }).lean();
      if (!event) return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Event not found' });
      return { success: true, data: event };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch event' });
    }
  });

  /**
   * @route   PUT /events/:eventId/resolve
   * @desc    Mark a surveillance event as resolved (dismissed)
   * @access  Private (requires operator/admin role)
   * @param   {string} eventId - Unique event UUID
   * @returns { success, data: Event, message }
   */
  app.put('/events/:eventId/resolve', async (req, reply) => {
    try {
      const { eventId } = req.params as any;
      const event = await eventStore.resolveEvent(eventId);
      if (!event) return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Event not found' });
      return { success: true, data: event, message: 'Event resolved' };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to resolve event' });
    }
  });

  /**
   * @route   POST /zones
   * @desc    Define a new surveillance zone (restricted, monitoring, entry, exit)
   * @access  Private (admin only)
   * @body    { zoneId, name, type, cameraId, coordinates: [[x,y], ...] }
   * @returns { success, data: Zone, message }
   */
  app.post('/zones', async (req, reply) => {
    try {
      const body = req.body as any;
      const zone = await Zone.create(body);
      return reply.status(201).send({ success: true, data: zone, message: 'Zone created' });
    } catch (err: any) {
      if (err.code === 11000) return reply.status(409).send({ success: false, error: 'DUPLICATE', message: 'Zone already exists' });
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to create zone' });
    }
  });

  /**
   * @route   GET /zones
   * @desc    List all surveillance zones, optionally filtered by camera
   * @access  Private
   * @query   {string} [cameraId] - Filter zones by camera ID
   * @returns { success, data: Zone[] }
   */
  app.get('/zones', async (req, reply) => {
    try {
      const { cameraId } = req.query as any;
      const query = cameraId ? { cameraId } : {};
      const zones = await Zone.find(query).lean();
      return { success: true, data: zones };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch zones' });
    }
  });

  /**
   * @route   DELETE /zones/:zoneId
   * @desc    Delete a surveillance zone configuration
   * @access  Private (admin only)
   * @param   {string} zoneId - Unique zone ID
   * @returns { success, message: 'Zone deleted' }
   */
  app.delete('/zones/:zoneId', async (req, reply) => {
    try {
      const { zoneId } = req.params as any;
      const zone = await Zone.findOneAndDelete({ zoneId });
      if (!zone) return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Zone not found' });
      return { success: true, message: 'Zone deleted' };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to delete zone' });
    }
  });
}
