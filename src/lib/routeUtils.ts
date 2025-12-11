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
  // Find the last occurrence of "Route Optimization" and take everything after it
  const lastRouteOptIndex = routePlan.lastIndexOf('Route Optimization');
  
  if (lastRouteOptIndex !== -1) {
    return routePlan.substring(lastRouteOptIndex);
  }
  
  // Fallback: return full content
  return routePlan;
}

export function generatePrintableHTML(routeContent: string, queryDate?: string): string {
  // Parse the route content to extract structured data
  const days: Array<{
    title: string;
    date: string;
    stops: Array<{
      order: number;
      name: string;
      address: string;
      company: string;
      urgency: string;
      duration: string;
      driveTime: string;
      scheduledTime?: string;
      callAhead?: boolean;
    }>;
    summary?: {
      totalStops: string;
      totalHours: string;
      driveHours: string;
      miles: string;
      fuel: string;
      zones: string[];
    };
  }> = [];

  // Parse day sections
  const dayPattern = /📅\s*(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)[^\n]*\n([^]*?)(?=📅\s*(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)|📤\s*EXPORT|$)/gi;
  let dayMatch;
  
  while ((dayMatch = dayPattern.exec(routeContent)) !== null) {
    const dayName = dayMatch[1];
    const dayContent = dayMatch[2];
    
    // Extract date from the header line
    const dateMatch = dayMatch[0].match(/\(([^)]+)\)/);
    const date = dateMatch ? dateMatch[1] : '';
    
    const stops: typeof days[0]['stops'] = [];
    
    // Parse stops
    const stopPattern = /📍\s*STOP\s*(\d+)[^\n]*\n\n([^\n]+)\n([^\n]+)(?:\n([^\n]+))?/gi;
    let stopMatch;
    
    while ((stopMatch = stopPattern.exec(dayContent)) !== null) {
      const order = parseInt(stopMatch[1]);
      const name = stopMatch[2].trim();
      const address = stopMatch[3].trim();
      const details = stopMatch[4] || '';
      
      // Parse company and urgency from details
      const companyMatch = details.match(/\*\*([^*]+)\*\*/);
      const urgencyMatch = details.match(/🔴|🟠|🟡|🟢|🔵/);
      const durationMatch = details.match(/⏱️\s*(\d+)\s*min/);
      const driveMatch = details.match(/🚗\s*(\d+)\s*min/);
      const callAhead = details.includes('📞');
      const scheduledMatch = details.match(/📅\s*Scheduled:\s*([^\s|]+)/);
      
      let urgency = 'NORMAL';
      if (urgencyMatch) {
        switch (urgencyMatch[0]) {
          case '🔴': urgency = 'CRITICAL'; break;
          case '🟠': urgency = 'URGENT'; break;
          case '🟡': urgency = 'SOON'; break;
          case '🟢': urgency = 'NORMAL'; break;
          case '🔵': urgency = 'FIXED'; break;
        }
      }
      
      stops.push({
        order,
        name,
        address,
        company: companyMatch ? companyMatch[1] : '',
        urgency,
        duration: durationMatch ? `${durationMatch[1]}m` : '',
        driveTime: driveMatch ? `${driveMatch[1]}m` : '',
        scheduledTime: scheduledMatch ? scheduledMatch[1] : undefined,
        callAhead
      });
    }
    
    // Parse summary
    const summaryMatch = dayContent.match(/📊\s*DAY SUMMARY[^]*?(?=🏠|📤|$)/i);
    let summary;
    if (summaryMatch) {
      const summaryText = summaryMatch[0];
      const stopsMatch = summaryText.match(/Stops:\s*(\d+)/);
      const hoursMatch = summaryText.match(/Total Hours:\s*([\d.]+)/);
      const driveMatch = summaryText.match(/Drive Time:\s*([\d.]+)/);
      const milesMatch = summaryText.match(/Distance:\s*([\d.]+)/);
      const fuelMatch = summaryText.match(/Fuel:\s*\$?([\d.]+)/);
      const zonesMatch = summaryText.match(/Zones?:\s*([^\n]+)/);
      
      summary = {
        totalStops: stopsMatch ? stopsMatch[1] : String(stops.length),
        totalHours: hoursMatch ? hoursMatch[1] : '',
        driveHours: driveMatch ? driveMatch[1] : '',
        miles: milesMatch ? milesMatch[1] : '',
        fuel: fuelMatch ? fuelMatch[1] : '',
        zones: zonesMatch ? zonesMatch[1].split(',').map(z => z.trim()) : []
      };
    }
    
    if (stops.length > 0) {
      days.push({ title: dayName, date, stops, summary });
    }
  }
  
  // Check if parsing failed - fall back to styled markdown rendering
  const parsingFailed = days.length === 0;

  // Extract navigation addresses
  const navAddresses: string[] = [];
  const exportMatch = routeContent.match(/📤\s*EXPORT FOR NAVIGATION:?\s*\n([\s\S]*?)(?=\n📊|$)/i);
  if (exportMatch) {
    const lines = exportMatch[1].split('\n').filter(l => l.trim());
    for (const line of lines) {
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned && /\d{5}/.test(cleaned)) {
        navAddresses.push(cleaned);
      }
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return { bg: '#fef2f2', text: '#dc2626', badge: '#dc2626' };
      case 'URGENT': return { bg: '#fff7ed', text: '#ea580c', badge: '#f97316' };
      case 'SOON': return { bg: '#fefce8', text: '#ca8a04', badge: '#eab308' };
      case 'FIXED': return { bg: '#f5f3ff', text: '#7c3aed', badge: '#8b5cf6' };
      default: return { bg: '#f0fdf4', text: '#16a34a', badge: '#22c55e' };
    }
  };

  // Convert markdown to styled HTML for fallback
  const formatMarkdownContent = (content: string): string => {
    return content
      // Headers
      .replace(/^### (.+)$/gm, '<h3 style="font-size: 18px; font-weight: 600; color: #1e3a5f; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size: 22px; font-weight: 700; color: #1e3a5f; margin: 28px 0 16px 0;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size: 28px; font-weight: 700; color: #1e3a5f; margin: 32px 0 20px 0;">$1</h1>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 600; color: #1e293b;">$1</strong>')
      // Emojis with styling
      .replace(/📅/g, '<span style="margin-right: 8px;">📅</span>')
      .replace(/📍/g, '<span style="color: #3b82f6; margin-right: 6px;">📍</span>')
      .replace(/📊/g, '<span style="margin-right: 8px;">📊</span>')
      .replace(/🏠/g, '<span style="margin-right: 8px;">🏠</span>')
      .replace(/📤/g, '<span style="margin-right: 8px;">📤</span>')
      .replace(/🔴/g, '<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #dc2626; margin-right: 6px;"></span>')
      .replace(/🟠/g, '<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #f97316; margin-right: 6px;"></span>')
      .replace(/🟡/g, '<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #eab308; margin-right: 6px;"></span>')
      .replace(/🟢/g, '<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; margin-right: 6px;"></span>')
      .replace(/🔵/g, '<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #8b5cf6; margin-right: 6px;"></span>')
      // Horizontal rules
      .replace(/^---+$/gm, '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 24px 0;">')
      // Lists
      .replace(/^- (.+)$/gm, '<div style="padding-left: 20px; margin: 4px 0;">• $1</div>')
      .replace(/^\d+\.\s+(.+)$/gm, (match, p1, offset, str) => {
        const num = match.match(/^(\d+)/)?.[1] || '•';
        return `<div style="display: flex; margin: 6px 0;"><span style="min-width: 28px; font-weight: 600; color: #3b82f6;">${num}.</span><span>${p1}</span></div>`;
      })
      // Paragraphs (add spacing to double newlines)
      .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
      // Single newlines to line breaks
      .replace(/\n/g, '<br>')
      // Wrap in paragraph
      .replace(/^/, '<p style="margin: 12px 0;">')
      .replace(/$/, '</p>');
  };

  // Generate HTML
  return `<!DOCTYPE html>
<html>
<head>
  <title>RouteWise AI - Route Plan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1a1a2e;
      line-height: 1.5;
      padding: 40px;
      max-width: 850px;
      margin: 0 auto;
      background: #fff;
    }
    
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    .header .brand {
      color: #3b82f6;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header .date {
      color: #64748b;
      font-size: 16px;
      margin-top: 8px;
    }
    
    .day-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .day-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .day-header h2 {
      font-size: 20px;
      font-weight: 600;
    }
    .day-header .stats {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .stops-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e2e8f0;
      border-top: none;
    }
    .stops-table th {
      background: #f8fafc;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    .stops-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .stops-table tr:last-child td {
      border-bottom: none;
    }
    .stops-table tr:hover {
      background: #f8fafc;
    }
    
    .stop-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: white;
      font-weight: 700;
      font-size: 13px;
    }
    
    .stop-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .stop-address {
      font-size: 13px;
      color: #64748b;
    }
    
    .urgency-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .call-ahead {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #7c3aed;
      background: #f5f3ff;
      padding: 4px 8px;
      border-radius: 6px;
      margin-top: 6px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 0 0 12px 12px;
      padding: 20px 24px;
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .summary-item .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .summary-item .value {
      font-size: 18px;
      font-weight: 700;
      color: #1e3a5f;
    }
    
    .nav-section {
      margin-top: 40px;
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .nav-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a5f;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .nav-address {
      padding: 8px 0;
      font-size: 14px;
      color: #334155;
      border-bottom: 1px dashed #cbd5e1;
    }
    .nav-address:last-child {
      border-bottom: none;
    }
    .nav-address strong {
      color: #3b82f6;
      margin-right: 8px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    
    .route-content {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      margin-top: 20px;
    }
    
    @media print {
      body { padding: 20px; }
      .day-section { page-break-inside: avoid; }
      .nav-section { page-break-before: auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">RouteWise AI</div>
    <h1>Route Plan${queryDate ? ` - ${queryDate}` : ''}</h1>
    <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
  </div>

  ${parsingFailed ? `
    <div class="route-content">
      ${formatMarkdownContent(routeContent)}
    </div>
  ` : days.map(day => `
    <div class="day-section">
      <div class="day-header">
        <h2>${day.title}${day.date ? ` - ${day.date}` : ''}</h2>
        <div class="stats">${day.stops.length} stops${day.summary?.totalHours ? ` • ${day.summary.totalHours}h total` : ''}</div>
      </div>
      
      <table class="stops-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Property</th>
            <th style="width: 80px;">Company</th>
            <th style="width: 90px;">Urgency</th>
            <th style="width: 70px;">Time</th>
            <th style="width: 70px;">Drive</th>
          </tr>
        </thead>
        <tbody>
          ${day.stops.map(stop => {
            const colors = getUrgencyColor(stop.urgency);
            return `
              <tr>
                <td>
                  <span class="stop-number" style="background-color: ${colors.badge};">${stop.order}</span>
                </td>
                <td>
                  <div class="stop-name">${stop.name}</div>
                  <div class="stop-address">${stop.address}</div>
                  ${stop.callAhead ? '<div class="call-ahead">📞 Call Ahead</div>' : ''}
                  ${stop.scheduledTime ? `<div class="call-ahead">🕐 ${stop.scheduledTime}</div>` : ''}
                </td>
                <td>${stop.company}</td>
                <td>
                  <span class="urgency-badge" style="background-color: ${colors.bg}; color: ${colors.text};">
                    ${stop.urgency}
                  </span>
                </td>
                <td>${stop.duration}</td>
                <td>${stop.driveTime || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      ${day.summary ? `
        <div class="summary-card">
          <div class="summary-item">
            <span class="label">Total Stops</span>
            <span class="value">${day.summary.totalStops}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Hours</span>
            <span class="value">${day.summary.totalHours}h</span>
          </div>
          <div class="summary-item">
            <span class="label">Drive Time</span>
            <span class="value">${day.summary.driveHours}h</span>
          </div>
          <div class="summary-item">
            <span class="label">Distance</span>
            <span class="value">${day.summary.miles} mi</span>
          </div>
          <div class="summary-item">
            <span class="label">Est. Fuel</span>
            <span class="value">$${day.summary.fuel}</span>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('')}

  ${navAddresses.length > 0 ? `
    <div class="nav-section">
      <h3>📍 Addresses for Navigation</h3>
      ${navAddresses.map((addr, i) => `
        <div class="nav-address">
          <strong>${i + 1}.</strong> ${addr}
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div class="footer">
    RouteWise AI • Inspector Route Optimizer
  </div>
</body>
</html>`;
}

export function generateGoogleMapsUrl(addresses: string[]): string | null {
  if (addresses.length === 0) return null;

  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  
  // Build waypoints - encode the pipe separator as %7C for better browser compatibility
  const waypointsArray = addresses.slice(1, -1);
  const waypoints = waypointsArray.map(a => encodeURIComponent(a)).join('%7C');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypointsArray.length > 0) {
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
