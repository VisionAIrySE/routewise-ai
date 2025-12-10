import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRouteAction?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: `Welcome! I can help you plan optimized routes. Tell me your availability (e.g., "I have 4 hours tomorrow starting at 9am") and I'll create an efficient route considering:

• Urgent deadlines
• Fixed SIG appointments  
• Geographic clustering
• Drive time optimization`,
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
      
      // Extract response text from various possible formats
      const responseText = data.response || data.message || data.output || data.text || 
        (typeof data === 'string' ? data : JSON.stringify(data));
      
      // Check if response contains route data
      const hasRoute = responseText.toLowerCase().includes('route') && 
        (responseText.includes('1.') || responseText.includes('stops'));

      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        hasRouteAction: hasRoute,
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
