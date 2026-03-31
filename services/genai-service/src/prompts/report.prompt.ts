import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Report prompt for generating structured shift summaries.
 * Includes executive summary, key incidents, and recommendations.
 */
export const reportPrompt = PromptTemplate.fromTemplate(
  `Generate a professional security shift report for the following period: {period}

Events summary:
{eventsSummary}

Stats:
- Total events: {totalEvents}
- Critical: {critical}, High: {high}, Medium: {medium}, Low: {low}
- Most active camera: {mostActiveCamera}

Write a structured report with: Executive Summary, Key Incidents, Recommendations.`
);
