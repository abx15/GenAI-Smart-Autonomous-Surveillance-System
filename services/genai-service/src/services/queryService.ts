import { v4 as uuidv4 } from 'uuid';
import { llm } from '../llm/openai';
import { queryPrompt } from '../prompts/query.prompt';
import { ContextBuilder } from './contextBuilder';
import { Conversation, IMessage } from '../models/Conversation';
import { logger } from '../config/env';

export class QueryService {
  /**
   * Handle natural language queries about surveillance events.
   * Orchestrates the RAG (Retrieval-Augmented Generation) flow.
   */
  public static async handleQuery(
    userId: string, 
    query: string, 
    cameraIdFilter?: string,
    conversationId?: string
  ) {
    const startTimeTracking = Date.now();
    logger.info({ userId, query: query.substring(0, 100), cameraIdFilter }, 'Processing NL Query');

    // 1. Context Retrieval (RAG)
    const timeRange = ContextBuilder.parseTimeQuery(query);
    const filters = cameraIdFilter ? { cameraId: cameraIdFilter } : {};
    const events = await ContextBuilder.fetchRelevantEvents(timeRange.startTime, timeRange.endTime, filters);
    
    const formattedEvents = ContextBuilder.formatEventsForPrompt(events);
    const cameraCount = 10; // Placeholder: In a real system, fetch active camera count

    // 2. Chat History Management
    let conversation = await this.getOrCreateConversation(userId, conversationId);
    const history = conversation.messages.slice(-5); // Include last 5 messages for continuity

    // 3. Prompt Execution
    const response = await llm.invoke(
      await queryPrompt.format({
        currentTime: new Date().toLocaleString(),
        cameraCount,
        events: formattedEvents,
        userQuery: query
      })
    );

    const responseText = response.content as string;

    // 4. Persistence (Conversation History)
    await this.updateConversation(conversation, query, responseText);

    const responseTimeMs = Date.now() - startTimeTracking;
    logger.info({ 
      userId, 
      eventsAnalyzed: events.length, 
      responseTimeMs 
    }, 'Query Handled');

    return {
      response: responseText,
      eventsAnalyzed: events.length,
      timeRange: {
        start: timeRange.startTime.toISOString(),
        end: timeRange.endTime.toISOString()
      },
      conversationId: conversation.conversationId
    };
  }

  private static async getOrCreateConversation(userId: string, conversationId?: string) {
    if (conversationId) {
      const conv = await Conversation.findOne({ conversationId, userId });
      if (conv) return conv;
    }

    return new Conversation({
      conversationId: conversationId || uuidv4(),
      userId,
      messages: []
    });
  }

  private static async updateConversation(conversation: any, userQuery: string, assistantResponse: string) {
    const userMsg: IMessage = { role: 'user', content: userQuery, timestamp: new Date() };
    const assistantMsg: IMessage = { role: 'assistant', content: assistantResponse, timestamp: new Date() };

    conversation.messages.push(userMsg, assistantMsg);

    // Maintain max 20 messages per conversation
    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    await conversation.save();
  }
}
