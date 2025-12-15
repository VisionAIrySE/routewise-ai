import { useState, useMemo, useEffect } from 'react';
import { Timer, BarChart, RefreshCw, Save, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RouteDay, RouteStop } from '@/lib/routeUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  route: RouteDay;
  onSave: (updatedRoute: RouteDay) => void;
  onRecalculate?: (updatedStops: RouteStop[]) => void;
}

const DURATION_PRESETS = [10, 15, 20, 30, 45, 60, 90, 120];

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getCompanyVariant(company: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (company?.toUpperCase()) {
    case 'IPI': return 'secondary';
    case 'MIL': return 'default';
    case 'SIG': return 'outline';
    default: return 'secondary';
  }
}

export function DurationReviewModal({
  isOpen,
  onClose,
  route,
  onSave,
  onRecalculate,
}: Props) {
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [applyToFuture, setApplyToFuture] = useState(false);

  // Initialize stops when route changes
  useEffect(() => {
    if (route?.stops) {
      setStops([...route.stops]);
    }
  }, [route]);

  // Track original durations to detect changes
  const originalDurations = useMemo(
    () => route?.stops?.map((s) => s.duration_minutes) || [],
    [route?.stops]
  );

  // Calculate totals
  const totalInspectionMinutes = stops.reduce(
    (sum, stop) => sum + (stop.duration_minutes || 15),
    0
  );
  const totalDriveMinutes = stops.reduce(
    (sum, stop) => sum + (stop.drive_minutes_to_next || 0),
    0
  );
  const totalRouteMinutes = totalInspectionMinutes + totalDriveMinutes;

  // Check if durations changed significantly (>15 min total)
  const durationDelta = stops.reduce((sum, stop, i) => {
    const original = originalDurations[i] ?? stop.duration_minutes;
    return sum + Math.abs((stop.duration_minutes || 15) - original);
  }, 0);
  const significantChange = durationDelta > 15;
  const hasChanges = durationDelta > 0;

  const handleDurationChange = (stopId: string, newDuration: number) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId ? { ...stop, duration_minutes: newDuration } : stop
      )
    );
  };

  const handleSave = () => {
    const updatedRoute: RouteDay = {
      ...route,
      stops,
      summary: {
        ...route.summary,
        inspection_hours: totalInspectionMinutes / 60,
        total_route_hours: totalRouteMinutes / 60,
      },
    };
    onSave(updatedRoute);
  };

  const handleRecalculate = () => {
    if (onRecalculate) {
      onRecalculate(stops);
    }
  };

  if (!route) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Review Stop Durations
          </DialogTitle>
          <DialogDescription>
            Review and adjust inspection times before saving. Total route time
            will be recalculated.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[350px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="w-20">Company</TableHead>
                <TableHead className="w-32">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stops.map((stop, index) => {
                const isHighValue =
                  stop.company?.toUpperCase() === 'SIG' &&
                  (stop.duration_minutes || 0) >= 60;

                return (
                  <TableRow key={stop.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{stop.address}</div>
                      <div className="text-xs text-muted-foreground">
                        {stop.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCompanyVariant(stop.company)}>
                        {stop.company}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(stop.duration_minutes || 15)}
                          onValueChange={(v) =>
                            handleDurationChange(stop.id, parseInt(v))
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_PRESETS.map((d) => (
                              <SelectItem key={d} value={String(d)}>
                                {d} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isHighValue && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                High-value inspection - typically 60-90 min
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Route Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
            <BarChart className="h-4 w-4" />
            Route Summary
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Inspection:</span>
              <span className="ml-2 font-medium">
                {formatMinutes(totalInspectionMinutes)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Driving:</span>
              <span className="ml-2 font-medium">
                {formatMinutes(totalDriveMinutes)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-2 font-medium">
                {formatMinutes(totalRouteMinutes)}
              </span>
            </div>
          </div>

          {significantChange && (
            <Alert className="mt-3 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                Duration changed by {durationDelta} minutes. Route timing may
                shift significantly.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="apply-future"
            checked={applyToFuture}
            onCheckedChange={(c) => setApplyToFuture(!!c)}
          />
          <label
            htmlFor="apply-future"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Remember these durations for similar properties
          </label>
        </div>

        <DialogFooter className="mt-4 flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {significantChange && onRecalculate && (
            <Button variant="secondary" onClick={handleRecalculate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate Route
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
