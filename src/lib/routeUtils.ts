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
  route_plan: string;
  generated_at: string;
}

export function isRouteOptimizerResponse(data: unknown): data is RouteOptimizerResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.success === true &&
    typeof obj.route_plan === 'string' &&
    obj.urgency_counts !== undefined
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
