import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockRoutes, mockInspections } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month with previous month's days
  const startPadding = getDay(monthStart);
  const paddedDays = Array(startPadding).fill(null).concat(monthDays);

  // Get routes for this month
  const monthRoutes = mockRoutes.filter((route) => {
    const routeDate = new Date(route.routeDate);
    return isSameMonth(routeDate, currentDate);
  });

  // Get fixed appointments (SIG)
  const fixedAppointments = mockInspections.filter(
    (i) => i.fixedAppointment && i.company === 'SIG'
  );

  const getRouteForDay = (day: Date | null) => {
    if (!day) return null;
    return monthRoutes.find((route) => isSameDay(new Date(route.routeDate), day));
  };

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return [];
    return fixedAppointments.filter((apt) =>
      isSameDay(new Date(apt.fixedAppointment!), day)
    );
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Route Calendar
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your inspection schedule
        </p>
      </div>

      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          onClick={() => setCurrentDate(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, index) => {
            const route = getRouteForDay(day);
            const appointments = getAppointmentsForDay(day);
            const isCurrentDay = day && isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] border-b border-r border-border p-2 transition-colors',
                  !day && 'bg-muted/30',
                  isCurrentDay && 'bg-primary/5',
                  index % 7 === 6 && 'border-r-0'
                )}
              >
                {day && (
                  <>
                    <div
                      className={cn(
                        'mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm',
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </div>

                    {route && (
                      <div className="mb-1 rounded-md bg-primary/10 px-2 py-1 text-xs">
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <MapPin className="h-3 w-3" />
                          {route.plannedCount} stops
                        </div>
                        {route.completedCount > 0 && (
                          <div className="text-muted-foreground mt-0.5">
                            {route.completedCount}/{route.plannedCount} done
                          </div>
                        )}
                      </div>
                    )}

                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="rounded-md bg-fixed/10 px-2 py-1 text-xs mb-1"
                      >
                        <div className="flex items-center gap-1 text-fixed font-medium">
                          <Timer className="h-3 w-3" />
                          {format(new Date(apt.fixedAppointment!), 'h:mm a')}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Appointments Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Timer className="h-5 w-5 text-fixed" />
          Fixed Appointments (SIG)
        </h3>
        <div className="space-y-3">
          {fixedAppointments.length > 0 ? (
            fixedAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{apt.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {apt.city}, {apt.state}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="fixed">
                    {format(new Date(apt.fixedAppointment!), 'MMM d, h:mm a')}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No fixed appointments scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
