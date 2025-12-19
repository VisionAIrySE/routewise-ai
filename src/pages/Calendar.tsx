import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Timer, Loader2, Calendar as CalendarIcon, List, Plus, User, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFixedAppointments } from '@/hooks/useRoutes';
import { useMonthSavedRoutes, type SavedRouteDB } from '@/hooks/useSavedRoutes';
import { useMonthAppointments } from '@/hooks/useAppointments';
import { CalendarRouteCard } from '@/components/calendar/CalendarRouteCard';
import { RouteDetailModal } from '@/components/calendar/RouteDetailModal';
import { DuplicateRouteModal } from '@/components/calendar/DuplicateRouteModal';
import { AddAppointmentModal } from '@/components/calendar/AddAppointmentModal';
import { AppointmentsList } from '@/components/calendar/AppointmentsList';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { parseLocalDate, isSameDayLocal } from '@/lib/dateUtils';
import type { Appointment } from '@/types/appointment';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getDay,
  isToday,
  isSameDay,
} from 'date-fns';

const Calendar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoute, setSelectedRoute] = useState<SavedRouteDB | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [routeToDuplicate, setRouteToDuplicate] = useState<SavedRouteDB | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [addAppointmentDate, setAddAppointmentDate] = useState<Date | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAddAppointmentOpen(true);
  };

  // Use week view on mobile by default
  const effectiveViewMode = isMobile ? 'week' : viewMode;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Week view days
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Pad start of month with previous month's days
  const startPadding = getDay(monthStart);
  const paddedDays = Array(startPadding).fill(null).concat(monthDays);

  // Fetch routes and appointments
  const { data: savedRoutes = [], isLoading: routesLoading } = useMonthSavedRoutes(currentDate);
  const { data: fixedAppointments = [], isLoading: fixedAppointmentsLoading } = useFixedAppointments();
  const { data: newAppointments = [], isLoading: newAppointmentsLoading } = useMonthAppointments(currentDate);

  const isLoading = routesLoading || fixedAppointmentsLoading || newAppointmentsLoading;

  const getRoutesForDay = (day: Date | null) => {
    if (!day) return [];
    return savedRoutes.filter((route) => isSameDayLocal(route.route_date, day));
  };

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return [];
    return fixedAppointments.filter((apt) =>
      apt.fixedAppointment && isSameDayLocal(apt.fixedAppointment, day)
    );
  };

  // Get new appointments for a specific day
  const getNewAppointmentsForDay = (day: Date | null): Appointment[] => {
    if (!day) return [];
    const dayStr = format(day, 'yyyy-MM-dd');
    return newAppointments.filter((apt) => apt.appointment_date === dayStr);
  };

  const handleAddAppointmentForDate = (date: Date) => {
    setAddAppointmentDate(date);
    setAddAppointmentOpen(true);
  };

  const handleRouteClick = (route: SavedRouteDB) => {
    setSelectedRoute(route);
    setDetailModalOpen(true);
  };

  const handleEditRoute = (route: SavedRouteDB) => {
    // Navigate to route optimizer with route context
    // Store route in sessionStorage for the chat to pick up
    sessionStorage.setItem('editRoute', JSON.stringify(route));
    navigate('/app');
  };

  const handleDuplicateRoute = (route: SavedRouteDB) => {
    setRouteToDuplicate(route);
    setDuplicateModalOpen(true);
  };

  // Helper to format appointment time correctly from the timestamp
  const formatAppointmentTime = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    if (!date) return '';
    return format(date, 'h:mm a');
  };

  // Helper to format appointment date for display
  const formatAppointmentDateTime = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    if (!date) return '';
    return format(date, 'MMM d, h:mm a');
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(effectiveViewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground min-w-[140px] sm:min-w-[200px] text-center">
            {effectiveViewMode === 'week' 
              ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
              : format(currentDate, 'MMMM yyyy')
            }
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(effectiveViewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="rounded-none"
              >
                <List className="h-4 w-4 mr-1" />
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="rounded-none"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Month
              </Button>
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            size="sm"
            onClick={() => setAddAppointmentOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : effectiveViewMode === 'week' ? (
          /* Week View - Mobile Friendly */
          <div className="divide-y divide-border">
            {weekDays.map((day) => {
              const dayRoutes = getRoutesForDay(day);
              const appointments = getAppointmentsForDay(day);
              const isCurrentDay = isToday(day);
              const inCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-4 transition-colors',
                    isCurrentDay && 'bg-primary/5',
                    !inCurrentMonth && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                    <div>
                      <p className={cn(
                        'font-medium',
                        isCurrentDay ? 'text-primary' : 'text-foreground'
                      )}>
                        {format(day, 'EEEE')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(day, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {dayRoutes.length === 0 && appointments.length === 0 && getNewAppointmentsForDay(day).length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-13">No routes or appointments</p>
                  ) : (
                    <div className="space-y-2 pl-13">
                      {/* New Appointments (from appointments table) */}
                      {getNewAppointmentsForDay(day).map((apt) => (
                        <div
                          key={apt.id}
                          className={cn(
                            "rounded-lg p-3 border",
                            apt.appointment_type === 'inspection' 
                              ? "bg-blue-50 border-blue-200" 
                              : "bg-purple-50 border-purple-200"
                          )}
                        >
                          <div className={cn(
                            "flex items-center gap-2 font-medium",
                            apt.appointment_type === 'inspection' ? "text-blue-600" : "text-purple-600"
                          )}>
                            {apt.appointment_type === 'inspection' ? <Timer className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            {apt.appointment_time || 'All day'}
                            <Badge variant={apt.appointment_type === 'inspection' ? 'default' : 'secondary'} className="ml-auto">
                              {apt.appointment_type === 'inspection' ? 'Inspection' : 'Personal'}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mt-1">
                            {apt.inspection?.street || apt.title || 'Appointment'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.inspection?.city || apt.city || ''}
                          </p>
                        </div>
                      ))}
                      {/* Saved Routes */}
                      {dayRoutes.map((route) => (
                        <CalendarRouteCard
                          key={route.id}
                          route={route}
                          onClick={() => handleRouteClick(route)}
                          expanded
                        />
                      ))}

                      {/* Fixed Appointments */}
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-lg bg-fixed/10 border border-fixed/20 p-3"
                        >
                          <div className="flex items-center gap-2 text-fixed font-medium">
                            <Timer className="h-4 w-4" />
                            {formatAppointmentTime(apt.fixedAppointment!)}
                            <Badge variant="fixed" className="ml-auto">SIG</Badge>
                          </div>
                          <p className="text-sm text-foreground mt-1">
                            {apt.street}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.city}, {apt.state}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Month View */
          <>
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
                              {formatAppointmentTime(apt.fixedAppointment!)}
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
          </>
        )}
      </div>

      {/* Upcoming Appointments Section */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Upcoming Appointments
        </h3>
        <AppointmentsList onEditAppointment={handleEditAppointment} />
      </div>

      {/* Fixed Appointments Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Timer className="h-5 w-5 text-fixed" />
          Fixed Appointments (SIG)
        </h3>
        {fixedAppointmentsLoading ? (
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
                      {formatAppointmentDateTime(apt.fixedAppointment!)}
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

      {/* Add/Edit Appointment Modal */}
      <AddAppointmentModal
        open={addAppointmentOpen}
        onOpenChange={(open) => {
          setAddAppointmentOpen(open);
          if (!open) {
            setAddAppointmentDate(undefined);
            setEditingAppointment(null);
          }
        }}
        defaultDate={addAppointmentDate || (editingAppointment ? new Date(editingAppointment.appointment_date) : undefined)}
        editAppointment={editingAppointment}
      />
    </div>
  );
};

export default Calendar;