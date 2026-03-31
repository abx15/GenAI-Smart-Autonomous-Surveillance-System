"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, History, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import api from "../../lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    eventsAnalyzed?: number;
    timeRange?: string;
  };
  timestamp: Date;
}

const exampleQueries = [
  "Any intrusions in last 30 mins?",
  "Summarize today's critical alerts",
  "Show me loitering trends for Cam 1",
  "Generate daily shift report"
];

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "SASS GenAI Assistant online. Tactical intelligence analysis ready. How can I assist with surveillance operations?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/genai/query", { query: text });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.summary || "Analysis complete.",
        metadata: {
          eventsAnalyzed: data.eventsAnalyzed || 0,
          timeRange: data.timeRange || "N/A",
        },
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error: Could not establish secure link to GenAI core. System overload or network failure.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-card-border/50 bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <CardTitle className="text-sm font-mono tracking-widest p-0">GENAI TACTICAL HUB</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase">Ready</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col h-[400px]">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-card-border"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-3 py-2 text-xs font-mono border",
                msg.role === "user" 
                  ? "bg-primary/10 border-primary/30 text-primary" 
                  : "bg-card border-card-border text-foreground"
              )}>
                <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
                
                {msg.metadata && (
                  <div className="mt-2 pt-2 border-t border-card-border/50 text-[9px] text-muted flex gap-3 uppercase">
                    <span>Events: {msg.metadata.eventsAnalyzed}</span>
                    <span>Range: {msg.metadata.timeRange}</span>
                  </div>
                )}
              </div>
              <span className="text-[8px] text-muted font-mono uppercase">
                {msg.role} // {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="bg-card border border-card-border p-3 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="font-mono text-[10px] text-primary animate-pulse tracking-widest">
                  DECRYPTING DATA...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-card-border bg-card/20">
          <div className="flex flex-wrap gap-2 mb-3">
            {exampleQueries.map((q) => (
              <button 
                key={q} 
                className="text-[9px] font-mono border border-card-border px-2 py-1 hover:border-primary hover:text-primary transition-colors uppercase tracking-tight"
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 relative">
            <input 
              className="flex-1 bg-black/40 border border-card-border p-3 text-xs font-mono focus:outline-none focus:border-primary transition-all text-primary placeholder:text-muted"
              placeholder="ENTER ANALYTICAL COMMAND..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button 
              size="icon" 
              className="w-12 h-12"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
