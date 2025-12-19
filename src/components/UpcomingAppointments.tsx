import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUpcomingNewAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow, differenceInDays, parse } from 'date-fns';

export function UpcomingAppointments() {
  const { data: appointments, isLoading } = useUpcomingNewAppointments(10);

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
  );
}
