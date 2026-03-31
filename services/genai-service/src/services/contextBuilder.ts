import { SurveillanceEvent, ISurveillanceEvent } from '../models/SurveillanceEvent';

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

/**
 * Service for building the RAG context from surveillance events.
 */
export class ContextBuilder {
  /**
   * Parse natural language time queries.
   * Supports: "last 10 minutes", "past 1 hour", "today", "between 2pm and 3pm"
   */
  public static parseTimeQuery(query: string): TimeRange {
    const now = new Date();
    let startTime = new Date(now.getTime() - 30 * 60 * 1000); // Default: last 30 mins
    let endTime = now;

    const lowerQuery = query.toLowerCase();

    // "last X minutes" / "past X minutes"
    const minMatch = lowerQuery.match(/(?:last|past)\s+(\d+)\s+min(?:ute)?s?/);
    if (minMatch) {
      const mins = parseInt(minMatch[1], 10);
      startTime = new Date(now.getTime() - mins * 60 * 1000);
      return { startTime, endTime };
    }

    // "last X hours" / "past X hours"
    const hourMatch = lowerQuery.match(/(?:last|past)\s+(\d+)\s+hour?s?/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1], 10);
      startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
      return { startTime, endTime };
    }

    // "today"
    if (lowerQuery.includes('today')) {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startTime, endTime };
    }

    // "between 2pm and 3pm" (Simple relative to today)
    const betweenMatch = lowerQuery.match(/between\s+(\d+)\s*(am|pm)\s+and\s+(\d+)\s*(am|pm)/i);
    if (betweenMatch) {
      const startHour = this.parseHour(betweenMatch[1], betweenMatch[2]);
      const endHour = this.parseHour(betweenMatch[3], betweenMatch[4]);
      
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour);
      return { startTime, endTime };
    }

    return { startTime, endTime };
  }

  private static parseHour(hourStr: string, ampm: string): number {
    let hour = parseInt(hourStr, 10);
    if (ampm.toLowerCase() === 'pm' && hour < 12) hour += 12;
    if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
    return hour;
  }

  /**
   * Fetch events from MongoDB based on time and filters.
   * Limited to 50 events for token management.
   */
  public static async fetchRelevantEvents(
    startTime: Date, 
    endTime: Date, 
    filters: any = {}
  ): Promise<ISurveillanceEvent[]> {
    const query = {
      startTime: { $gte: startTime, $lte: endTime },
      ...filters
    };

    // Return max 50 events (sorted by severity desc, then time desc)
    // Severity order: critical > high > medium > low
    const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

    const events = await SurveillanceEvent.find(query)
      .sort({ startTime: -1 }) // Recent first
      .limit(100); // Get more than 50 to sort by severity manually if needed, or use $addFields

    // In-memory sort by severity weight, then time
    events.sort((a, b) => {
      const sevA = severityOrder[a.severity] || 0;
      const sevB = severityOrder[b.severity] || 0;
      if (sevA !== sevB) return sevB - sevA;
      return b.startTime.getTime() - a.startTime.getTime();
    });

    return events.slice(0, 50);
  }

  /**
   * Format events into a string for the GPT prompt context.
   */
  public static formatEventsForPrompt(events: ISurveillanceEvent[]): string {
    if (events.length === 0) return "No events found.";

    return events.map(e => {
      const time = e.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `[${time}] - ${e.type.toUpperCase()} in ${e.zoneId} - Severity: ${e.severity} - Camera: ${e.cameraId} - ${e.description || 'No description'}`;
    }).join('\n');
  }
}
