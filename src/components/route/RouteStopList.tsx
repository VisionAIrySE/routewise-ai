import { ChevronRight, Phone, Clock, AlertTriangle } from 'lucide-react';

interface RouteStop {
  id: string;
  order: number;
  name: string;
  address: string;
  company: string;
  urgency: string;
  duration_minutes: number;
  drive_minutes_to_next: number | null;
  needs_call_ahead: boolean;
  scheduled_time?: string;
}

interface RouteStopListProps {
  stops: RouteStop[];
  onStopClick?: (stop: RouteStop) => void;
  selectedStopId?: string;
}

export function RouteStopList({ stops, onStopClick, selectedStopId }: RouteStopListProps) {
  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-500';
      case 'URGENT': return 'bg-orange-500';
      case 'SOON': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-2">
      {stops.map((stop, index) => (
        <div key={stop.id}>
          {/* Stop Card */}
          <div
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedStopId === stop.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
            onClick={() => onStopClick?.(stop)}
          >
            <div className="flex items-start gap-3">
              {/* Order Number */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getUrgencyStyles(stop.urgency)}`}>
                {stop.order}
              </div>

              {/* Stop Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {stop.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                    {stop.company}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{stop.address}</p>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {stop.duration_minutes} min
                  </span>

                  {stop.needs_call_ahead && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Call ahead
                    </span>
                  )}

                  {stop.scheduled_time && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {stop.scheduled_time}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Drive Time to Next */}
          {stop.drive_minutes_to_next && index < stops.length - 1 && (
            <div className="flex items-center gap-2 py-1 pl-4">
              <div className="w-0.5 h-4 bg-blue-200 ml-3.5"></div>
              <span className="text-xs text-muted-foreground">
                {stop.drive_minutes_to_next} min drive
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Return Home */}
      {stops.length > 0 && stops[stops.length - 1].drive_minutes_to_next && (
        <div className="flex items-center gap-2 py-1 pl-4">
          <div className="w-0.5 h-4 bg-blue-200 ml-3.5"></div>
          <span className="text-xs text-muted-foreground">
            {stops[stops.length - 1].drive_minutes_to_next} min drive home
          </span>
        </div>
      )}
    </div>
  );
}
