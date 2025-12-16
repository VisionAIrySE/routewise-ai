import { MapPin, Clock, Building2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Inspection, getUrgencyColor } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface InspectionCardProps {
  inspection: Inspection;
  onClick?: () => void;
}

export function InspectionCard({ inspection, onClick }: InspectionCardProps) {
  const urgencyColor = getUrgencyColor(inspection.urgencyTier);
  
  const formatDueDate = () => {
    if (inspection.daysRemaining === 999) return 'No due date';
    if (inspection.daysRemaining === 0) return 'Due TODAY';
    if (inspection.daysRemaining < 0) return `${Math.abs(inspection.daysRemaining)} days overdue`;
    if (!inspection.dueDate) return 'No due date';
    const date = new Date(inspection.dueDate);
    if (isNaN(date.getTime())) return 'No due date';
    return `Due ${format(date, 'MMM d')}`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border bg-card p-4 transition-all hover:shadow-md animate-slide-up',
        onClick && 'hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'h-2.5 w-2.5 rounded-full',
              urgencyColor === 'critical' && 'bg-critical',
              urgencyColor === 'urgent' && 'bg-urgent',
              urgencyColor === 'soon' && 'bg-soon',
              urgencyColor === 'normal' && 'bg-normal'
            )} />
            <span className="text-sm font-medium text-foreground truncate">
              {inspection.street}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">
              {inspection.city}, {inspection.state} {inspection.zip}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={inspection.company === 'MIL' ? 'default' : inspection.company === 'IPI' ? 'secondary' : 'fixed'}>
              {inspection.company}
            </Badge>
            <Badge variant={urgencyColor as any}>
              {inspection.urgencyTier}
            </Badge>
            {inspection.fixedAppointment && !isNaN(new Date(inspection.fixedAppointment).getTime()) && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(inspection.fixedAppointment), 'h:mm a')}
              </Badge>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <FileText className="h-3.5 w-3.5" />
            <span>#{inspection.claimNumber.split('-').pop()}</span>
          </div>
          <p className={cn(
            'text-xs font-medium',
            inspection.daysRemaining === 999 && 'text-muted-foreground',
            inspection.daysRemaining !== 999 && inspection.daysRemaining <= 0 && 'text-critical',
            inspection.daysRemaining !== 999 && inspection.daysRemaining > 0 && inspection.daysRemaining <= 3 && 'text-urgent',
            inspection.daysRemaining !== 999 && inspection.daysRemaining > 3 && inspection.daysRemaining <= 7 && 'text-soon',
            inspection.daysRemaining !== 999 && inspection.daysRemaining > 7 && 'text-normal'
          )}>
            {formatDueDate()}
          </p>
        </div>
      </div>
    </div>
  );
}
