import { Calendar, MapPin, Clock, Fuel, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { useSavedRoutes, type SavedRouteDB } from '@/hooks/useSavedRoutes';
import type { SavedRoute } from '@/lib/routeUtils';
import { useEffect, useRef, useState } from 'react';

interface SavedRoutesProps {
  onSelectRoute?: (route: SavedRoute) => void;
}

export function SavedRoutes({ onSelectRoute }: SavedRoutesProps) {
  const { data: routes = [], isLoading, error, refetch } = useSavedRoutes();
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Convert SavedRouteDB to SavedRoute format for compatibility
  const handleRouteClick = (route: SavedRouteDB) => {
    const savedRoute: SavedRoute = {
      id: route.id,
      date: route.route_date,
      stops_count: route.stops_count,
      total_hours: route.total_hours ?? 0,
      total_miles: route.total_miles ?? 0,
      drive_hours: route.drive_hours ?? 0,
      fuel_cost: route.fuel_cost ?? 0,
      zones: route.zones?.join(', ') || '',
      start_time: route.start_time || undefined,
      finish_time: route.finish_time || undefined,
      stops: route.stops_json || [],
    };
    onSelectRoute?.(savedRoute);
  };

  // Check if there's more content to scroll
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setCanScrollDown(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 10);
      }
    };

    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [routes]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
        Loading saved routes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive text-sm mb-2">Failed to load saved routes</p>
        <button
          onClick={() => refetch()}
          className="text-xs text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No saved routes yet. Create and save a route to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium text-foreground">Saved Routes</h3>
        <button
          onClick={() => refetch()}
          className="p-1 hover:bg-muted rounded"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="space-y-2 max-h-[300px] overflow-y-auto pr-1"
        >
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => handleRouteClick(route)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{formatDate(route.route_date)}</span>
                    {route.zones && route.zones.length > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded truncate max-w-[100px]">
                        {route.zones.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {route.stops_count} stops
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {route.total_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      ${route.fuel_cost}
                    </span>
                  </div>

                  {route.start_time && route.finish_time && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {route.start_time} - {route.finish_time} · {route.total_miles} mi
                    </div>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator - fade gradient + chevron */}
        {canScrollDown && (
          <div className="absolute bottom-0 left-0 right-1 pointer-events-none">
            <div className="h-12 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="bg-muted/90 rounded-full p-1 animate-bounce">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
