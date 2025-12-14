import { ChevronRight, Phone, Clock, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

interface RouteStop {
  id: string;
  order: number;
  name: string;
  address: string;
  company: string;
  urgency: string;
  duration_minutes: number;
  drive_minutes_to_next: number | null;
  drive_miles_to_next: number | null;
  needs_call_ahead: boolean;
  scheduled_time?: string;
}

interface RouteStopListProps {
  stops: RouteStop[];
  onStopClick?: (stop: RouteStop) => void;
  selectedStopId?: string;
  onDurationChange?: (stopId: string, duration: number) => void;
  onMarkDone?: (stopId: string) => void;
  completedStopIds?: string[];
}

export function RouteStopList({ 
  stops, 
  onStopClick, 
  selectedStopId,
  onDurationChange,
  onMarkDone,
  completedStopIds = []
}: RouteStopListProps) {
  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-500';
      case 'URGENT': return 'bg-orange-500';
      case 'SOON': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const handleDurationClick = (e: React.MouseEvent, stopId: string, duration: number) => {
    e.stopPropagation();
    onDurationChange?.(stopId, duration);
  };

  const handleMarkDone = (e: React.MouseEvent, stopId: string) => {
    e.stopPropagation();
    onMarkDone?.(stopId);
  };

  return (
    <div className="space-y-2">
      {stops.map((stop, index) => {
        const isCompleted = completedStopIds.includes(stop.id);
        
        return (
          <div key={stop.id}>
            {/* Stop Card */}
            <div
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all relative",
                isCompleted 
                  ? "opacity-50 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                  : selectedStopId === stop.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
              )}
              onClick={() => onStopClick?.(stop)}
            >
              {isCompleted && (
                <CheckCircle className="h-5 w-5 text-green-600 absolute top-2 right-2" />
              )}
              
              <div className="flex items-start gap-3">
                {/* Order Number */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  isCompleted ? "bg-green-500" : getUrgencyStyles(stop.urgency)
                )}>
                  {isCompleted ? "✓" : stop.order}
                </div>

                {/* Stop Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium truncate",
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {stop.name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                      {stop.company}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stop.address}</p>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
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

                    {stop.company === 'SIG' && (
                      <span className="text-xs text-purple-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Appt req'd
                      </span>
                    )}

                    {stop.scheduled_time && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {stop.scheduled_time}
                      </span>
                    )}

                    {/* Mark as Done Button */}
                    {!isCompleted && onMarkDone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => handleMarkDone(e, stop.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Button>
                    )}
                  </div>
                </div>

                {!isCompleted && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
              </div>

              {/* Duration Selector - shows when stop is selected */}
              {selectedStopId === stop.id && onDurationChange && !isCompleted && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Duration:</span>
                    {DURATION_OPTIONS.map((duration) => (
                      <Button
                        key={duration}
                        variant={stop.duration_minutes === duration ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => handleDurationClick(e, stop.id, duration)}
                      >
                        {duration}m
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drive Time/Distance to Next */}
            {stop.drive_minutes_to_next && index < stops.length - 1 && !isCompleted && (
              <div className="flex items-center gap-2 py-1 pl-4">
                <div className="w-0.5 h-4 bg-blue-200 ml-3.5"></div>
                <span className="text-xs text-muted-foreground">
                  {stop.drive_minutes_to_next} min · {stop.drive_miles_to_next} mi
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Return Home */}
      {stops.length > 0 && stops[stops.length - 1].drive_minutes_to_next && (
        <div className="flex items-center gap-2 py-1 pl-4">
          <div className="w-0.5 h-4 bg-blue-200 ml-3.5"></div>
          <span className="text-xs text-muted-foreground">
            {stops[stops.length - 1].drive_minutes_to_next} min · {stops[stops.length - 1].drive_miles_to_next} mi home
          </span>
        </div>
      )}
    </div>
  );
}
