import { RouteDay } from '@/lib/routeUtils';

interface PrintableRouteProps {
  route: RouteDay;
  homeBase: { lat: number; lng: number; address: string };
  googleMapsApiKey?: string;
}

export function PrintableRoute({ route, homeBase, googleMapsApiKey }: PrintableRouteProps) {
  // Generate static map URL for printing
  const generateStaticMapUrl = () => {
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

  const staticMapUrl = generateStaticMapUrl();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return '#dc2626';
      case 'URGENT': return '#f97316';
      case 'SOON': return '#eab308';
      default: return '#22c55e';
    }
  };

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
