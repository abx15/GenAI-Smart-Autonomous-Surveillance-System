'use client';
import { useState, useRef, useEffect } from 'react';
import { Button, Input, Spinner } from '@heroui/react';
import { Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';

const QUICK_QUERIES = [
  'Last 10 min mein kya hua?',
  'Any intrusions today?',
  'Critical alerts summary',
  'Generate shift report',
  'Most active camera?',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  meta?: { eventsAnalyzed: number; timeRange: string };
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🛡️ SASS-AI online. Ask me anything about surveillance activity.',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendQuery(query: string) {
    if (!query.trim() || loading) return;

    setMessages(m => [...m, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/query', {
        query,
        conversationId: convId,
      });
      setConvId(data.conversationId);
      setMessages(m => [...m, {
        role: 'assistant',
        content: data.response,
        meta: { eventsAnalyzed: data.eventsAnalyzed, timeRange: data.timeRange },
      }]);
    } catch (err: any) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: `⚠️ Error: ${err.response?.data?.message || 'AI service unavailable'}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f1a] rounded-xl border border-[#1e1e35]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e35]">
        <div className="w-7 h-7 rounded-lg bg-[#9b5eff]/20 flex items-center justify-center">
          <Bot size={15} className="text-[#9b5eff]" />
        </div>
        <span className="text-sm font-semibold text-[#f0f0f5]">SASS-AI</span>
        <div className="ml-auto">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm
              ${msg.role === 'user'
                ? 'bg-[#4d9fff]/20 text-[#f0f0f5] rounded-tr-none'
                : 'bg-[#161625] text-[#e0e0e8] rounded-tl-none border border-[#1e1e35]'
              }`}>
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                {msg.content}
              </ReactMarkdown>
              {msg.meta && (
                <div className="mt-1.5 pt-1.5 border-t border-white/10">
                  <span className="font-mono text-xs text-[#555577]">
                    {msg.meta.eventsAnalyzed} events · {msg.meta.timeRange}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#161625] border border-[#1e1e35] rounded-xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9b5eff] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick queries */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {QUICK_QUERIES.map(q => (
          <button key={q} onClick={() => sendQuery(q)} disabled={loading}
            className="shrink-0 text-xs bg-[#161625] border border-[#1e1e35] hover:border-[#9b5eff]/50
              text-[#8888aa] hover:text-[#9b5eff] rounded-full px-3 py-1 transition-colors font-mono whitespace-nowrap">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 pt-0 flex gap-2">
        <Input
          value={input}
          onValueChange={setInput}
          placeholder="Ask about surveillance activity..."
          onKeyDown={e => e.key === 'Enter' && sendQuery(input)}
          classNames={{
            base: 'flex-1',
            input: 'font-mono text-sm text-[#f0f0f5] placeholder:text-[#555577]',
            inputWrapper: 'bg-[#161625] border border-[#1e1e35] hover:border-[#9b5eff]/50 focus-within:border-[#9b5eff]',
          }}
        />
        <Button isIconOnly onPress={() => sendQuery(input)} isDisabled={loading || !input.trim()}
          className="bg-[#9b5eff] hover:bg-[#8a4fee]">
          {loading ? <Spinner size="sm" color="white" /> : <Send size={16} />}
        </Button>
      </div>
    </div>
  );
}
