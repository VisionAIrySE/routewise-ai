import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Timer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFixedAppointments } from '@/hooks/useRoutes';
import { useMonthSavedRoutes, type SavedRouteDB } from '@/hooks/useSavedRoutes';
import { CalendarRouteCard } from '@/components/calendar/CalendarRouteCard';
import { RouteDetailModal } from '@/components/calendar/RouteDetailModal';
import { DuplicateRouteModal } from '@/components/calendar/DuplicateRouteModal';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoute, setSelectedRoute] = useState<SavedRouteDB | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [routeToDuplicate, setRouteToDuplicate] = useState<SavedRouteDB | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month with previous month's days
  const startPadding = getDay(monthStart);
  const paddedDays = Array(startPadding).fill(null).concat(monthDays);

  // Fetch routes and appointments
  const { data: savedRoutes = [], isLoading: routesLoading } = useMonthSavedRoutes(currentDate);
  const { data: fixedAppointments = [], isLoading: appointmentsLoading } = useFixedAppointments();

  const isLoading = routesLoading || appointmentsLoading;

  const getRoutesForDay = (day: Date | null) => {
    if (!day) return [];
    return savedRoutes.filter((route) => isSameDay(new Date(route.route_date), day));
  };

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return [];
    return fixedAppointments.filter((apt) =>
      apt.fixedAppointment && isSameDay(new Date(apt.fixedAppointment), day)
    );
  };

  const handleRouteClick = (route: SavedRouteDB) => {
    setSelectedRoute(route);
    setDetailModalOpen(true);
  };

  const handleEditRoute = (route: SavedRouteDB) => {
    // Navigate to route optimizer with route context
    // Store route in sessionStorage for the chat to pick up
    sessionStorage.setItem('editRoute', JSON.stringify(route));
    navigate('/');
  };

  const handleDuplicateRoute = (route: SavedRouteDB) => {
    setRouteToDuplicate(route);
    setDuplicateModalOpen(true);
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Route Calendar
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your saved routes and appointments
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {paddedDays.map((day, index) => {
              const dayRoutes = getRoutesForDay(day);
              const appointments = getAppointmentsForDay(day);
              const isCurrentDay = day && isToday(day);

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[120px] border-b border-r border-border p-2 transition-colors',
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

                      {/* Saved Routes */}
                      <div className="space-y-1.5">
                        {dayRoutes.map((route) => (
                          <CalendarRouteCard
                            key={route.id}
                            route={route}
                            onClick={() => handleRouteClick(route)}
                          />
                        ))}
                      </div>

                      {/* Fixed Appointments */}
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-md bg-fixed/10 border border-fixed/20 px-2 py-1 text-xs mt-1"
                        >
                          <div className="flex items-center gap-1 text-fixed font-medium">
                            <Timer className="h-3 w-3" />
                            {format(new Date(apt.fixedAppointment!), 'h:mm a')}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {apt.street}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Appointments Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Timer className="h-5 w-5 text-fixed" />
          Fixed Appointments (SIG)
        </h3>
        {appointmentsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading appointments...
          </div>
        ) : (
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
        )}
      </div>

      {/* Route Detail Modal */}
      <RouteDetailModal
        route={selectedRoute}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEditRoute={handleEditRoute}
        onDuplicateRoute={handleDuplicateRoute}
      />

      {/* Duplicate Route Modal */}
      <DuplicateRouteModal
        route={routeToDuplicate}
        open={duplicateModalOpen}
        onOpenChange={setDuplicateModalOpen}
      />
    </div>
  );
};

export default Calendar;
