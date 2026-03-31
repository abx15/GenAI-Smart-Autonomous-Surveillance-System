import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { env, logger } from '../config/env';
import { alertHistory } from '../services/alertHistory';
import { joinAllAlertsRoom, joinCameraRoom, joinSeverityRoom } from './rooms';

export let io: Server;

export const initWebSocket = (fastify: FastifyInstance) => {
  io = fastify.io; // assuming fastify-socket.io plugin attaches `io` to fastify

  // Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token as string;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // We assume fastify.jwt plugin is registered and can verify
      // But verify() is async or sync. Using standard fastify jwt verify method
      const decoded = fastify.jwt.verify(token);
      (socket as any).user = decoded;
      next();
    } catch (err: any) {
      logger.error('Socket authentication failed:', err.message);
      next(new Error('Authentication error'));
    }
  });

  const alertsNamespace = io.of('/alerts');
  const streamNamespace = io.of('/stream');

  alertsNamespace.on('connection', (socket) => {
    logger.info(`Client connected to /alerts: ${socket.id}`);
    
    // Automatically join all alerts room on connection
    joinAllAlertsRoom(socket);

    // Provide initial state
    const recentAlerts = alertHistory.getLast(20);
    socket.emit('initial_state', recentAlerts);

    socket.on('join_camera', (cameraId: string) => {
      joinCameraRoom(socket, cameraId);
    });

    socket.on('join_severity', (severity: string) => {
      joinSeverityRoom(socket, severity);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from /alerts: ${socket.id}`);
    });
  });

  streamNamespace.on('connection', (socket) => {
    logger.info(`Client connected to /stream: ${socket.id}`);
    
    socket.on('disconnect', () => {
      logger.info(`Client disconnected from /stream: ${socket.id}`);
    });
  });
};
