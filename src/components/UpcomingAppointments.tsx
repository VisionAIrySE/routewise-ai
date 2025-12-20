import { useState } from 'react';
import { Calendar, Clock, MapPin, Loader2, MoreVertical, CheckCircle, Pencil, X } from 'lucide-react';
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
import { useUpcomingNewAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow, differenceInDays, parse } from 'date-fns';
import { AddAppointmentModal } from '@/components/calendar/AddAppointmentModal';
import type { Appointment } from '@/types/appointment';

export function UpcomingAppointments() {
  const { data: appointments, isLoading } = useUpcomingNewAppointments(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cancelAppointment = useCancelAppointment();
  
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof appointments[0] | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleMarkComplete = async () => {
    if (!selectedAppointment) return;
    setIsMarking(true);
    try {
      // If it's an inspection appointment, mark the inspection as complete
      if (selectedAppointment.inspection_id) {
        const { error: inspectionError } = await supabase
          .from('inspections')
          .update({
            status: 'COMPLETED',
            completed_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', selectedAppointment.inspection_id);

        if (inspectionError) throw inspectionError;
      }

      // Mark the appointment as completed
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', selectedAppointment.id);

      toast({
        title: 'Marked Complete',
        description: selectedAppointment.inspection?.street || selectedAppointment.title || 'Appointment completed',
      });

      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    } catch (error) {
      console.error('Error marking complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as complete',
        variant: 'destructive',
      });
    } finally {
      setIsMarking(false);
      setCompleteDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      await cancelAppointment.mutateAsync(selectedAppointment.id);
      toast({
        title: 'Appointment Cancelled',
        description: 'The appointment has been cancelled.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment.',
        variant: 'destructive',
      });
    } finally {
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleReschedule = (appt: typeof appointments[0]) => {
    setEditingAppointment(appt as Appointment);
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = differenceInDays(date, today);
    if (days < 7 && days >= 0) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const getDateBadgeColor = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    
    if (isToday(date)) return 'bg-critical/10 text-critical border-critical/20';
    if (isTomorrow(date)) return 'bg-urgent/10 text-urgent border-urgent/20';
    return 'bg-muted text-muted-foreground';
  };

  const formatAppointmentTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    try {
      const date = parse(timeStr, 'HH:mm:ss', new Date());
      return format(date, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  const getDisplayInfo = (appt: typeof appointments[0]) => {
    if (appt.inspection) {
      return {
        title: appt.inspection.insured_name || appt.inspection.street,
        address: appt.inspection.street,
        city: appt.inspection.city,
        company: appt.inspection.company_name,
      };
    }
    return {
      title: appt.title || 'Appointment',
      address: appt.address || '',
      city: appt.city || '',
      company: appt.appointment_type,
    };
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fixed/10">
            <Calendar className="h-5 w-5 text-fixed" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Scheduled Appointments</h3>
            <p className="text-sm text-muted-foreground">
              {appointments?.length || 0} upcoming
            </p>
          </div>
        </div>

        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No scheduled appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 4).map((appt) => {
              const info = getDisplayInfo(appt);
              return (
                <div
                  key={appt.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getDateBadgeColor(appt.appointment_date)}`}
                      >
                        {formatAppointmentDate(appt.appointment_date)}
                      </Badge>
                      {appt.appointment_time && (
                        <span className="flex items-center gap-1 text-xs font-medium text-fixed">
                          <Clock className="h-3 w-3" />
                          {formatAppointmentTime(appt.appointment_time)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {info.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {info.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {info.city}
                        </span>
                      )}
                      {info.company && (
                        <Badge variant="fixed" className="text-[10px] px-1.5 py-0">
                          {info.company}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover z-50">
                      <DropdownMenuItem onClick={() => handleReschedule(appt)}>
                        <Pencil className="h-4 w-4 mr-2 text-blue-600" />
                        Reschedule
                      </DropdownMenuItem>
                      {appt.appointment_type === 'inspection' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedAppointment(appt);
                            setCompleteDialogOpen(true);
                          }}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Mark Complete
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setCancelDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {appointments.length > 4 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{appointments.length - 4} more appointments
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mark Complete Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Inspection Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this inspection as complete?
              {selectedAppointment && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">
                    {selectedAppointment.inspection?.street || selectedAppointment.title}
                  </p>
                  <p className="text-sm">
                    {selectedAppointment.inspection?.city}
                  </p>
                </div>
              )}
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment?
              {selectedAppointment && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">
                    {selectedAppointment.inspection?.street || selectedAppointment.title}
                  </p>
                  <p className="text-sm">
                    {formatAppointmentDate(selectedAppointment.appointment_date)}
                    {selectedAppointment.appointment_time && ` @ ${selectedAppointment.appointment_time}`}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelAppointment.isPending}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={cancelAppointment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelAppointment.isPending ? 'Cancelling...' : 'Cancel Appointment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit/Reschedule Modal */}
      <AddAppointmentModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingAppointment(null);
        }}
        editAppointment={editingAppointment}
      />
    </>
  );
}