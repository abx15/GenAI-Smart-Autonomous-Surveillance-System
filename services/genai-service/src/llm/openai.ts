import { ChatOpenAI } from '@langchain/openai';
import { validateEnv } from '../config/env';

let _llm: ChatOpenAI | null = null;

export function getLLM(): ChatOpenAI {
  if (!_llm) {
    const env = validateEnv();
    _llm = new ChatOpenAI({
      modelName: env.OPENAI_MODEL,
      temperature: env.OPENAI_TEMPERATURE,
      maxTokens: env.OPENAI_MAX_TOKENS,
      openAIApiKey: env.OPENAI_API_KEY,
    });
  }
  return _llm;
}
