import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getLLM } from '../llm/openai';
import { buildContext } from './contextBuilder';
import { Conversation } from '../models/Conversation';
import { logger } from '../../../shared/utils/logger';

const SYSTEM_PROMPT = `You are SASS-AI, an intelligent surveillance security assistant.
You analyze security events from a real-time surveillance system.

Current date/time: {currentTime}
Camera system active: {cameraCount} cameras

Surveillance events from {timeRange}:
{events}

Rules:
- Answer ONLY based on provided events — never hallucinate
- If no events match, say "No incidents recorded in this period"
- Highlight critical/high severity events first
- Use readable timestamps (e.g., "at 2:34 PM")
- Keep responses concise but complete
- Respond in the same language as the user's question (Hindi/Hinglish/English)`;

export async function handleQuery(params: {
  userId: string;
  query: string;
  cameraId?: string;
  conversationId?: string;
}): Promise<{ response: string; eventsAnalyzed: number; timeRange: string; conversationId: string }> {
  const start = Date.now();

  // Build context
  const ctx = await buildContext(params.query, params.cameraId);

  // Get or create conversation
  let conversation = params.conversationId
    ? await Conversation.findOne({ conversationId: params.conversationId })
    : null;
  if (!conversation) {
    conversation = await Conversation.create({ userId: params.userId, messages: [] });
  }

  // Build prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ...conversation.messages.slice(-5).map((m: any) => [m.role, m.content] as [string, string]),
    ['human', '{userQuery}'],
  ]);

  const chain = prompt.pipe(getLLM()).pipe(new StringOutputParser());

  let response: string;
  try {
    response = await chain.invoke({
      currentTime: new Date().toLocaleString(),
      cameraCount: '3',
      timeRange: ctx.timeRange.label,
      events: ctx.events.length > 0
        ? JSON.stringify(ctx.events, null, 2)
        : 'No events found in this time period.',
      userQuery: params.query,
    });
  } catch (err: any) {
    logger.error({ err }, 'OpenAI API error');
    if (err.status === 429) throw new Error('AI service rate limited. Please try again in a moment.');
    throw new Error('AI service temporarily unavailable.');
  }

  // Save to conversation history
  conversation.messages.push(
    { role: 'user', content: params.query, timestamp: new Date() },
    { role: 'assistant', content: response, timestamp: new Date() }
  );
  if (conversation.messages.length > 40) conversation.messages = conversation.messages.slice(-40);
  await conversation.save();

  logger.info({
    userId: params.userId,
    eventsAnalyzed: ctx.count,
    responseMs: Date.now() - start,
  }, 'AI query processed');

  return {
    response,
    eventsAnalyzed: ctx.count,
    timeRange: ctx.timeRange.label,
    conversationId: conversation.conversationId,
  };
}
