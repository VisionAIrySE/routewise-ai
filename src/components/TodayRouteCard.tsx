import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Route as RouteIcon, CheckCircle, Circle, Timer, Loader2, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTodayRoute, useRouteStops } from '@/hooks/useRoutes';
import { getUrgencyColor } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function TodayRouteCard() {
  const { data: todayRoute, isLoading: routeLoading } = useTodayRoute();
  const { data: stops = [], isLoading: stopsLoading } = useRouteStops(todayRoute?.id || '');

  const isLoading = routeLoading || stopsLoading;

  const formatDriveTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!todayRoute) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <CalendarX className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">No Route Today</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Use the AI assistant to plan a route for today.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <RouteIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Today's Route</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(todayRoute.routeDate), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
        <Link to={`/routes/${todayRoute.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Route Summary */}
      <div className="flex flex-wrap items-center gap-4 mb-5 pb-5 border-b border-border">
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{todayRoute.plannedCount} stops</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatDriveTime(todayRoute.totalEstDriveTime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <RouteIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{todayRoute.totalDistanceMiles} miles</span>
        </div>
        {todayRoute.geographicFocus && (
          <Badge variant="secondary">{todayRoute.geographicFocus}</Badge>
        )}
      </div>

      {/* Stop List */}
      <div className="space-y-3">
        {stops.slice(0, 4).map((stop, index) => (
          <div
            key={stop.id}
            className={cn(
              'flex items-center gap-3 py-2',
              index < Math.min(stops.length, 4) - 1 && 'border-b border-border/50'
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {stop.stopOrder}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {stop.inspection?.street || 'Unknown'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {stop.inspection && (
                  <>
                    <Badge 
                      variant={stop.inspection.company === 'MIL' ? 'default' : stop.inspection.company === 'IPI' ? 'secondary' : 'fixed'} 
                      className="text-[10px] px-1.5 py-0"
                    >
                      {stop.inspection.company}
                    </Badge>
                    <Badge 
                      variant={getUrgencyColor(stop.inspection.urgencyTier) as any} 
                      className="text-[10px] px-1.5 py-0"
                    >
                      {stop.inspection.urgencyTier}
                    </Badge>
                    {stop.inspection.fixedAppointment && (
                      <span className="flex items-center gap-1 text-[10px] text-fixed font-medium">
                        <Timer className="h-3 w-3" />
                        {format(new Date(stop.inspection.fixedAppointment), 'h:mm a')}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {stop.status === 'COMPLETED' ? (
              <CheckCircle className="h-5 w-5 text-normal shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            )}
          </div>
        ))}
        {stops.length > 4 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{stops.length - 4} more stops
          </p>
        )}
        {stops.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No stops planned yet
          </p>
        )}
      </div>
    </div>
  );
}
