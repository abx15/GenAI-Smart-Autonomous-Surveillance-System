import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Summary prompt for a single surveillance event.
 * Aimed at providing a one-sentence human-readable snapshot.
 */
export const summaryPrompt = PromptTemplate.fromTemplate(
  `Summarize this surveillance event in one clear sentence for a security officer:
Event: {eventJson}
Format: "[Time] - [What happened] in [Location] - Severity: [level]"`
);
