import { logger } from '../config/env';

class RateLimiter {
  private cache: Map<string, number> = new Map();
  private readonly COOLDOWN_MS = 10 * 1000; // 10 seconds

  // Clean cache periodically to avoid memory leaks
  constructor() {
    setInterval(() => this.cleanup(), 60000);
  }

  shouldSend(event: any): boolean {
    // If there is no trackId, we might not want to rate limit, or maybe limit by cameraId + type
    const trackId = event.trackId || `notrack-${event.cameraId}`;
    const eventType = event.type;
    const key = `${trackId}:${eventType}`;
    
    const now = Date.now();
    const lastSent = this.cache.get(key) || 0;

    if (now - lastSent > this.COOLDOWN_MS) {
      this.cache.set(key, now);
      return true;
    }
    logger.debug(`Rate limited alert for key: ${key}`);
    return false;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.cache.entries()) {
      if (now - timestamp > this.COOLDOWN_MS) {
        this.cache.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
