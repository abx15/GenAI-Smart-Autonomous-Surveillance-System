import { FastifyInstance } from 'fastify';
import { Event } from '../models/Event';
import { Zone } from '../models/Zone';
import { eventStore } from '../services/eventStore';
import { logger } from '../../../../shared/utils/logger';

export async function eventRoutes(app: FastifyInstance) {

  // Health
  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'event-service', timestamp: new Date().toISOString() }
  }));

  // GET /events — list with filters + pagination
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

  // GET /events/stats
  app.get('/events/stats', async (req, reply) => {
    try {
      const stats = await eventStore.getStats();
      return { success: true, data: stats };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch stats' });
    }
  });

  // GET /events/recent
  app.get('/events/recent', async (req, reply) => {
    try {
      const { minutes = 10 } = req.query as any;
      const events = await eventStore.getRecentEvents(parseInt(minutes));
      return { success: true, data: events };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch recent events' });
    }
  });

  // GET /events/:eventId
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

  // PUT /events/:eventId/resolve
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

  // POST /zones
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

  // GET /zones
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

  // DELETE /zones/:zoneId
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
