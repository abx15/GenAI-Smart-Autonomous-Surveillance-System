import { FastifyInstance } from 'fastify';
import { handleQuery } from '../services/queryService';
import { Conversation } from '../models/Conversation';
import { logger } from '../../../shared/utils/logger';

export async function aiRoutes(app: FastifyInstance) {

  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'genai-service', timestamp: new Date().toISOString() }
  }));

  // POST /query
  app.post('/query', async (req, reply) => {
    try {
      const { query, cameraId, conversationId } = req.body as any;
      if (!query?.trim()) {
        return reply.status(400).send({ success: false, error: 'INVALID_INPUT', message: 'Query is required' });
      }

      // Get userId from JWT (if auth middleware present) or default
      const userId = (req as any).user?.userId || 'anonymous';

      const result = await handleQuery({ userId, query, cameraId, conversationId });
      return { success: true, ...result };
    } catch (err: any) {
      logger.error({ err }, 'POST /query failed');
      return reply.status(500).send({ success: false, error: 'AI_ERROR', message: err.message });
    }
  });

  // POST /summarize
  app.post('/summarize', async (req, reply) => {
    try {
      const { eventId } = req.body as any;
      if (!eventId) return reply.status(400).send({ success: false, error: 'INVALID_INPUT', message: 'eventId required' });

      const Event = (await import('mongoose')).default.model('Event');
      const event = await Event.findOne({ eventId }).lean();
      if (!event) return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Event not found' });

      const result = await handleQuery({
        userId: 'system',
        query: `Summarize this event in one sentence for a security officer: ${JSON.stringify(event)}`,
      });

      return { success: true, data: { summary: result.response } };
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: 'AI_ERROR', message: err.message });
    }
  });

  // POST /report
  app.post('/report', async (req, reply) => {
    try {
      const { shiftStart, shiftEnd } = req.body as any;
      const query = `Generate a security shift report for the period from ${shiftStart} to ${shiftEnd}. Include all events, key incidents, and recommendations.`;
      const result = await handleQuery({ userId: 'system', query });
      return { success: true, data: { report: result.response, generatedAt: new Date().toISOString() } };
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: 'AI_ERROR', message: err.message });
    }
  });

  // GET /conversations/:userId
  app.get('/conversations/:userId', async (req, reply) => {
    try {
      const { userId } = req.params as any;
      const conversations = await Conversation.find({ userId })
        .sort({ updatedAt: -1 }).select('-messages').lean();
      return { success: true, data: conversations };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch conversations' });
    }
  });

  // DELETE /conversations/:conversationId
  app.delete('/conversations/:conversationId', async (req, reply) => {
    try {
      const { conversationId } = req.params as any;
      await Conversation.findOneAndDelete({ conversationId });
      return { success: true, message: 'Conversation deleted' };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Failed to delete conversation' });
    }
  });
}
