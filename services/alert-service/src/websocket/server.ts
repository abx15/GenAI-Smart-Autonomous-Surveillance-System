import { Server } from 'socket.io';
import { logger } from '../../../shared/utils/logger';
import { alertHistory } from '../services/alertHistory';

export function initSocketServer(io: Server) {
  const alertsNsp = io.of('/alerts');

  alertsNsp.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected to /alerts');

    // Send recent history on connect
    const history = alertHistory.getLast(20);
    if (history.length) socket.emit('alert_history', history);

    // Join rooms
    socket.on('join_camera', (cameraId: string) => {
      socket.join(`camera:${cameraId}`);
    });

    socket.on('join_severity', (severity: string) => {
      socket.join(`severity:${severity}`);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected from /alerts');
    });
  });

  logger.info('Socket.IO /alerts namespace initialized');
}
