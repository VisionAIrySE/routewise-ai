import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Sparkles, RotateCcw, Minimize2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if any message has a route response to auto-expand
  const hasRouteResponse = useMemo(() => 
    messages.some(m => m.routeResponse), 
    [messages]
  );

  // Auto-expand when a route response is received
  useEffect(() => {
    if (hasRouteResponse && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasRouteResponse]);

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
    // Refresh routes data after saving
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={cn(
          "flex flex-col p-0 transition-all duration-300",
          isExpanded ? "w-full sm:max-w-4xl" : "w-full sm:max-w-md"
        )}
      >
        <SheetHeader className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              RouteWise AI Assistant
            </SheetTitle>
            <div className="flex items-center gap-1">
              {isExpanded && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsExpanded(false)} 
                  title="Collapse"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleNewSession} title="New Session">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                  message.routeResponse && 'flex-col items-start'
                )}
              >
                {/* Avatar - hide for route responses */}
                {!message.routeResponse && (
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      message.role === 'user' ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Message Content */}
                {message.routeResponse ? (
                  <RouteResponse response={message.routeResponse} />
                ) : (
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-4 py-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.hasRouteAction && (
                      <div className="mt-3 flex gap-2">
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
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
