import { Server } from 'socket.io';
import { IAlert } from '../models/Alert';
import { alertHistory } from './alertHistory';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../websocket/server';
import { logger } from '../config/env';

class AlertBroadcaster {
  broadcast(event: any) {
    const payload: IAlert = {
      alertId: uuidv4(),
      eventId: event.id || event.eventId || uuidv4(),
      message: event.message || `Detected ${event.type}`,
      severity: event.severity || 'info',
      type: event.type,
      cameraId: event.cameraId,
      timestamp: event.timestamp || new Date().toISOString(),
      trackId: event.trackId,
      acknowledged: false
    };

    alertHistory.add(payload);

    if (io) {
      try {
        io.to('all-alerts').emit('alert', payload);
        io.to(`camera:${payload.cameraId}`).emit('alert', payload);
        io.to(`severity:${payload.severity}`).emit('alert', payload);

        if (payload.severity === 'critical') {
          io.emit('critical_alert', payload);
        }
      } catch (err) {
        logger.error('Error broadcasting alert:', err);
      }
    }
    
    return payload; // Return so the caller can save to DB
  }
}

export const alertBroadcaster = new AlertBroadcaster();
