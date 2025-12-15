import { useState, useMemo } from 'react';
import { RouteMap } from './RouteMap';
import { RouteSummaryCard } from './RouteSummaryCard';
import { RouteStopList } from './RouteStopList';
import { DurationReviewModal } from './DurationReviewModal';
import { generatePrintWindowHTML } from './PrintableRoute';
import { Button } from '@/components/ui/button';
import { Copy, Printer, Map, List, Save, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RouteDay, RouteOptimizerResponse, RouteStop } from '@/lib/routeUtils';
import { useSaveRoute } from '@/hooks/useSavedRoutes';
import { supabase } from '@/integrations/supabase/client';

interface RouteViewProps {
  routes: RouteDay[];
  homeBase: { lat: number; lng: number; address: string };
  fullResponse?: RouteOptimizerResponse;
  onSaveRoute?: (route: RouteDay) => Promise<void>;
  onRecalculate?: (excludeIds: string[]) => void;
}

export function RouteView({ routes: initialRoutes, homeBase, fullResponse, onSaveRoute, onRecalculate }: RouteViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [markedDone, setMarkedDone] = useState<string[]>([]);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [showDurationReview, setShowDurationReview] = useState(false);
  // Track duration overrides separately
  const [durationOverrides, setDurationOverrides] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { mutateAsync: saveRoute, isPending: isSaving } = useSaveRoute();

  // Apply duration overrides to routes
  const routes = useMemo(() => {
    return initialRoutes.map(route => ({
      ...route,
      stops: route.stops.map(stop => ({
        ...stop,
        duration_minutes: durationOverrides[stop.id] ?? stop.duration_minutes
      }))
    }));
  }, [initialRoutes, durationOverrides]);

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

  // Opens the duration review modal before saving
  const handleSaveClick = () => {
    setShowDurationReview(true);
  };

  // Called when user confirms save in the duration review modal
  const handleSaveConfirmed = async (updatedRoute: RouteDay) => {
    setShowDurationReview(false);
    
    try {
      if (onSaveRoute) {
        await onSaveRoute(updatedRoute);
      } else {
        await saveRoute({ route: updatedRoute, fullResponse });
      }
      toast({
        title: 'Route Saved!',
        description: `${updatedRoute.day} route saved to calendar`
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save the route. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Called when user wants to recalculate with new durations
  const handleDurationRecalculate = (updatedStops: RouteStop[]) => {
    setShowDurationReview(false);
    
    // Update local duration overrides
    const newOverrides: Record<string, number> = {};
    updatedStops.forEach(stop => {
      newOverrides[stop.id] = stop.duration_minutes;
    });
    setDurationOverrides(prev => ({ ...prev, ...newOverrides }));
    
    toast({
      title: 'Durations Updated',
      description: 'Route times have been updated. Save when ready.'
    });
  };

  const handleMarkDone = async (stopId: string) => {
    setIsMarkingDone(true);
    try {
      // Mark inspection as completed in database
      const { error } = await supabase
        .from('inspections')
        .update({ 
          status: 'COMPLETED', 
          completed_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', stopId);

      if (error) throw error;

      // Update local state
      setMarkedDone(prev => [...prev, stopId]);
      
      const stop = currentRoute.stops.find(s => s.id === stopId);
      toast({
        title: 'Marked Complete',
        description: `${stop?.name || 'Stop'} marked as done`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark stop as complete',
        variant: 'destructive'
      });
    } finally {
      setIsMarkingDone(false);
    }
  };

  const handleDurationChange = (stopId: string, duration: number) => {
    // Update duration in local state
    setDurationOverrides(prev => ({
      ...prev,
      [stopId]: duration
    }));
    toast({
      title: 'Duration Updated',
      description: `Stop duration changed to ${duration} minutes`
    });
  };

  // Toggle stop selection (click same stop to close)
  const handleStopClick = (stop: RouteStop) => {
    setSelectedStopId(prev => prev === stop.id ? null : stop.id);
  };

  const handleRecalculate = () => {
    if (markedDone.length === 0) return;
    
    if (onRecalculate) {
      onRecalculate(markedDone);
    } else {
      toast({
        title: 'Recalculate',
        description: `Would recalculate route excluding ${markedDone.length} completed stops`
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
            onClick={handleSaveClick}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Route
          </Button>
          
          {/* Recalculate Button - appears when stops are marked done */}
          {markedDone.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRecalculate}
              disabled={isMarkingDone}
            >
              {isMarkingDone ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Recalculate ({markedDone.length} done)
            </Button>
          )}
          
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
                  stops={currentRoute.stops.filter(s => !markedDone.includes(s.id))}
                  homeBase={homeBase}
                  onStopClick={handleStopClick}
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <RouteStopList
                  stops={currentRoute.stops}
                  selectedStopId={selectedStopId || undefined}
                  onStopClick={handleStopClick}
                  onDurationChange={handleDurationChange}
                  onMarkDone={handleMarkDone}
                  completedStopIds={markedDone}
                />
              </div>
            </div>
          ) : (
            <RouteStopList
              stops={currentRoute.stops}
              selectedStopId={selectedStopId || undefined}
              onStopClick={handleStopClick}
              onDurationChange={handleDurationChange}
              onMarkDone={handleMarkDone}
              completedStopIds={markedDone}
            />
          )}
        </div>
      </div>

      {/* Duration Review Modal */}
      <DurationReviewModal
        isOpen={showDurationReview}
        onClose={() => setShowDurationReview(false)}
        route={currentRoute}
        onSave={handleSaveConfirmed}
        onRecalculate={handleDurationRecalculate}
      />
    </div>
  );
}
