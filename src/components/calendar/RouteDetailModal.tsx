import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MapPin,
  Clock,
  Fuel,
  Route as RouteIcon,
  Copy,
  Trash2,
  Calendar,
  Edit,
  Building2,
  Phone,
} from 'lucide-react';
import type { SavedRouteDB } from '@/hooks/useSavedRoutes';
import { useUpdateRouteStatus, useDeleteRoute } from '@/hooks/useSavedRoutes';
import { copyAddressesToClipboard, openInGoogleMaps } from '@/lib/routeUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RouteDetailModalProps {
  route: SavedRouteDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditRoute?: (route: SavedRouteDB) => void;
  onDuplicateRoute?: (route: SavedRouteDB) => void;
}

const urgencyColors: Record<string, string> = {
  CRITICAL: 'bg-destructive text-destructive-foreground',
  URGENT: 'bg-warning text-warning-foreground',
  SOON: 'bg-soon text-soon-foreground',
  NORMAL: 'bg-success text-success-foreground',
  FIXED: 'bg-fixed text-fixed-foreground',
};

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function RouteDetailModal({
  route,
  open,
  onOpenChange,
  onEditRoute,
  onDuplicateRoute,
}: RouteDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateStatus = useUpdateRouteStatus();
  const deleteRoute = useDeleteRoute();

  if (!route) return null;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { routeId: route.id, status: newStatus as SavedRouteDB['status'] },
      {
        onSuccess: () => toast.success('Status updated'),
        onError: () => toast.error('Failed to update status'),
      }
    );
  };

  const handleCopyAddresses = () => {
    const addresses = route.stops_json.map((stop) => stop.address);
    const count = copyAddressesToClipboard(addresses);
    toast.success(`${count} addresses copied to clipboard`);
  };

  const handleOpenInMaps = () => {
    const stops = route.stops_json || [];
    if (stops.length === 0) {
      toast.error('No stops found in route');
      return;
    }
    const addresses = stops.map((stop) => stop.address).filter(Boolean);
    if (addresses.length === 0) {
      toast.error('No addresses found in route stops');
      return;
    }
    const success = openInGoogleMaps(addresses);
    if (!success) {
      toast.error('Could not open Google Maps');
    }
  };

  const handleDelete = () => {
    deleteRoute.mutate(route.id, {
      onSuccess: () => {
        toast.success('Route deleted');
        onOpenChange(false);
      },
      onError: () => toast.error('Failed to delete route'),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl">
                  {route.route_name || 'Planned Route'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(route.route_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <Select
                value={route.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          {/* Route Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-border">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{route.stops_count}</p>
                <p className="text-xs text-muted-foreground">Stops</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {route.total_hours?.toFixed(1) || '-'}h
                </p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {route.total_miles?.toFixed(1) || '-'} mi
                </p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  ${route.fuel_cost?.toFixed(2) || '-'}
                </p>
                <p className="text-xs text-muted-foreground">Fuel</p>
              </div>
            </div>
          </div>

          {/* Time Range & Zones */}
          <div className="flex flex-wrap gap-2 items-center text-sm">
            {route.start_time && route.finish_time && (
              <span className="text-muted-foreground">
                {route.start_time} - {route.finish_time}
              </span>
            )}
            {route.zones && route.zones.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {route.zones.map((zone) => (
                  <Badge key={zone} variant="secondary" className="text-xs">
                    {zone}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Stops List */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2 py-2">
              {route.stops_json.map((stop, index) => (
                <div
                  key={stop.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    {stop.order || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{stop.name}</span>
                      {stop.company && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {stop.company}
                        </Badge>
                      )}
                      {stop.urgency && (
                        <Badge
                          className={cn(
                            'text-xs',
                            urgencyColors[stop.urgency] || urgencyColors.NORMAL
                          )}
                        >
                          {stop.urgency}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {stop.address}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {stop.scheduled_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {stop.scheduled_time}
                        </span>
                      )}
                      {stop.duration_minutes && (
                        <span>{stop.duration_minutes} min</span>
                      )}
                      {stop.needs_call_ahead && (
                        <span className="flex items-center gap-1 text-fixed">
                          <Phone className="h-3 w-3" />
                          Call ahead
                        </span>
                      )}
                      {stop.days_remaining !== undefined && (
                        <span>
                          {stop.days_remaining <= 0
                            ? 'Overdue'
                            : `${stop.days_remaining}d remaining`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {onEditRoute && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onEditRoute(route);
                  onOpenChange(false);
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Route
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleOpenInMaps}>
              <MapPin className="h-4 w-4 mr-1" />
              Open in Maps
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyAddresses}>
              <Copy className="h-4 w-4 mr-1" />
              Copy Addresses
            </Button>
            {onDuplicateRoute && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDuplicateRoute(route);
                  onOpenChange(false);
                }}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive ml-auto"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this route? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
