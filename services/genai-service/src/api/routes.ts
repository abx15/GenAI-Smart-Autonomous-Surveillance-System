import { FastifyInstance } from 'fastify';
import { handleQuery } from '../services/queryService';
import { Conversation } from '../models/Conversation';
import { logger } from '../../../shared/utils/logger';

export async function aiRoutes(app: FastifyInstance) {

  /**
   * @route   GET /health
   * @desc    Check GenAI service health and status
   * @access  Public
   * @returns { success, data: { status, service, timestamp } }
   */
  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'genai-service', timestamp: new Date().toISOString() }
  }));

  /**
   * @route   POST /query
   * @desc    Process a natural language query about surveillance events
   * @access  Private
   * @body    { query: string, cameraId?: string, conversationId?: string }
   * @returns { success, response: string, eventsAnalyzed: number, timeRange: string, conversationId: string }
   * @example Body: { "query": "Last 10 minutes mein kya hua?" }
   * @note    - Automatically parses time range from query ("last 10 min", "today", "aaj")
   *          - Fetches up to 50 matching events as context for GPT-4o
   *          - Maintains conversation history (last 5 messages) for follow-up questions
   *          - Supports Hindi, Hinglish, and English queries
   */
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

  /**
   * @route   POST /summarize
   * @desc    Generate a one-line human-readable summary of a specific event
   * @access  Private
   * @body    { eventId: string }
   * @returns { success, data: { summary: string } }
   * @note    Uses GPT-4o to create security-officer-friendly summary
   */
  app.post('/summarize', async (req, reply) => {
    try {
      const { eventId } = req.body as any;
      if (!eventId) return reply.status(400).send({ success: false, error: 'INVALID_INPUT', message: 'eventId required' });

      // Dynamic import to avoid circular dependency
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

  /**
   * @route   POST /report
   * @desc    Generate a full AI shift report for a given time period
   * @access  Private
   * @body    { shiftStart: ISO string, shiftEnd: ISO string }
   * @returns { success, data: { report: string (markdown), generatedAt: string } }
   * @note    Report includes: Executive Summary, Key Incidents, Recommendations
   */
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

  /**
   * @route   GET /conversations/:userId
   * @desc    Get chat history for a specific user
   * @access  Private
   * @param   {string} userId - Unique user ID
   * @returns { success, data: Conversation[] }
   */
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

  /**
   * @route   DELETE /conversations/:conversationId
   * @desc    Delete a specific conversation history
   * @access  Private
   * @param   {string} conversationId - Unique conversation ID
   * @returns { success, message: 'Conversation deleted' }
   */
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
