import { llm } from '../llm/openai';
import { summaryPrompt } from '../prompts/summary.prompt';
import { ISurveillanceEvent } from '../models/SurveillanceEvent';
import { logger } from '../config/env';

export class SummaryService {
  /**
   * Summarize a single surveillance event in one clear sentence.
   */
  public static async summarizeEvent(event: ISurveillanceEvent): Promise<string> {
    const eventJson = JSON.stringify({
      time: event.startTime.toISOString(),
      type: event.type,
      location: event.zoneId,
      severity: event.severity,
      description: event.description
    });

    const response = await llm.invoke(
      await summaryPrompt.format({ eventJson })
    );

    return response.content as string;
  }

  /**
   * Batch summarize multiple events.
   */
  public static async batchSummarize(events: ISurveillanceEvent[]): Promise<string[]> {
    return Promise.all(events.map(e => this.summarizeEvent(e)));
  }
}
