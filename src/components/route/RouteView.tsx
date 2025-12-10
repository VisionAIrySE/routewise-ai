import { useState } from 'react';
import { RouteMap } from './RouteMap';
import { RouteSummaryCard } from './RouteSummaryCard';
import { RouteStopList } from './RouteStopList';
import { Button } from '@/components/ui/button';
import { Copy, Navigation, Printer, Map, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RouteDay {
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
  stops: Array<{
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
  }>;
}

interface RouteViewProps {
  routes: RouteDay[];
  homeBase: { lat: number; lng: number; address: string };
}

export function RouteView({ routes, homeBase }: RouteViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { toast } = useToast();

  const currentRoute = routes[selectedDay];

  const copyAddresses = () => {
    const addresses = currentRoute.stops
      .map(stop => stop.address)
      .join('\n');
    navigator.clipboard.writeText(addresses);
    toast({
      title: 'Copied!',
      description: `${currentRoute.stops.length} addresses copied to clipboard`
    });
  };

  const openInGoogleMaps = () => {
    const stops = currentRoute.stops;
    if (stops.length === 0) return;

    const origin = `${homeBase.lat},${homeBase.lng}`;
    const destination = origin;
    const waypoints = stops
      .map(stop => `${stop.lat},${stop.lng}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const printRoute = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Day Selector (if multiple days) */}
      {routes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {routes.map((route, index) => (
            <Button
              key={index}
              variant={selectedDay === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDay(index)}
            >
              {route.day}
            </Button>
          ))}
        </div>
      )}

      {/* Summary Card */}
      <RouteSummaryCard
        day={currentRoute.day}
        date={currentRoute.date}
        stops={currentRoute.summary.stops}
        totalHours={currentRoute.summary.total_route_hours}
        driveHours={currentRoute.summary.total_drive_hours}
        inspectionHours={currentRoute.summary.inspection_hours}
        totalMiles={currentRoute.summary.total_distance_miles}
        estimatedFuel={currentRoute.summary.estimated_fuel}
        zones={currentRoute.summary.zones}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copyAddresses}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Addresses
        </Button>
        <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
          <Navigation className="h-4 w-4 mr-2" />
          Open in Maps
        </Button>
        <Button variant="outline" size="sm" onClick={printRoute}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <div className="flex-1" />
        <div className="flex border border-border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg overflow-hidden border border-border">
            <RouteMap
              stops={currentRoute.stops}
              homeBase={homeBase}
              onStopClick={(stop) => setSelectedStopId(stop.id)}
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <RouteStopList
              stops={currentRoute.stops}
              selectedStopId={selectedStopId || undefined}
              onStopClick={(stop) => setSelectedStopId(stop.id)}
            />
          </div>
        </div>
      ) : (
        <RouteStopList
          stops={currentRoute.stops}
          selectedStopId={selectedStopId || undefined}
          onStopClick={(stop) => setSelectedStopId(stop.id)}
        />
      )}
    </div>
  );
}
