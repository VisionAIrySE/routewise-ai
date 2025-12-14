import { RouteDay } from '@/lib/routeUtils';

interface PrintableRouteProps {
  route: RouteDay;
  homeBase: { lat: number; lng: number; address: string };
  googleMapsApiKey?: string;
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'CRITICAL': return '#dc2626';
    case 'URGENT': return '#f97316';
    case 'SOON': return '#eab308';
    case 'FIXED': return '#8b5cf6';
    default: return '#22c55e';
  }
};

// Generate static map URL for printing
const generateStaticMapUrl = (route: RouteDay, homeBase: { lat: number; lng: number }, googleMapsApiKey?: string) => {
  if (!googleMapsApiKey) return null;
  
  const markers = route.stops.map((stop, index) => 
    `markers=color:red%7Clabel:${index + 1}%7C${stop.lat},${stop.lng}`
  ).join('&');
  
  const homeMarker = `markers=color:blue%7Clabel:H%7C${homeBase.lat},${homeBase.lng}`;
  
  // Create path
  const pathPoints = [
    `${homeBase.lat},${homeBase.lng}`,
    ...route.stops.map(s => `${s.lat},${s.lng}`),
    `${homeBase.lat},${homeBase.lng}`
  ].join('|');
  
  const path = `path=color:0x3b82f6ff%7Cweight:3%7C${pathPoints}`;
  
  return `https://maps.googleapis.com/maps/api/staticmap?size=800x400&maptype=roadmap&${homeMarker}&${markers}&${path}&key=${googleMapsApiKey}`;
};

export function generatePrintWindowHTML(
  route: RouteDay, 
  homeBase: { lat: number; lng: number; address: string },
  googleMapsApiKey?: string
): string {
  const staticMapUrl = generateStaticMapUrl(route, homeBase, googleMapsApiKey);
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Inspector Route AI - ${route.day} Route</title>
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
    .summary {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .summary-item {
      font-size: 14px;
    }
    .summary-item strong {
      color: #1e3a5f;
    }
    .map-container {
      margin-bottom: 24px;
    }
    .map-container img {
      width: 100%;
      max-width: 800px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 24px;
    }
    th {
      background: #f8fafc;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .stop-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: white;
      font-weight: 700;
      font-size: 12px;
    }
    .urgency-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
    }
    .nav-section {
      margin-top: 32px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .nav-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1e3a5f;
    }
    .nav-address {
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .nav-address:last-child {
      border-bottom: none;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
    }
    @media print {
      body { padding: 20px; }
      .print-button { display: none !important; }
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">
    🖨️ Print Route
  </button>
  
  <div class="header">
    <div class="brand">Inspector Route AI</div>
    <h1>Route Plan: ${route.day}</h1>
    <div class="date">${route.date}</div>
  </div>
  
  <div class="summary">
    <div class="summary-item"><strong>${route.summary.stops}</strong> stops</div>
    <div class="summary-item"><strong>${route.summary.total_route_hours}</strong> total hours</div>
    <div class="summary-item"><strong>${route.summary.total_drive_hours}</strong> drive hours</div>
    <div class="summary-item"><strong>${route.summary.total_distance_miles}</strong> miles</div>
    <div class="summary-item">Est. fuel: <strong>$${route.summary.estimated_fuel}</strong></div>
  </div>
  
  ${staticMapUrl ? `
  <div class="map-container">
    <img src="${staticMapUrl}" alt="Route Map" />
  </div>
  ` : ''}
  
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Property</th>
        <th>Address</th>
        <th style="width: 70px;">Company</th>
        <th style="width: 70px;">Urgency</th>
        <th style="width: 50px;">Time</th>
        <th style="width: 50px;">Drive</th>
      </tr>
    </thead>
    <tbody>
      ${route.stops.map(stop => {
        const color = getUrgencyColor(stop.urgency);
        return `
          <tr>
            <td>
              <span class="stop-number" style="background-color: ${color};">${stop.order}</span>
            </td>
            <td><strong>${stop.name}</strong></td>
            <td>${stop.address}</td>
            <td>${stop.company}</td>
            <td>
              <span class="urgency-badge" style="background-color: ${color}20; color: ${color};">
                ${stop.urgency}
              </span>
            </td>
            <td>${stop.duration_minutes}m</td>
            <td>${stop.drive_minutes_to_next ? `${stop.drive_minutes_to_next}m` : '-'}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  
  <div class="nav-section">
    <h3>📍 Addresses for Navigation</h3>
    <div class="nav-address"><strong>Start:</strong> ${homeBase.address}</div>
    ${route.stops.map(stop => `
      <div class="nav-address"><strong>${stop.order}.</strong> ${stop.address}</div>
    `).join('')}
    <div class="nav-address"><strong>Return:</strong> ${homeBase.address}</div>
  </div>
  
  <div class="footer">
    Generated on ${new Date().toLocaleString()} • Inspector Route AI
  </div>
</body>
</html>`;
}

export function PrintableRoute({ route, homeBase, googleMapsApiKey }: PrintableRouteProps) {
  const staticMapUrl = generateStaticMapUrl(route, homeBase, googleMapsApiKey);

  return (
    <div className="printable-route p-8 bg-white text-black">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold">Route Plan: {route.day}</h1>
        <p className="text-gray-600">{route.date}</p>
        <div className="flex gap-6 mt-2 text-sm">
          <span><strong>{route.summary.stops}</strong> stops</span>
          <span><strong>{route.summary.total_route_hours}</strong> total hours</span>
          <span><strong>{route.summary.total_distance_miles}</strong> miles</span>
          <span>Est. fuel: <strong>${route.summary.estimated_fuel}</strong></span>
        </div>
      </div>

      {/* Static Map Image */}
      {staticMapUrl && (
        <div className="mb-6">
          <img 
            src={staticMapUrl} 
            alt="Route Map" 
            className="w-full max-w-[800px] mx-auto border border-gray-300 rounded"
          />
        </div>
      )}

      {/* Route Stops */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Route Stops</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 w-12">#</th>
              <th className="text-left py-2">Property</th>
              <th className="text-left py-2">Address</th>
              <th className="text-left py-2 w-20">Company</th>
              <th className="text-left py-2 w-20">Urgency</th>
              <th className="text-left py-2 w-16">Time</th>
              <th className="text-left py-2 w-16">Drive</th>
            </tr>
          </thead>
          <tbody>
            {route.stops.map((stop, index) => (
              <tr key={stop.id} className="border-b">
                <td className="py-2">
                  <span 
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                    style={{ backgroundColor: getUrgencyColor(stop.urgency) }}
                  >
                    {stop.order}
                  </span>
                </td>
                <td className="py-2 font-medium">{stop.name}</td>
                <td className="py-2 text-gray-700">{stop.address}</td>
                <td className="py-2">{stop.company}</td>
                <td className="py-2">
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: `${getUrgencyColor(stop.urgency)}20`,
                      color: getUrgencyColor(stop.urgency)
                    }}
                  >
                    {stop.urgency}
                  </span>
                </td>
                <td className="py-2">{stop.duration_minutes}m</td>
                <td className="py-2 text-gray-500">
                  {stop.drive_minutes_to_next ? `${stop.drive_minutes_to_next}m` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Address List for Navigation */}
      <div className="mt-8 pt-4 border-t-2 border-gray-300">
        <h2 className="text-lg font-semibold mb-4">Addresses (for navigation)</h2>
        <div className="text-sm space-y-1">
          <p className="text-gray-500 mb-2">Start: {homeBase.address}</p>
          {route.stops.map((stop) => (
            <p key={stop.id}>
              <strong>{stop.order}.</strong> {stop.address}
            </p>
          ))}
          <p className="text-gray-500 mt-2">Return: {homeBase.address}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-xs text-gray-500 text-center">
        Generated on {new Date().toLocaleString()} • Inspector Route Optimizer
      </div>
    </div>
  );
}
