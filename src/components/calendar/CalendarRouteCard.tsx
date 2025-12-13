import { MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SavedRouteDB } from '@/hooks/useSavedRoutes';
import { cn } from '@/lib/utils';

interface CalendarRouteCardProps {
  route: SavedRouteDB;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  planned: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

export function CalendarRouteCard({ route, onClick }: CalendarRouteCardProps) {
  const statusLabel = route.status.replace('_', ' ');

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-md px-2 py-1.5 text-xs cursor-pointer transition-all',
        'border hover:shadow-sm',
        statusColors[route.status] || statusColors.planned
      )}
    >
      <div className="flex items-center gap-1 font-medium truncate">
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
      {route.zones && route.zones.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {route.zones.slice(0, 2).map((zone) => (
            <Badge
              key={zone}
              variant="outline"
              className="text-[9px] px-1 py-0 h-4"
            >
              {zone}
            </Badge>
          ))}
          {route.zones.length > 2 && (
            <span className="text-[9px] opacity-60">+{route.zones.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}
