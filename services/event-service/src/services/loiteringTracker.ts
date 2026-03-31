import { logger } from '../../../../shared/utils/logger';

interface TrackEntry {
  firstSeen: number;
  lastSeen: number;
  frameCount: number;
  zoneId?: string;
}

const tracks = new Map<number, TrackEntry>();
const THRESHOLD_MS = (parseInt(process.env.LOITERING_THRESHOLD_SECONDS || '30')) * 1000;
const CLEANUP_INTERVAL_MS = 30_000;
const STALE_AFTER_MS = 60_000;

export function updateTrack(trackId: number, zoneId?: string): void {
  const now = Date.now();
  const existing = tracks.get(trackId);
  if (existing) {
    existing.lastSeen = now;
    existing.frameCount++;
    if (zoneId) existing.zoneId = zoneId;
  } else {
    tracks.set(trackId, { firstSeen: now, lastSeen: now, frameCount: 1, zoneId });
  }
}

export function isLoitering(trackId: number): boolean {
  const track = tracks.get(trackId);
  if (!track) return false;
  return (Date.now() - track.firstSeen) >= THRESHOLD_MS;
}

export function getDuration(trackId: number): number {
  const track = tracks.get(trackId);
  if (!track) return 0;
  return Math.round((Date.now() - track.firstSeen) / 1000);
}

export function removeTrack(trackId: number): void {
  tracks.delete(trackId);
}

export function startLoiteringCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    let removed = 0;
    for (const [id, track] of tracks.entries()) {
      if (now - track.lastSeen > STALE_AFTER_MS) {
        tracks.delete(id);
        removed++;
      }
    }
    if (removed > 0) logger.debug({ removed }, 'Cleaned stale loitering tracks');
  }, CLEANUP_INTERVAL_MS);
}

export function getActiveTrackCount(): number {
  return tracks.size;
}
