import { useState } from 'react';
import { format, isAfter, isBefore, subDays, startOfDay } from 'date-fns';
import { MapPin, Clock, Fuel, Calendar, Route as RouteIcon, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSavedRoutes, type SavedRouteDB } from '@/hooks/useSavedRoutes';
import { RouteDetailModal } from '@/components/calendar/RouteDetailModal';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  planned: 'bg-primary/10 text-primary',
  in_progress: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-muted text-muted-foreground',
};

export default function Routes() {
  const navigate = useNavigate();
  const { data: routes = [], isLoading, error, refetch } = useSavedRoutes();
  const [selectedRoute, setSelectedRoute] = useState<SavedRouteDB | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const today = startOfDay(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  // Filter routes: past 30 days OR future
  const visibleRoutes = routes.filter((route) => {
    const routeDate = startOfDay(new Date(route.route_date));
    return isAfter(routeDate, thirtyDaysAgo) || routeDate.getTime() === thirtyDaysAgo.getTime();
  });

  // Split into past and upcoming
  const upcomingRoutes = visibleRoutes
    .filter((r) => !isBefore(startOfDay(new Date(r.route_date)), today))
    .sort((a, b) => new Date(a.route_date).getTime() - new Date(b.route_date).getTime());

  const pastRoutes = visibleRoutes
    .filter((r) => isBefore(startOfDay(new Date(r.route_date)), today))
    .sort((a, b) => new Date(b.route_date).getTime() - new Date(a.route_date).getTime());

  const handleRouteClick = (route: SavedRouteDB) => {
    setSelectedRoute(route);
    setModalOpen(true);
  };

  const handleEditRoute = (route: SavedRouteDB) => {
    // Store route context in sessionStorage for chat to pick up
    const routeContext = {
      action: 'edit_route',
      route_id: route.id,
      route_date: route.route_date,
      start_time: route.start_time,
      stops: route.stops_json,
      total_hours: route.total_hours,
      total_miles: route.total_miles,
      zones: route.zones,
      original_request: route.original_request,
      hours_requested: route.hours_requested,
      location_filter: route.location_filter,
      exclusions: route.exclusions,
    };
    sessionStorage.setItem('editRouteContext', JSON.stringify(routeContext));
    navigate('/app');
    setModalOpen(false);
  };

  const RouteCard = ({ route, isPast = false }: { route: SavedRouteDB; isPast?: boolean }) => (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${isPast ? 'opacity-75' : ''}`}
      onClick={() => handleRouteClick(route)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium">
                {format(new Date(route.route_date), 'EEEE, MMM d, yyyy')}
              </span>
              {route.status && (
                <Badge variant="secondary" className={statusColors[route.status] || ''}>
                  {route.status.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {route.zones && route.zones.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {route.zones.map((zone) => (
                  <Badge key={zone} variant="outline" className="text-xs">
                    {zone}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {route.stops_count} stops
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {route.total_hours?.toFixed(1) || '-'}h
              </span>
              <span className="flex items-center gap-1">
                <RouteIcon className="h-4 w-4" />
                {route.total_miles?.toFixed(0) || '-'} mi
              </span>
              <span className="flex items-center gap-1">
                <Fuel className="h-4 w-4" />
                ${route.fuel_cost?.toFixed(2) || '-'}
              </span>
            </div>

            {route.start_time && route.finish_time && (
              <p className="text-xs text-muted-foreground mt-2">
                {route.start_time} - {route.finish_time}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load routes</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Saved Routes</h1>
        <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Upcoming Routes */}
      {upcomingRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Upcoming
          </h2>
          <div className="space-y-3">
            {upcomingRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </section>
      )}

      {/* Past Routes (Last 30 Days) */}
      {pastRoutes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Past 30 Days
          </h2>
          <div className="space-y-3">
            {pastRoutes.map((route) => (
              <RouteCard key={route.id} route={route} isPast />
            ))}
          </div>
        </section>
      )}

      {visibleRoutes.length === 0 && (
        <div className="text-center py-12">
          <RouteIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No saved routes yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a route using the AI Assistant to see it here.
          </p>
        </div>
      )}

      {/* Route Detail Modal */}
      <RouteDetailModal
        route={selectedRoute}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onEditRoute={handleEditRoute}
      />
    </div>
  );
}
