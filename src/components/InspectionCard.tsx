import { useState } from 'react';
import { MapPin, Clock, Building2, FileText, CheckCircle, MoreVertical, Calendar, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Inspection, getUrgencyColor } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useInspectionAppointment } from '@/hooks/useAppointments';

interface InspectionCardProps {
  inspection: Inspection;
  onClick?: () => void;
  onScheduleAppointment?: (inspection: Inspection) => void;
}

export function InspectionCard({ inspection, onClick, onScheduleAppointment }: InspectionCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch appointment for this inspection from the new appointments table
  const { data: appointment } = useInspectionAppointment(inspection.id);
  
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

  const handleMarkComplete = async () => {
    setIsMarking(true);
    try {
      const { error } = await supabase
        .from('inspections')
        .update({
          status: 'COMPLETED',
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', inspection.id);

      if (error) throw error;

      toast({
        title: 'Inspection Completed',
        description: `${inspection.street} marked as complete`,
      });

      // Invalidate inspection queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    } catch (error) {
      console.error('Error marking inspection complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark inspection as complete',
        variant: 'destructive',
      });
    } finally {
      setIsMarking(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click when dropdown or dialog is involved
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-click]')) return;
    onClick?.();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
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
              
              {/* Show appointment from new appointments table */}
              {appointment && (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(appointment.appointment_date), 'MMM d')}
                  {appointment.appointment_time && ` @ ${appointment.appointment_time}`}
                </Badge>
              )}
              
              {/* Legacy: Show fixed_appointment from inspections table if no new appointment */}
              {!appointment && inspection.fixedAppointment && !isNaN(new Date(inspection.fixedAppointment).getTime()) && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(inspection.fixedAppointment), 'MMM d, h:mm a')}
                </Badge>
              )}
            </div>

            {/* Call ahead warning - show schedule button if no appointment */}
            {!appointment && !inspection.fixedAppointment && inspection.company === 'SIG' && onScheduleAppointment && (
              <div className="flex items-center gap-2 mt-2 text-orange-600 bg-orange-50 px-2 py-1 rounded" data-no-click>
                <Phone className="h-3.5 w-3.5" />
                <span className="text-xs">Appointment required</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleAppointment(inspection);
                  }}
                >
                  Schedule
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
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

            {/* Actions Dropdown */}
            {inspection.status !== 'COMPLETED' && (
              <div data-no-click>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover z-50">
                    {onScheduleAppointment && (
                      <>
                        <DropdownMenuItem onClick={() => onScheduleAppointment(inspection)}>
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          {appointment ? 'Reschedule' : 'Schedule Appointment'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Mark Complete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Inspection Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this inspection as complete?
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{inspection.street}</p>
                <p className="text-sm">{inspection.city}, {inspection.state} {inspection.zip}</p>
                <p className="text-sm mt-1">Claim: {inspection.claimNumber}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkComplete}
              disabled={isMarking}
              className="bg-green-600 hover:bg-green-700"
            >
              {isMarking ? 'Marking...' : 'Mark Complete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}