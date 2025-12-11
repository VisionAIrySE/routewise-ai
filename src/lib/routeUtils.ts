export interface RouteStop {
  id: string;
  order: number;
  lat: number;
  lng: number;
  name: string;
  address: string;
  company: string;
  urgency: string;
  duration_minutes: number;
  drive_minutes_to_next: number | null;
  needs_call_ahead: boolean;
  scheduled_time?: string;
}

export interface RouteDay {
  day: string;
  date: string;
  summary: {
    stops: number;
    total_route_hours: number;
    total_drive_hours: number;
    inspection_hours: number;
    total_distance_miles: number;
    estimated_fuel: number;
    zones: string[];
  };
  stops: RouteStop[];
}

export interface HomeBase {
  lat: number;
  lng: number;
  address: string;
}

export interface RouteOptimizerResponse {
  success: boolean;
  query: string;
  query_date: string;
  available_hours: number | null;
  total_pending: number;
  urgency_counts: {
    CRITICAL: number;
    URGENT: number;
    SOON: number;
    NORMAL: number;
    UNKNOWN: number;
  };
  route_plan?: string;
  ai_summary?: string;
  optimized_routes?: RouteDay[];
  home_base?: HomeBase;
  generated_at: string;
  deferred?: string[];
  deferred_reason?: string;
}

export function isRouteOptimizerResponse(data: unknown): data is RouteOptimizerResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.success === true &&
    (typeof obj.route_plan === 'string' || Array.isArray(obj.optimized_routes)) &&
    obj.urgency_counts !== undefined
  );
}

export function hasOptimizedRoutes(response: RouteOptimizerResponse): boolean {
  return !!(
    response.optimized_routes &&
    response.optimized_routes.length > 0 &&
    response.optimized_routes[0].stops &&
    response.optimized_routes[0].stops.length > 0
  );
}

export function parseRouteResponse(content: string): RouteOptimizerResponse | null {
  try {
    const parsed = JSON.parse(content);
    if (isRouteOptimizerResponse(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON or not a route response
  }
  return null;
}

export function extractAddresses(response: RouteOptimizerResponse): string[] {
  // First try optimized_routes if it has actual stops
  if (response.optimized_routes && response.optimized_routes.length > 0) {
    const addresses = response.optimized_routes.flatMap(route =>
      (route.stops || []).map(stop => stop.address)
    );
    if (addresses.length > 0) {
      return addresses;
    }
  }

  // Fall back to parsing route_plan markdown
  if (response.route_plan) {
    const text = response.route_plan;

    // Try EXPORT FOR NAVIGATION block (with or without colon, with emoji)
    const exportMatch = text.match(/(?:📤\s*)?EXPORT FOR NAVIGATION:?\s*\n([\s\S]*?)(?:\n📊|\n---|\n\n\*\*|$)/i);
    if (exportMatch) {
      const addresses = exportMatch[1]
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove leading numbers like "1. "
        .filter(line => line.length > 0 && /\d{5}/.test(line) && !line.match(/^(THURSDAY|FRIDAY|SATURDAY|SUNDAY|MONDAY|TUESDAY|WEDNESDAY)/i));
      if (addresses.length > 0) {
        return addresses;
      }
    }

    // Look for Oregon addresses anywhere in the text (pattern: street, city, OR zipcode)
    const addressPattern = /\d+\s+[\w\s]+(?:ST|AVE|RD|DR|CT|LN|LOOP|WAY|BLVD|PL|CIR|TRL|HWY)[,\s]+[\w\s]+,\s*OR\s+\d{5}/gi;
    const foundAddresses = text.match(addressPattern);
    if (foundAddresses && foundAddresses.length > 0) {
      const cleaned = [...new Set(foundAddresses.map(addr => addr.trim()))];
      return cleaned;
    }

    // Try to extract from 📍 STOP lines
    const stopMatches = text.match(/📍 STOP \d+[^\n]*\n\n[^\n]+\n([^\n]+)/g);
    if (stopMatches) {
      const addresses: string[] = [];
      for (const match of stopMatches) {
        const lines = match.split('\n').filter(l => l.trim());
        // Address is typically the 3rd line after "📍 STOP" header and name line
        if (lines.length >= 3) {
          const addrLine = lines[2].trim();
          if (/\d{5}/.test(addrLine)) {
            addresses.push(addrLine);
          }
        }
      }
      if (addresses.length > 0) {
        return addresses;
      }
    }

    // Fall back to any line with OR + zipcode that looks like an address
    const lines = text.split('\n');
    const addresses: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/\d+\s+\w+.*,\s*OR\s+\d{5}/.test(trimmed) && !trimmed.startsWith('Lat:')) {
        // Clean up the address (remove leading numbers, pipe symbols, etc.)
        const cleaned = trimmed.replace(/^\d+\.\s*/, '').replace(/\|/g, '').trim();
        if (cleaned.length > 10) {
          addresses.push(cleaned);
        }
      }
    }
    if (addresses.length > 0) {
      return [...new Set(addresses)];
    }
  }

  return [];
}

export function extractPrintableRouteContent(routePlan: string): string {
  // Find ALL day headers with route sequences (complete route blocks)
  // Pattern: 📅 DAY followed by route info, stops, etc.
  const dayPattern = /📅\s*(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)[^\n]*\n/gi;
  
  // Find all matches and their positions
  const matches: { index: number; day: string }[] = [];
  let match;
  while ((match = dayPattern.exec(routePlan)) !== null) {
    // Check if this day header has actual route content (STOP markers nearby)
    const afterMatch = routePlan.substring(match.index, match.index + 500);
    if (/📍\s*STOP\s*\d+/i.test(afterMatch) || /ROUTE SEQUENCE/i.test(afterMatch)) {
      matches.push({ index: match.index, day: match[1] });
    }
  }
  
  if (matches.length === 0) {
    return routePlan; // No route blocks found, return full content
  }
  
  // Find the LAST complete route block (handles redrafts/changes)
  // A complete block starts with 📅 DAY and contains STOP markers
  // If there are multiple days in the final route (Thu + Fri), take from the first of that group
  
  // Check if the last two matches are consecutive days (part of same route)
  // by looking at the content between them - if short, they're part of same route
  let startIndex = matches[matches.length - 1].index;
  
  if (matches.length >= 2) {
    // Check if this looks like a multi-day route by seeing if there's substantial
    // route content between the last two day markers
    const secondToLast = matches[matches.length - 2];
    const contentBetween = routePlan.substring(secondToLast.index, startIndex);
    
    // If the content between has STOP markers and a SUMMARY, it's part of the same route
    if (/📍\s*STOP/i.test(contentBetween) && /SUMMARY/i.test(contentBetween)) {
      // This is a multi-day route, use the earlier day as start
      startIndex = secondToLast.index;
    }
  }
  
  return routePlan.substring(startIndex);
}

export function generateGoogleMapsUrl(addresses: string[]): string | null {
  if (addresses.length === 0) return null;

  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  const waypoints = addresses.slice(1, -1).map(a => encodeURIComponent(a)).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  
  return url;
}

export function copyAddressesToClipboard(addresses: string[]): number {
  navigator.clipboard.writeText(addresses.join('\n'));
  return addresses.length;
}

export function openInGoogleMaps(addresses: string[]): boolean {
  const url = generateGoogleMapsUrl(addresses);
  if (!url) return false;

  // Use an anchor element click to avoid popup blockers
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export function formatGeneratedTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const DEFAULT_HOME_BASE: HomeBase = {
  lat: 43.8879,
  lng: -121.4386,
  address: 'Sunriver, OR 97707'
};

const N8N_ROUTE_WEBHOOK_URL = 'https://visionairy.app.n8n.cloud/webhook/route-query';

export async function saveRouteToN8n(route: RouteDay, fullResponse?: RouteOptimizerResponse): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(N8N_ROUTE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save_route',
        route_data: {
          day: route.day,
          date: route.date,
          summary: route.summary,
          stops: route.stops,
          query_date: fullResponse?.query_date,
          generated_at: fullResponse?.generated_at,
          urgency_counts: fullResponse?.urgency_counts,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message: result.message || 'Route saved successfully' };
  } catch (error) {
    console.error('Failed to save route:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to save route' };
  }
}
