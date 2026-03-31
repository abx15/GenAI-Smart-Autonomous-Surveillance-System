import { Socket } from 'socket.io';
import { logger } from '../config/env';

export const joinCameraRoom = (socket: Socket, cameraId: string) => {
  const room = `camera:${cameraId}`;
  socket.join(room);
  logger.info(`Socket ${socket.id} joined room ${room}`);
};

export const joinSeverityRoom = (socket: Socket, severity: string) => {
  const room = `severity:${severity}`;
  socket.join(room);
  logger.info(`Socket ${socket.id} joined room ${room}`);
};

export const joinAllAlertsRoom = (socket: Socket) => {
  const room = 'all-alerts';
  socket.join(room);
  logger.info(`Socket ${socket.id} joined room ${room}`);
};
