import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { env, logger } from './config/env';
import { initWebSocket, io } from './websocket/server';
import { startKafkaConsumer, stopKafkaConsumer } from './kafka/consumer';
import { alertHistory } from './services/alertHistory';
import { Alert } from './models/Alert';

const fastify = Fastify({
  logger: pinoLogger() // if needed, otherwise skip
});

function pinoLogger() {
    return false; // we use our custom pino logger manually
}

// Plugins
fastify.register(cors, {
  origin: env.CORS_ORIGIN,
});

fastify.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

fastify.register(socketioServer, {
  cors: { origin: env.CORS_ORIGIN },
  path: '/socket.io',
  pingTimeout: 60000,
  pingInterval: 25000
});

// Routes
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date(), service: 'alert-service' };
});

fastify.get('/alerts/history', async (request, reply) => {
  const query = request.query as { limit?: string };
  const limit = parseInt(query.limit || '50', 10);
  const alerts = await Alert.find().sort({ timestamp: -1 }).limit(limit);
  return { alerts };
});

fastify.get('/alerts/unacknowledged', async (request, reply) => {
  const alerts = await Alert.find({ acknowledged: false }).sort({ timestamp: -1 });
  return { alerts };
});

fastify.put('/alerts/:alertId/acknowledge', async (request, reply) => {
  const { alertId } = request.params as { alertId: string };
  const alert = await Alert.findOneAndUpdate(
    { alertId },
    { acknowledged: true },
    { new: true }
  );
  if (!alert) return reply.status(404).send({ error: 'Alert not found' });
  
  // optionally broadcast acknowledgment event via io if needed
  // io.to('all-alerts').emit('alert_acknowledged', { alertId });

  return { success: true, alert };
});

fastify.get('/stats/live', async (request, reply) => {
  if (!io) return { error: 'socket.io not initialized yet' };

  let activeConnections = 0;
  io.of('/alerts').sockets.forEach(() => { activeConnections++; });
  const roomsCount = io.of('/alerts').adapter.rooms.size;

  return { activeConnections, roomsCount };
});

// App Lifecycle
const startServer = async () => {
  try {
    // MongoDB
    await mongoose.connect(env.MONGO_URI);
    logger.info('✅ Connected to MongoDB');

    // DB Init - restore history
    try {
      const recentAlerts = await Alert.find().sort({ timestamp: -1 }).limit(100);
      recentAlerts.reverse().forEach(a => alertHistory.add(a.toObject()));
    } catch (e) {
      logger.error('Could not restore alert history from DB on startup', e);
    }

    // Socket Initialization
    await fastify.ready();
    initWebSocket(fastify);

    // Kafka
    await startKafkaConsumer();

    // Start
    const port = parseInt(env.PORT, 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`🚀 Alert Service running on http://0.0.0.0:${port}`);
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down...');
  
  try {
    const alerts = alertHistory.getAll();
    // We already persist inside consumer, but maybe we want to save any unflushed
    // Not strictly needed since each alert is saved when generated
  } catch (err) {
    logger.error('Error on graceful shutdown:', err);
  }

  await stopKafkaConsumer();
  await fastify.close();
  await mongoose.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
