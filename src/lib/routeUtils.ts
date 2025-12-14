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
  drive_miles_to_next: number | null;
  needs_call_ahead: boolean;
  scheduled_time?: string;
  days_remaining?: number;
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
    // More strict pattern to avoid matching full stop descriptions
    const addressPattern = /(\d+\s+[\w\s]+(?:ST|AVE|RD|DR|CT|LN|LOOP|WAY|BLVD|PL|CIR|TRL|HWY)[,\s]+[\w\s]+,\s*OR\s+\d{5})/gi;
    const foundAddresses = text.match(addressPattern);
    if (foundAddresses && foundAddresses.length > 0) {
      // Clean up and dedupe addresses
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

    // Fall back to extracting just the address portion from lines containing OR + zipcode
    const lines = text.split('\n');
    const addresses: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      // If line contains an Oregon address, extract just that address portion
      const addrMatch = trimmed.match(/(\d+\s+[\w\s]+(?:ST|AVE|RD|DR|CT|LN|LOOP|WAY|BLVD|PL|CIR|TRL|HWY)[,\s]+[\w\s]+,\s*OR\s+\d{5})/i);
      if (addrMatch && !trimmed.startsWith('Lat:')) {
        addresses.push(addrMatch[1].trim());
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
      // Remove box-drawing characters (UTF-8 encoding issues)
      .replace(/[╔╗╚╝║═╠╣╬╦╩┌┐└┘│─├┤┬┴┼]/g, '')
      .replace(/[â€"â€™â€œâ€�]/g, '') // Common UTF-8 mojibake
      .replace(/➔|➤|➜|→|▶/g, '→') // Normalize arrows
      .replace(/✓|✔/g, '✓') // Normalize checkmarks
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inspector Route AI - Route Plan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1a1a2e;
      line-height: 1.5;
      padding: 20px;
      max-width: 850px;
      margin: 0 auto;
      background: #fff;
    }
    
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: clamp(20px, 5vw, 28px);
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    .header .brand {
      color: #3b82f6;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header .date {
      color: #64748b;
      font-size: clamp(12px, 3vw, 14px);
      margin-top: 8px;
    }
    
    .day-section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .day-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 14px 16px;
      border-radius: 12px 12px 0 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .day-header h2 {
      font-size: clamp(16px, 4vw, 20px);
      font-weight: 600;
    }
    .day-header .stats {
      font-size: clamp(11px, 3vw, 14px);
      opacity: 0.9;
    }
    
    .stops-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e2e8f0;
      border-top: none;
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .stops-table thead, .stops-table tbody, .stops-table tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    .stops-table th {
      background: #f8fafc;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: clamp(10px, 2.5vw, 12px);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    .stops-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      font-size: clamp(12px, 3vw, 14px);
    }
    .stops-table tr:last-child td {
      border-bottom: none;
    }
    
    .stop-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      color: white;
      font-weight: 700;
      font-size: 12px;
    }
    
    .stop-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
      word-break: break-word;
    }
    .stop-address {
      font-size: clamp(11px, 2.5vw, 13px);
      color: #64748b;
      word-break: break-word;
    }
    
    .urgency-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 10px;
      font-size: clamp(9px, 2vw, 11px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    
    .call-ahead {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #7c3aed;
      background: #f5f3ff;
      padding: 3px 6px;
      border-radius: 6px;
      margin-top: 4px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 0 0 12px 12px;
      padding: 16px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      min-width: 60px;
    }
    .summary-item .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .summary-item .value {
      font-size: clamp(14px, 4vw, 18px);
      font-weight: 700;
      color: #1e3a5f;
    }
    
    .nav-section {
      margin-top: 32px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .nav-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: #1e3a5f;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .nav-address {
      padding: 6px 0;
      font-size: clamp(12px, 3vw, 14px);
      color: #334155;
      border-bottom: 1px dashed #cbd5e1;
      word-break: break-word;
    }
    .nav-address:last-child {
      border-bottom: none;
    }
    .nav-address strong {
      color: #3b82f6;
      margin-right: 6px;
    }
    
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
    }
    
    .route-content {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
    }
    
    .print-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      padding: 14px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;
      transition: all 0.2s ease;
    }
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
    }
    
    @media (max-width: 600px) {
      body { padding: 12px; }
      .stops-table th:nth-child(3),
      .stops-table td:nth-child(3),
      .stops-table th:nth-child(6),
      .stops-table td:nth-child(6) {
        display: none;
      }
      .print-button {
        bottom: 16px;
        right: 16px;
        padding: 12px 16px;
        font-size: 13px;
      }
    }
    
    @media print {
      body { padding: 10px; }
      .day-section { page-break-inside: avoid; }
      .nav-section { page-break-before: auto; }
      .print-button { display: none !important; }
      .stops-table th, .stops-table td { display: table-cell; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
    Print
  </button>
  
  <div class="header">
    <div class="brand">Inspector Route AI</div>
    <h1>Route Plan${queryDate ? ` - ${queryDate}` : ''}</h1>
    <div class="date">Generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
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
    Inspector Route AI • Route Optimizer
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

  // On mobile PWA, window.open can be blocked. Use multiple fallback approaches.
  try {
    // First try window.open - works on most browsers
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback: Create and click an anchor element
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // Important: Add to DOM before clicking for iOS Safari compatibility
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Small delay before removing to ensure click processes
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    }
    return true;
  } catch (error) {
    console.error('Failed to open Google Maps:', error);
    // Last resort: try direct navigation (will leave current page)
    // Only do this if explicitly needed
    return false;
  }
}

export function formatGeneratedTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const DEFAULT_HOME_BASE: HomeBase = {
  lat: 43.901998,
  lng: -121.4317847,
  address: '57870 Silver Fir Circle, Sunriver, OR 97707'
};

import { supabase } from '@/integrations/supabase/client';

const N8N_PROXY_URL = 'https://rsylbntdtflyoaxiwhvm.supabase.co/functions/v1/n8n-proxy';

export interface SavedRoute {
  id: string;
  date: string;
  stops_count: number;
  total_miles: number;
  total_hours: number;
  drive_hours: number;
  fuel_cost: number;
  zones: string;
  start_time?: string;
  finish_time?: string;
  stops: RouteStop[];
  created_at?: string;
}

export interface SavedRoutesResponse {
  success: boolean;
  routes: SavedRoute[];
  count: number;
}

export async function fetchSavedRoutes(): Promise<SavedRoutesResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.warn('No auth token available for fetchSavedRoutes');
      return { success: false, routes: [], count: 0 };
    }

    const response = await fetch(N8N_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'get_saved_routes'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch saved routes:', error);
    return { success: false, routes: [], count: 0 };
  }
}

export async function saveRouteToSupabase(
  route: RouteDay, 
  fullResponse?: RouteOptimizerResponse,
  originalRequest?: string
): Promise<{ success: boolean; message?: string; routeId?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }

    // Parse date from route
    const routeDate = route.date || fullResponse?.query_date || new Date().toISOString().split('T')[0];
    const parsedDate = new Date(routeDate);
    
    // Extract zones from summary
    const zones = route.summary?.zones || [];

    const { data, error } = await supabase
      .from('saved_routes')
      .insert({
        user_id: user.id,
        route_date: routeDate,
        day_of_week: parsedDate.getDay(),
        route_name: route.day || null,
        status: 'planned',
        stops_count: route.stops?.length || 0,
        total_miles: route.summary?.total_distance_miles || null,
        total_hours: route.summary?.total_route_hours || null,
        drive_hours: route.summary?.total_drive_hours || null,
        inspection_hours: route.summary?.inspection_hours || null,
        fuel_cost: route.summary?.estimated_fuel || null,
        zones: zones.length > 0 ? zones : null,
        start_time: route.stops?.[0]?.scheduled_time || null,
        finish_time: route.stops?.[route.stops.length - 1]?.scheduled_time || null,
        stops_json: route.stops || [],
        original_request: originalRequest || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save route:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Route saved successfully', routeId: data?.id };
  } catch (error) {
    console.error('Failed to save route:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to save route' };
  }
}

// Legacy alias for backwards compatibility
export const saveRouteToN8n = saveRouteToSupabase;

// Reconciliation types
export interface MissingInspection {
  id: string;
  inspection_id: string;
  company: string;
  insured_name: string;
  address: string;
  urgency: string;
  days_remaining: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  company: string;
  batch_id: string;
  total_rows_in_file: number;
  valid_inspections: number;
  inserted_to_airtable: number;
  timestamp: string;
  needs_reconciliation?: boolean;
  missing_inspections?: MissingInspection[];
  missing_count?: number;
  reconciliation_message?: string;
}

export interface ReconciliationResult {
  success: boolean;
  message: string;
  completed_count: number;
  removed_count: number;
  total_updated: number;
}

export async function confirmReconciliation(
  completedIds: string[],
  removedIds: string[]
): Promise<ReconciliationResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      return {
        success: false,
        message: 'Not authenticated',
        completed_count: 0,
        removed_count: 0,
        total_updated: 0
      };
    }

    const response = await fetch(N8N_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'reconcile',
        completed_ids: completedIds,
        removed_ids: removedIds
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to confirm reconciliation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reconcile',
      completed_count: 0,
      removed_count: 0,
      total_updated: 0
    };
  }
}
