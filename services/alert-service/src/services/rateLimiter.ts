const lastSentMap = new Map<string, number>();
const RATE_LIMIT_MS = parseInt(process.env.ALERT_RATE_LIMIT_SECONDS || '10') * 1000;

export function shouldSend(trackId: number, type: string): boolean {
  const key = `${trackId}:${type}`;
  const last = lastSentMap.get(key);
  const now = Date.now();
  if (!last || now - last > RATE_LIMIT_MS) {
    lastSentMap.set(key, now);
    return true;
  }
  return false;
}
