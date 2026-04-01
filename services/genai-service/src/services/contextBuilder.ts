import mongoose from 'mongoose';

// Reference event-service Event model by collection name
const EventCollection = mongoose.connection.collection.bind(mongoose.connection);

/**
 * TIME RANGE PARSER
 * Extracts structured start/end dates from natural language time expressions.
 * 
 * Supported patterns:
 *   "last 10 minutes" / "last 10 min" → now - 10 minutes
 *   "last 2 hours"                    → now - 2 hours
 *   "today" / "aaj"                   → midnight to now
 *   "this week" / "hafta"             → 7 days ago to now
 *   (default)                         → last 30 minutes
 */
function parseTimeRange(query: string): { startTime: Date; endTime: Date; label: string } {
  const now = new Date();
  const lower = query.toLowerCase();

  const minuteMatch = lower.match(/last\s+(\d+)\s*min/);
  const hourMatch = lower.match(/last\s+(\d+)\s*hour/);
  const todayMatch = lower.match(/today|aaj/);
  const weekMatch = lower.match(/week|hafta/);

  if (minuteMatch) {
    const mins = parseInt(minuteMatch[1]);
    return { startTime: new Date(now.getTime() - mins * 60000), endTime: now, label: `last ${mins} minutes` };
  }
  if (hourMatch) {
    const hrs = parseInt(hourMatch[1]);
    return { startTime: new Date(now.getTime() - hrs * 3600000), endTime: now, label: `last ${hrs} hours` };
  }
  if (todayMatch) {
    const start = new Date(now); start.setHours(0,0,0,0);
    return { startTime: start, endTime: now, label: 'today' };
  }
  if (weekMatch) {
    return { startTime: new Date(now.getTime() - 7 * 86400000), endTime: now, label: 'last 7 days' };
  }

  // Default: last 30 minutes
  return { startTime: new Date(now.getTime() - 30 * 60000), endTime: now, label: 'last 30 minutes' };
}

export async function buildContext(query: string, cameraId?: string) {
  const timeRange = parseTimeRange(query);

  const filter: any = { startTime: { $gte: timeRange.startTime, $lte: timeRange.endTime } };
  if (cameraId) filter.cameraId = cameraId;

  // Use direct mongoose model lookup
  const Event = mongoose.models['Event'] || mongoose.model('Event', new mongoose.Schema({}, { strict: false }), 'events');
  const events = await Event.find(filter)
    .sort({ severity: -1, startTime: -1 })
    .limit(50)
    .lean();

  const formatted = events.map((e: any) => ({
    time: new Date(e.startTime).toLocaleTimeString(),
    type: e.type,
    severity: e.severity,
    camera: e.cameraId,
    zone: e.zoneName || e.zoneId || 'Unknown',
    description: e.description || `${e.type} detected`,
    duration: e.duration ? `${e.duration}s` : null,
    resolved: e.resolved,
  }));

  return { events: formatted, timeRange, count: events.length };
}
