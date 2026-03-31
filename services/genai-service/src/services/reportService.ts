import { v4 as uuidv4 } from 'uuid';
import { llm } from '../llm/openai';
import { reportPrompt } from '../prompts/report.prompt';
import { ContextBuilder } from './contextBuilder';
import { Report } from '../models/Report';
import { logger } from '../config/env';

export class ReportService {
  /**
   * Generate a professional security shift report for a given time period.
   * Caches results in MongoDB to avoid redundant LLM calls.
   */
  public static async generateShiftReport(shiftStart: Date, shiftEnd: Date) {
    // 1. Check Cache
    const existingReport = await Report.findOne({ 
      shiftStart: { $gte: shiftStart }, 
      shiftEnd: { $lte: shiftEnd } 
    }).sort({ createdAt: -1 });

    if (existingReport) {
      logger.info({ shiftStart, shiftEnd }, 'Returning cached shift report');
      return existingReport;
    }

    // 2. Aggregate Data
    const events = await ContextBuilder.fetchRelevantEvents(shiftStart, shiftEnd);
    const stats = this.calculateStats(events);
    const eventsSummary = ContextBuilder.formatEventsForPrompt(events);

    // 3. Generate Content
    const response = await llm.invoke(
      await reportPrompt.format({
        period: `${shiftStart.toLocaleString()} - ${shiftEnd.toLocaleString()}`,
        eventsSummary,
        totalEvents: stats.totalEvents,
        critical: stats.critical,
        high: stats.high,
        medium: stats.medium,
        low: stats.low,
        mostActiveCamera: stats.mostActiveCamera
      })
    );

    const content = response.content as string;

    // 4. Save and Return
    const newReport = new Report({
      reportId: uuidv4(),
      shiftStart,
      shiftEnd,
      content,
      stats
    });

    await newReport.save();
    return newReport;
  }

  private static calculateStats(events: any[]) {
    const stats = {
      totalEvents: events.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      mostActiveCamera: 'N/A'
    };

    const cameraCounts: Record<string, number> = {};

    events.forEach(e => {
      // Severity count
      if (e.severity in stats) {
        (stats as any)[e.severity]++;
      }

      // Camera activity
      cameraCounts[e.cameraId] = (cameraCounts[e.cameraId] || 0) + 1;
    });

    // Find most active camera
    let max = 0;
    for (const [camId, count] of Object.entries(cameraCounts)) {
      if (count > max) {
        max = count;
        stats.mostActiveCamera = camId;
      }
    }

    return stats;
  }
}
