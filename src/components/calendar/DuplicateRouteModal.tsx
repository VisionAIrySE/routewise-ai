import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useDuplicateRoute, type SavedRouteDB } from '@/hooks/useSavedRoutes';
import { toast } from 'sonner';

interface DuplicateRouteModalProps {
  route: SavedRouteDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateRouteModal({
  route,
  open,
  onOpenChange,
}: DuplicateRouteModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const duplicateRoute = useDuplicateRoute();

  if (!route) return null;

  const handleDuplicate = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    duplicateRoute.mutate(
      { routeId: route.id, newDate: selectedDate },
      {
        onSuccess: () => {
          toast.success(`Route duplicated to ${format(selectedDate, 'MMM d, yyyy')}`);
          onOpenChange(false);
          setSelectedDate(undefined);
        },
        onError: () => toast.error('Failed to duplicate route'),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate Route to New Date</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select a date to copy this route to:
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={!selectedDate || duplicateRoute.isPending}
          >
            {duplicateRoute.isPending ? 'Duplicating...' : 'Duplicate Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
