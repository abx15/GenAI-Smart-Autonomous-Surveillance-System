import { Event } from '../models/Event';
import { Zone } from '../models/Zone';
import { publishEvent } from '../kafka/producer';
import { logger } from '../../../../shared/utils/logger';
import { updateTrack, isLoitering, getDuration, removeTrack } from './loiteringTracker';

// Track open (ongoing) events to avoid duplicates
const openEvents = new Map<string, string>(); // key: `${trackId}:${type}`, value: eventId

function getEventKey(trackId: number, type: string): string {
  return `${trackId}:${type}`;
}

export const eventEngine = {
  async processDetection(detection: any): Promise<void> {
    const { track_id, behavior, camera_id, zone_id, timestamp, bbox, confidence } = detection;

    if (!track_id) return;

    updateTrack(track_id, zone_id);

    const zone = zone_id ? await Zone.findOne({ zoneId: zone_id }).lean() : null;
    const now = new Date(timestamp || Date.now());

    // --- INTRUSION ---
    if (behavior === 'zone_intrusion' && zone?.type === 'restricted') {
      const key = getEventKey(track_id, 'intrusion');
      if (!openEvents.has(key)) {
        const event = await Event.create({
          type: 'intrusion',
          severity: 'critical',
          personTrackId: track_id,
          cameraId: camera_id || 'CAM-01',
          zoneId: zone_id,
          zoneName: zone?.name,
          startTime: now,
          rawDetections: [{ bbox, confidence, timestamp }],
          description: `Person entered restricted zone: ${zone?.name || zone_id}`,
        });
        openEvents.set(key, event.eventId);
        await publishEvent(event.toObject());
        logger.warn({ trackId: track_id, zone: zone?.name }, 'INTRUSION event created');
      }
    }

    // --- LOITERING ---
    if (isLoitering(track_id)) {
      const key = getEventKey(track_id, 'loitering');
      if (!openEvents.has(key)) {
        const duration = getDuration(track_id);
        const event = await Event.create({
          type: 'loitering',
          severity: 'high',
          personTrackId: track_id,
          cameraId: camera_id || 'CAM-01',
          zoneId: zone_id,
          zoneName: zone?.name,
          startTime: now,
          duration,
          rawDetections: [{ bbox, confidence, timestamp }],
          description: `Person loitering for ${duration}s on ${camera_id}`,
        });
        openEvents.set(key, event.eventId);
        await publishEvent(event.toObject());
        logger.warn({ trackId: track_id, duration }, 'LOITERING event created');
      }
    }

    // --- ZONE ENTRY ---
    if (zone_id && behavior !== 'zone_intrusion') {
      const key = getEventKey(track_id, 'zone_entry');
      if (!openEvents.has(key)) {
        const severity = zone?.type === 'restricted' ? 'high' : 'low';
        const event = await Event.create({
          type: 'zone_entry',
          severity,
          personTrackId: track_id,
          cameraId: camera_id || 'CAM-01',
          zoneId: zone_id,
          zoneName: zone?.name,
          startTime: now,
          rawDetections: [{ bbox, confidence, timestamp }],
          description: `Person entered ${zone?.name || zone_id}`,
        });
        openEvents.set(key, event.eventId);
        await publishEvent(event.toObject());
      }
    }
  },

  async closeEventsForTrack(trackId: number): Promise<void> {
    const keysToClose = [...openEvents.keys()].filter(k => k.startsWith(`${trackId}:`));
    const now = new Date();

    for (const key of keysToClose) {
      const eventId = openEvents.get(key)!;
      const event = await Event.findOne({ eventId });
      if (event && !event.endTime) {
        event.endTime = now;
        event.duration = Math.round((now.getTime() - event.startTime.getTime()) / 1000);
        await event.save();
      }
      openEvents.delete(key);
    }
    removeTrack(trackId);
  },
};
