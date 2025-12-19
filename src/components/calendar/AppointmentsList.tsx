import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, User, Pencil, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointment';

interface AppointmentsListProps {
  onEditAppointment?: (appointment: Appointment) => void;
}

export function AppointmentsList({ onEditAppointment }: AppointmentsListProps) {
  const { toast } = useToast();
  const { data: appointments = [], isLoading } = useUpcomingNewAppointments(20);
  const cancelAppointment = useCancelAppointment();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;

    try {
      await cancelAppointment.mutateAsync(appointmentToCancel.id);
      toast({
        title: 'Appointment cancelled',
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
      setAppointmentToCancel(null);
    }
  };

  const formatAppointmentDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEE, MMM d');
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading appointments...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        No upcoming appointments scheduled
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className={cn(
              "flex items-start justify-between gap-4 rounded-lg px-4 py-3 border",
              apt.appointment_type === 'inspection'
                ? "bg-blue-50/50 border-blue-200"
                : "bg-purple-50/50 border-purple-200"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant={apt.appointment_type === 'inspection' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {apt.appointment_type === 'inspection' ? 'Inspection' : 'Personal'}
                </Badge>
                {apt.inspection?.company_name && (
                  <Badge variant="outline" className="text-xs">
                    {apt.inspection.company_name}
                  </Badge>
                )}
              </div>
              
              <p className="font-medium text-foreground">
                {apt.inspection?.insured_name || apt.title || 'Appointment'}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatAppointmentDate(apt.appointment_date)}
                </div>
                {apt.appointment_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {apt.appointment_time}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">
                    {apt.inspection?.street || apt.address || 'No address'}
                    {(apt.inspection?.city || apt.city) && `, ${apt.inspection?.city || apt.city}`}
                  </span>
                </div>
              </div>

              {apt.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {apt.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onEditAppointment && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEditAppointment(apt)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleCancelClick(apt)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment?
              {appointmentToCancel && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">
                    {appointmentToCancel.inspection?.insured_name || appointmentToCancel.title || 'Appointment'}
                  </p>
                  <p className="text-sm">
                    {formatAppointmentDate(appointmentToCancel.appointment_date)}
                    {appointmentToCancel.appointment_time && ` @ ${appointmentToCancel.appointment_time}`}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelAppointment.isPending}>
              Keep Appointment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelAppointment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelAppointment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Appointment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
