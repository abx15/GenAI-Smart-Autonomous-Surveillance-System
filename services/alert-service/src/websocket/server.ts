import { Server } from 'socket.io';
import { logger } from '../../../shared/utils/logger';
import { alertHistory } from '../services/alertHistory';

/**
 * SOCKET.IO NAMESPACE: /alerts
 * 
 * This module manages the real-time communication channel for surveillance alerts.
 * 
 * Events this server EMITS (via broadcaster.ts):
 *   - 'alert'          → New alert generated (any severity)
 *   - 'critical_alert' → High-priority alert (severity: critical)
 *   - 'alert_history'  → Last 20 alerts (sent immediately on client connect)
 * 
 * Events this server LISTENS:
 *   - 'join_camera'    → Client subscribes to a specific camera-specific room
 *   - 'join_severity'  → Client subscribes to a specific severity-filtered room
 * 
 * Room structure:
 *   - 'camera:{cameraId}' → alerts for specific camera (e.g., camera:CAM-01)
 *   - 'severity:{level}'  → alerts filtered by severity (e.g., severity:critical)
 */
export function initSocketServer(io: Server) {
  const alertsNsp = io.of('/alerts');

  alertsNsp.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected to /alerts');

    // Send recent history on connect
    const history = alertHistory.getLast(20);
    if (history.length) socket.emit('alert_history', history);

    /**
     * Join Camera-Specific Room
     */
    socket.on('join_camera', (cameraId: string) => {
      socket.join(`camera:${cameraId}`);
    });

    /**
     * Join Severity-Filtered Room
     */
    socket.on('join_severity', (severity: string) => {
      socket.join(`severity:${severity}`);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected from /alerts');
    });
  });

  logger.info('Socket.IO /alerts namespace initialized');
}
