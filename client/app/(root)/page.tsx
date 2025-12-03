'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, BarChart3, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import TrafficSidebar from '@/features/main/components/app-sidebar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StatsData {
  total_records: number;
  urban_accidents: number;
  vehicle_types: Record<string, number>;
}

export default function TrafficChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (statsData) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Hello! 👋 I'm your Traffic Data Assistant. I can help you analyze traffic patterns and accident statistics from our database of ${statsData.total_records.toLocaleString()} recorded incidents.\n\nTry asking me about:\n• Urban vs Rural accidents (${statsData.urban_accidents.toLocaleString()} urban incidents)\n• Weather conditions impact\n• Peak accident times\n• Severity levels\n• Vehicle types involved (${Object.keys(statsData.vehicle_types).length} different types)\n• Safety recommendations`
      };
      setMessages([welcomeMessage]);
    }
  }, [statsData]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/stats', {
          method: 'GET'
        });

        if (!response.ok) {
          console.log("Error response:", response.status);
          return;
        }

        const data = await response.json();
        console.log('data', JSON.stringify(data, null, 2))
        setStatsData(data)
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchStats();
  }, []);




  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: currentInput })
      });


      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || 'Sorry, I could not process your request.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false)
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Hello! 👋 I\'m your Traffic Data Assistant. I can help you analyze traffic patterns and accident statistics from our database of 4,738 recorded incidents.\n\nTry asking me about:\n• Urban vs Rural accidents\n• Weather conditions impact\n• Peak accident times\n• Severity levels\n• Vehicle types involved\n• Safety recommendations'
    };
    setMessages([welcomeMessage]);
  };

  const quickQuestions = [
    { text: "Urban vs rural accidents", icon: "🏙️" },
    { text: "Weather impact", icon: "🌤️" },
    { text: "Peak accident times", icon: "⏰" },
    { text: "Accident severity", icon: "🚨" },
    { text: "Safety tips", icon: "💡" }
  ];

  return (
    <SidebarProvider>
      <TrafficSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h1 className="text-sm font-semibold">Traffic Analysis Assistant</h1>
              <Badge variant="secondary" className="ml-2 hidden sm:flex">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          {messages.length === 1 && (
            <div className="border-b bg-linear-to-r from-muted/50 to-muted/30 py-4">
              <div className="container mx-auto px-4">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Quick questions to get started:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(question.text)}
                      className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <span className="mr-1.5">{question.icon}</span>
                      {question.text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 px-4">
            <div className="container mx-auto py-6 space-y-6 max-w-4xl">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <Card
                    className={`max-w-[85%] sm:max-w-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border-muted'
                      }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed wrap-break-word">{msg.content}</p>
                  </Card>
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-muted to-muted/80 flex items-center justify-center shrink-0 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <Card className="px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing data...</span>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about traffic patterns, accidents, safety tips..."
                  disabled={loading}
                  className="flex-1 shadow-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}