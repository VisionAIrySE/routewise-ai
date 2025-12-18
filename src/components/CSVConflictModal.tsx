import { useState } from 'react';
import { AlertTriangle, Check, X, Clock, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

export interface ConflictItem {
  type: 'duplicate' | 'time_overlap' | 'address_match';
  existing: {
    id: string;
    address: string;
    date?: string;
    time?: string;
    company?: string;
    insured_name?: string;
  };
  incoming: {
    id?: string;
    address: string;
    date?: string;
    time?: string;
    company?: string;
    insured_name?: string;
  };
  suggested_action: 'keep_existing' | 'use_new' | 'keep_both';
}

export interface ConflictResolution {
  existing_id: string;
  incoming_id?: string;
  action: 'keep_existing' | 'use_new' | 'keep_both' | 'skip';
}

interface CSVConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictItem[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
}

export function CSVConflictModal({
  open,
  onOpenChange,
  conflicts,
  onResolve,
  onCancel,
}: CSVConflictModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, string>>(() => {
    // Initialize with suggested actions
    const initial: Record<string, string> = {};
    conflicts.forEach((conflict, index) => {
      initial[`conflict-${index}`] = conflict.suggested_action;
    });
    return initial;
  });

  const handleResolutionChange = (conflictKey: string, action: string) => {
    setResolutions(prev => ({ ...prev, [conflictKey]: action }));
  };

  const handleApply = () => {
    const resolvedConflicts: ConflictResolution[] = conflicts.map((conflict, index) => ({
      existing_id: conflict.existing.id,
      incoming_id: conflict.incoming.id,
      action: resolutions[`conflict-${index}`] as ConflictResolution['action'],
    }));
    onResolve(resolvedConflicts);
  };

  const getConflictIcon = (type: ConflictItem['type']) => {
    switch (type) {
      case 'duplicate':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'time_overlap':
        return <Clock className="h-4 w-4 text-fixed" />;
      case 'address_match':
        return <MapPin className="h-4 w-4 text-primary" />;
    }
  };

  const getConflictLabel = (type: ConflictItem['type']) => {
    switch (type) {
      case 'duplicate':
        return 'Duplicate Inspection';
      case 'time_overlap':
        return 'Time Conflict';
      case 'address_match':
        return 'Same Address';
    }
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return 'No date set';
    try {
      const formatted = format(parseISO(date), 'MMM d, yyyy');
      return time ? `${formatted} at ${time}` : formatted;
    } catch {
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            {conflicts.map((conflict, index) => (
              <div
                key={`conflict-${index}`}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  {getConflictIcon(conflict.type)}
                  <Badge variant="outline">{getConflictLabel(conflict.type)}</Badge>
                </div>

                {/* Existing Record */}
                <div className="bg-muted/50 rounded-md p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Existing</span>
                    {conflict.existing.company && (
                      <Badge variant="secondary" className="text-xs">{conflict.existing.company}</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{conflict.existing.insured_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{conflict.existing.address}</p>
                  <p className="text-xs text-fixed">
                    {formatDateTime(conflict.existing.date, conflict.existing.time)}
                  </p>
                </div>

                {/* Incoming Record */}
                <div className="bg-primary/5 rounded-md p-3 space-y-1 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary uppercase">New Import</span>
                    {conflict.incoming.company && (
                      <Badge variant="secondary" className="text-xs">{conflict.incoming.company}</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{conflict.incoming.insured_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{conflict.incoming.address}</p>
                  <p className="text-xs text-primary">
                    {formatDateTime(conflict.incoming.date, conflict.incoming.time)}
                  </p>
                </div>

                {/* Resolution Options */}
                <RadioGroup
                  value={resolutions[`conflict-${index}`]}
                  onValueChange={(value) => handleResolutionChange(`conflict-${index}`, value)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem
                      value="keep_existing"
                      id={`keep-existing-${index}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`keep-existing-${index}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <X className="mb-1 h-4 w-4" />
                      <span className="text-xs">Keep Existing</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="use_new"
                      id={`use-new-${index}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`use-new-${index}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <Check className="mb-1 h-4 w-4" />
                      <span className="text-xs">Use New</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="keep_both"
                      id={`keep-both-${index}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`keep-both-${index}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <span className="mb-1 text-sm font-bold">+</span>
                      <span className="text-xs">Keep Both</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel Import
          </Button>
          <Button onClick={handleApply}>
            Apply Resolutions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
