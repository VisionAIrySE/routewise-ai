import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { MissingInspection, confirmReconciliation } from '@/lib/routeUtils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReconcileInspectionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspections: MissingInspection[];
  company: string;
  onComplete: (completedCount: number, removedCount: number) => void;
}

type InspectionStatus = 'completed' | 'removed' | null;

export function ReconcileInspections({
  open,
  onOpenChange,
  inspections,
  company,
  onComplete
}: ReconcileInspectionsProps) {
  const [statuses, setStatuses] = useState<Record<string, InspectionStatus>>(() => {
    // Default all to completed
    const initial: Record<string, InspectionStatus> = {};
    inspections.forEach(insp => {
      initial[insp.id] = 'completed';
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleStatus = (id: string) => {
    setStatuses(prev => ({
      ...prev,
      [id]: prev[id] === 'completed' ? 'removed' : 'completed'
    }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);

    const completedIds: string[] = [];
    const removedIds: string[] = [];

    Object.entries(statuses).forEach(([id, status]) => {
      if (status === 'completed') {
        completedIds.push(id);
      } else if (status === 'removed') {
        removedIds.push(id);
      }
    });

    const result = await confirmReconciliation(completedIds, removedIds);

    setIsSubmitting(false);

    if (result.success) {
      onComplete(result.completed_count, result.removed_count);
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const completedCount = Object.values(statuses).filter(s => s === 'completed').length;
  const removedCount = Object.values(statuses).filter(s => s === 'removed').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {inspections.length} inspection{inspections.length !== 1 ? 's' : ''} no longer in {company} export
          </DialogTitle>
          <DialogDescription>
            Click each inspection to toggle between Completed and Removed/Cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 py-4 min-h-0">
          {inspections.map((insp) => {
            const status = statuses[insp.id];
            const isCompleted = status === 'completed';

            return (
              <div
                key={insp.id}
                onClick={() => toggleStatus(insp.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isCompleted
                    ? 'border-green-300 bg-green-50 dark:bg-green-950/30'
                    : 'border-red-300 bg-red-50 dark:bg-red-950/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {insp.insured_name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                        {insp.company}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {insp.address}
                    </p>
                    <p className="text-xs mt-1">
                      <span className={`font-medium ${
                        insp.urgency === 'CRITICAL' ? 'text-red-600' :
                        insp.urgency === 'URGENT' ? 'text-orange-600' :
                        insp.urgency === 'SOON' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {insp.urgency}
                      </span>
                      {insp.days_remaining !== undefined && (
                        <span className="text-muted-foreground ml-2">
                          ({insp.days_remaining} days remaining)
                        </span>
                      )}
                    </p>
                  </div>

                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    isCompleted
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                  }`}>
                    {isCompleted ? 'Completed' : 'Removed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-sm text-muted-foreground text-center py-2 border-t">
          <span className="text-green-600 font-medium">{completedCount} Completed</span>
          {' · '}
          <span className="text-red-600 font-medium">{removedCount} Removed</span>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>
            Skip for Now
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
