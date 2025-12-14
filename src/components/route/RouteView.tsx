import { useState } from 'react';
import { RouteMap } from './RouteMap';
import { RouteSummaryCard } from './RouteSummaryCard';
import { RouteStopList } from './RouteStopList';
import { generatePrintWindowHTML } from './PrintableRoute';
import { Button } from '@/components/ui/button';
import { Copy, Printer, Map, List, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RouteDay, RouteOptimizerResponse } from '@/lib/routeUtils';
import { useSaveRoute } from '@/hooks/useSavedRoutes';

interface RouteViewProps {
  routes: RouteDay[];
  homeBase: { lat: number; lng: number; address: string };
  fullResponse?: RouteOptimizerResponse;
  onSaveRoute?: (route: RouteDay) => Promise<void>;
}

export function RouteView({ routes, homeBase, fullResponse, onSaveRoute }: RouteViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { toast } = useToast();
  const { mutateAsync: saveRoute, isPending: isSaving } = useSaveRoute();

  const currentRoute = routes[selectedDay];
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const copyAddresses = () => {
    const addresses = [
      `Start: ${homeBase.address}`,
      ...currentRoute.stops.map((stop, i) => `${i + 1}. ${stop.address}`),
      `Return: ${homeBase.address}`
    ].join('\n');
    navigator.clipboard.writeText(addresses);
    toast({
      title: 'Copied!',
      description: `${currentRoute.stops.length} addresses copied to clipboard`
    });
  };


  const printRoute = () => {
    const html = generatePrintWindowHTML(currentRoute, homeBase, googleMapsApiKey);
    
    // Create Blob and open in new tab
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    
    if (newWindow) {
      newWindow.onload = () => {
        URL.revokeObjectURL(blobUrl);
      };
      toast({
        title: 'Print Preview Opened',
        description: 'Click the Print button in the new tab',
      });
    } else {
      URL.revokeObjectURL(blobUrl);
      toast({
        title: 'Popup Blocked',
        description: 'Please allow popups for this site to print',
        variant: 'destructive',
      });
    }
  };

  const handleSaveRoute = async () => {
    // Prefer using the mutation directly, fallback to callback for backwards compatibility
    try {
      if (onSaveRoute) {
        await onSaveRoute(currentRoute);
      } else {
        await saveRoute({ route: currentRoute, fullResponse });
      }
      toast({
        title: 'Route Saved!',
        description: `${currentRoute.day} route saved to calendar`
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save the route. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Screen Version */}
      <div className="no-print">
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
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyAddresses}
            disabled={currentRoute.stops.length === 0}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Addresses
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={printRoute}
            disabled={currentRoute.stops.length === 0}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Route
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSaveRoute}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Route
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
        <div className="mt-4">
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
      </div>
    </div>
  );
}
