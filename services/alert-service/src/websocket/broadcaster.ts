import { Server } from 'socket.io';
import { alertHistory } from '../services/alertHistory';
import { logger } from '../../../shared/utils/logger';

export function broadcastAlert(io: Server, alert: any) {
  const alertsNsp = io.of('/alerts');

  alertHistory.add(alert);

  // Broadcast to all
  alertsNsp.to('all-alerts').emit('alert', alert);
  alertsNsp.emit('alert', alert); // all connected clients

  // Room-specific
  if (alert.cameraId) alertsNsp.to(`camera:${alert.cameraId}`).emit('alert', alert);
  if (alert.severity) alertsNsp.to(`severity:${alert.severity}`).emit('alert', alert);

  // Critical: separate event
  if (alert.severity === 'critical') {
    alertsNsp.emit('critical_alert', alert);
    logger.warn({ alertId: alert.alertId, message: alert.message }, '🚨 CRITICAL ALERT broadcast');
  }
}
