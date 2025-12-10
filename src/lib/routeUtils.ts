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
  available_hours: number;
  total_pending: number;
  urgency_counts: {
    CRITICAL: number;
    URGENT: number;
    SOON: number;
    NORMAL: number;
    UNKNOWN: number;
  };
  route_plan?: string;
  optimized_routes?: RouteDay[];
  home_base?: HomeBase;
  generated_at: string;
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
  return Array.isArray(response.optimized_routes) && response.optimized_routes.length > 0;
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

export function extractAddresses(routePlan: string): string[] {
  // Look for the "EXPORT FOR NAVIGATION" section
  const exportMatch = routePlan.match(/EXPORT FOR NAVIGATION:\n([\s\S]*?)(?:\n```|$)/);
  if (exportMatch) {
    return exportMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  }

  // Fallback: extract addresses from 📍 markers
  const addressMatches = routePlan.matchAll(/📍\s*([^\n]+)/g);
  return Array.from(addressMatches, m => m[1].trim());
}

export function copyAddressesToClipboard(routePlan: string): number {
  const addresses = extractAddresses(routePlan);
  navigator.clipboard.writeText(addresses.join('\n'));
  return addresses.length;
}

export function openInGoogleMaps(routePlan: string): boolean {
  const addresses = extractAddresses(routePlan);
  if (addresses.length === 0) return false;

  // Google Maps multi-stop URL
  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  const waypoints = addresses.slice(1, -1).map(a => encodeURIComponent(a)).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  
  window.open(url, '_blank');
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
