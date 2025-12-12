import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RouteOptimizerResponse, isRouteOptimizerResponse } from '@/lib/routeUtils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRouteAction?: boolean;
  routeResponse?: RouteOptimizerResponse;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: `Welcome, I'm RouteWise! I'll help you optimize your planned routes to get the most out of your time and travel!

Tell me your availability (e.g., "I have 4 hours tomorrow, starting at 9AM.") and I'll create the most efficient route considering:

• Urgent deadlines
• Preset appointments
• Geographic clustering
• Drive time optimization

Feel free to adjust the route and add or delete stops from your uploaded pipeline as we go. Let's get started!`,
  timestamp: new Date(),
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist session ID across page refreshes
  const sessionId = useMemo(() => {
    const stored = localStorage.getItem('route-session-id');
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem('route-session-id', newId);
    return newId;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setError(null);
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const webhookUrl = 'https://visionairy.app.n8n.cloud/webhook/route-query';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if this is a route optimizer response with route_plan
      let routeResponse: RouteOptimizerResponse | undefined;
      let displayContent: string;
      
      if (isRouteOptimizerResponse(data)) {
        routeResponse = data;
        displayContent = data.route_plan; // Will be rendered as markdown
      } else {
        // Extract response text from various possible formats
        displayContent = data.response || data.message || data.output || data.text || 
          (typeof data === 'string' ? data : JSON.stringify(data));
      }
      
      // Check if response contains route data (for legacy responses)
      const hasRoute = !routeResponse && displayContent.toLowerCase().includes('route') && 
        (displayContent.includes('1.') || displayContent.includes('stops'));

      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: displayContent,
        timestamp: new Date(),
        hasRouteAction: hasRoute,
        routeResponse,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the route optimizer. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  const clearSession = useCallback(() => {
    const newId = uuidv4();
    localStorage.setItem('route-session-id', newId);
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearSession, sessionId };
}
