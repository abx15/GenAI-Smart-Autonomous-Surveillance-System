import { ChatOpenAI } from "@langchain/openai";
import { env } from '../config/env';

/**
 * OpenAI Client Singleton
 * Model: gpt-4o
 * Configured for factual, low-creativity responses (temperature 0.3)
 */
export const llm = new ChatOpenAI({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "gpt-4o",
  temperature: 0.3,
  maxTokens: 1024,
  verbose: env.NODE_ENV !== 'production'
});

export default llm;
