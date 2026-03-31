import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { QueryService } from '../services/queryService';
import { SummaryService } from '../services/summaryService';
import { ReportService } from '../services/reportService';
import { Conversation } from '../models/Conversation';
import { SurveillanceEvent } from '../models/SurveillanceEvent';

export default async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  
  // POST /query
  fastify.post('/query', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string' },
          cameraId: { type: 'string' },
          conversationId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { query, cameraId, conversationId } = request.body as any;
    const userId = (request.user as any).userId || 'anonymous';

    try {
      const result = await QueryService.handleQuery(userId, query, cameraId, conversationId);
      return result;
    } catch (error: any) {
      request.log.error(error);
      return reply.status(503).send({ error: 'OpenAI Service Unavailable', message: error.message });
    }
  });

  // POST /summarize
  fastify.post('/summarize', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['eventId'],
        properties: {
          eventId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.body as any;
    
    const event = await SurveillanceEvent.findOne({ id: eventId });
    if (!event) return reply.status(404).send({ error: 'Event not found' });

    try {
      const summary = await SummaryService.summarizeEvent(event);
      return { summary };
    } catch (error: any) {
      return reply.status(503).send({ error: 'Summarization Failed', message: error.message });
    }
  });

  // POST /report
  fastify.post('/report', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['shiftStart', 'shiftEnd'],
        properties: {
          shiftStart: { type: 'string', format: 'date-time' },
          shiftEnd: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, async (request, reply) => {
    const { shiftStart, shiftEnd } = request.body as any;

    try {
      const report = await ReportService.generateShiftReport(new Date(shiftStart), new Date(shiftEnd));
      return { report: report.content, stats: report.stats };
    } catch (error: any) {
      return reply.status(503).send({ error: 'Report Generation Failed', message: error.message });
    }
  });

  // GET /conversations/:userId
  fastify.get('/conversations/:userId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { userId } = request.params as any;
    const authenticatedUserId = (request.user as any).userId;

    if (userId !== authenticatedUserId && (request.user as any).role !== 'admin') {
      return reply.status(403).send({ error: 'Unauthorized profile access' });
    }

    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
    return { conversations };
  });

  // DELETE /conversations/:conversationId
  fastify.delete('/conversations/:conversationId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { conversationId } = request.params as any;
    const userId = (request.user as any).userId;

    const result = await Conversation.deleteOne({ conversationId, userId });
    if (result.deletedCount === 0) return reply.status(404).send({ error: 'Conversation not found' });

    return { success: true };
  });

  // GET /health
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'genai-service', timestamp: new Date() };
  });
}
