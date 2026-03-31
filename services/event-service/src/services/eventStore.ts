import { Event, IEvent } from '../models/Event';
import { logger } from '../../../../shared/utils/logger';

export const eventStore = {
  async getEvents(filters: {
    type?: string;
    severity?: string;
    cameraId?: string;
    resolved?: boolean;
    limit?: number;
    page?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query: any = {};
    if (filters.type) query.type = filters.type;
    if (filters.severity) query.severity = filters.severity;
    if (filters.cameraId) query.cameraId = filters.cameraId;
    if (filters.resolved !== undefined) query.resolved = filters.resolved;
    if (filters.startDate || filters.endDate) {
      query.startTime = {};
      if (filters.startDate) query.startTime.$gte = filters.startDate;
      if (filters.endDate) query.startTime.$lte = filters.endDate;
    }

    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(query).sort({ startTime: -1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(query),
    ]);

    return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getRecentEvents(minutes: number) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return Event.find({ startTime: { $gte: since } })
      .sort({ startTime: -1, severity: -1 })
      .lean();
  },

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [byType, bySeverity, total, todayTotal] = await Promise.all([
      Event.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Event.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Event.countDocuments(),
      Event.countDocuments({ startTime: { $gte: today } }),
    ]);

    const stats: any = { total, todayTotal, byType: {}, bySeverity: {}, cameras: {} };
    byType.forEach((r: any) => { stats.byType[r._id] = r.count; });
    bySeverity.forEach((r: any) => { stats.bySeverity[r._id] = r.count; });

    return stats;
  },

  async resolveEvent(eventId: string) {
    return Event.findOneAndUpdate(
      { eventId },
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
  },
};
