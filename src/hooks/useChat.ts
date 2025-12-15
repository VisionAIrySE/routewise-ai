import { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RouteOptimizerResponse, isRouteOptimizerResponse } from '@/lib/routeUtils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRouteAction?: boolean;
  routeResponse?: RouteOptimizerResponse;
}

export interface EditRouteContext {
  action: string;
  route_id: string;
  route_date: string;
  start_time?: string | null;
  stops: any[];
  total_hours?: number | null;
  total_miles?: number | null;
  zones?: string[] | null;
  original_request?: string | null;
  hours_requested?: number | null;
  location_filter?: string | null;
  exclusions?: string[] | null;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: `Welcome, I'm Inspector Route AI! I'll help you optimize your planned routes to get the most out of your time and travel!

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
  const [editContext, setEditContext] = useState<EditRouteContext | null>(null);

  // Persist session ID across page refreshes
  const sessionId = useMemo(() => {
    const stored = localStorage.getItem('route-session-id');
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem('route-session-id', newId);
    return newId;
  }, []);

  // Check for edit route context on mount
  useEffect(() => {
    const storedContext = sessionStorage.getItem('editRouteContext');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext) as EditRouteContext;
        sessionStorage.removeItem('editRouteContext');
        setEditContext(context);

        // Add edit context message to chat
        const routeDate = format(new Date(context.route_date), 'EEEE, MMMM d, yyyy');
        const stopsCount = context.stops?.length || 0;
        const totalHours = context.total_hours?.toFixed(1) || '?';
        const zones = context.zones?.join(', ') || 'N/A';

        const editMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `**Editing Route for ${routeDate}**

I've loaded your saved route with:
• **${stopsCount} stops**
• **${totalHours} hours** total time
• **Zones:** ${zones}
${context.start_time ? `• **Start time:** ${context.start_time}` : ''}

What would you like to change? You can:
- Add or remove stops
- Change inspection durations
- Adjust start time
- Recalculate with current traffic`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, editMessage]);
      } catch (e) {
        console.error('Failed to parse edit route context:', e);
      }
    }
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
      // Get the auth token for secure proxy calls
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const proxyUrl = 'https://rsylbntdtflyoaxiwhvm.supabase.co/functions/v1/n8n-proxy';

      // Include edit context if present
      const payload: any = {
        message: content,
        session_id: sessionId,
      };

      if (editContext) {
        payload.editing_route = true;
        payload.current_route = editContext;
      }

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
  }, [sessionId, isLoading, editContext]);

  const clearSession = useCallback(() => {
    const newId = uuidv4();
    localStorage.setItem('route-session-id', newId);
    setMessages([INITIAL_MESSAGE]);
    setEditContext(null);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearSession, sessionId, editContext };
}
