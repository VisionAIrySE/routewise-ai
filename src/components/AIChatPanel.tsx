import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Sparkles, RotateCcw, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { RouteResponse } from '@/components/RouteResponse';

interface AIChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatPanel({ open, onOpenChange }: AIChatPanelProps) {
  const { messages, isLoading, sendMessage, clearSession } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if any message has a route response
  const hasRouteResponse = useMemo(() => 
    messages.some(m => m.routeResponse), 
    [messages]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveRoute = () => {
    queryClient.invalidateQueries({ queryKey: ['routes'] });
    toast({
      title: 'Route Saved',
      description: 'The route has been saved to your calendar.',
    });
  };

  const handleNewSession = () => {
    clearSession();
    toast({
      title: 'New Session',
      description: 'Started a new conversation.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "flex flex-col p-0 gap-0 max-h-[85vh] h-[700px]",
          hasRouteResponse ? "w-full max-w-4xl" : "w-full max-w-2xl"
        )}
      >
        <DialogHeader className="border-b border-border px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              RouteWise AI Assistant
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleNewSession} title="New Session">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-5 py-5">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-base">How can I help you plan your routes today?</p>
                <p className="text-sm mt-2">Try asking me to optimize your schedule or prioritize inspections.</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                  message.routeResponse && 'flex-col items-start'
                )}
              >
                {/* Avatar - hide for route responses */}
                {!message.routeResponse && (
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      message.role === 'user' ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Message Content */}
                {message.routeResponse ? (
                  <RouteResponse response={message.routeResponse} />
                ) : (
                  <div
                    className={cn(
                      'max-w-[80%] rounded-xl px-5 py-4 text-base',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.hasRouteAction && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={handleSaveRoute}>
                          Save Route
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setInput('Modify this route')}>
                          Modify
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="rounded-xl bg-muted px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-5 flex-shrink-0">
          <div className="flex gap-3">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-base h-12"
            />
            <Button
              size="lg"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-12 px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
