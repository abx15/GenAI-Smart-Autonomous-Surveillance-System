import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import dns from 'dns';

// DNS override for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: ['http://localhost:3006', 'http://localhost:3000'],
  credentials: true,
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'default-secret',
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'alert-service', timestamp: new Date().toISOString() };
});

// Alert routes
fastify.get('/api/alerts/history', async () => {
  try {
    // Mock alert history
    const alerts = [
      {
        alertId: 'alert-001',
        eventId: 'event-001',
        message: 'INTRUSION detected in zone-001 - critical priority',
        severity: 'critical',
        type: 'intrusion',
        cameraId: 'CAM-01',
        timestamp: new Date(),
        trackId: 1,
        acknowledged: false
      }
    ];
    return { success: true, data: alerts };
  } catch (error: any) {
    throw new Error(error.message);
  }
});

fastify.get('/api/alerts/unacknowledged', async () => {
  try {
    // Mock unacknowledged alerts
    const alerts = [
      {
        alertId: 'alert-001',
        message: 'Critical intrusion at Main Gate',
        severity: 'critical',
        cameraId: 'CAM-01',
        timestamp: new Date(),
        acknowledged: false
      }
    ];
    return { success: true, data: alerts };
  } catch (error: any) {
    throw new Error(error.message);
  }
});

// MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log('✅ Alert Service - MongoDB connected');
  } catch (error) {
    console.error('❌ Alert Service - MongoDB connection failed:', error);
  }
}

// Start server
async function startServer() {
  await connectDB();
  
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 3003 });
    console.log(`🚀 Alert Service running on port ${process.env.PORT || 3003}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer().catch(console.error);
