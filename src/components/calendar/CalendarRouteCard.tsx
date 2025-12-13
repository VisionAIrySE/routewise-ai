import { MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SavedRouteDB } from '@/hooks/useSavedRoutes';
import { cn } from '@/lib/utils';

interface CalendarRouteCardProps {
  route: SavedRouteDB;
  onClick: () => void;
  expanded?: boolean;
}

const statusColors: Record<string, string> = {
  planned: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

export function CalendarRouteCard({ route, onClick, expanded = false }: CalendarRouteCardProps) {
  const statusLabel = route.status.replace('_', ' ');

  if (expanded) {
    // Expanded view for week/list mode
    return (
      <div
        onClick={onClick}
        className={cn(
          'rounded-lg p-3 cursor-pointer transition-all',
          'border hover:shadow-md',
          statusColors[route.status] || statusColors.planned
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-medium">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{route.route_name || 'Route'}</span>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {statusLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm opacity-80">
          <span>{route.stops_count} stops</span>
          {route.total_hours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {route.total_hours.toFixed(1)} hours
            </span>
          )}
          {route.total_miles && (
            <span>{route.total_miles.toFixed(0)} miles</span>
          )}
        </div>
        {route.zones && route.zones.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {route.zones.map((zone) => (
              <Badge
                key={zone}
                variant="outline"
                className="text-xs"
              >
                {zone}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Compact view for month grid
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-md px-2 py-1.5 text-xs cursor-pointer transition-all',
        'border hover:shadow-sm overflow-hidden',
        statusColors[route.status] || statusColors.planned
      )}
    >
      <div className="flex items-center gap-1 font-medium">
        <MapPin className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">
          {route.route_name || 'Route'}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80">
        <span>{route.stops_count} stops</span>
        {route.total_hours && (
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {route.total_hours.toFixed(1)}h
          </span>
        )}
      </div>
    </div>
  );
}
