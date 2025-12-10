import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Route as RouteIcon, CheckCircle, Circle, XCircle, Timer, Sparkles, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockRoutes, mockRouteStops, mockInspections, getUrgencyColor } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const RouteDetail = () => {
  const { routeId } = useParams();
  
  const route = mockRoutes.find((r) => r.id === routeId);
  const stops = mockRouteStops
    .filter((stop) => stop.routeId === routeId)
    .map((stop) => ({
      ...stop,
      inspection: mockInspections.find((i) => i.id === stop.inspectionId)!,
    }))
    .sort((a, b) => a.stopOrder - b.stopOrder);

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h2 className="text-xl font-semibold text-foreground mb-2">Route not found</h2>
        <p className="text-muted-foreground mb-4">The route you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const formatDriveTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStopIcon = (status: string, hasFixed: boolean) => {
    if (status === 'COMPLETED') {
      return <CheckCircle className="h-5 w-5 text-normal" />;
    }
    if (status === 'SKIPPED') {
      return <XCircle className="h-5 w-5 text-critical" />;
    }
    if (hasFixed) {
      return <Timer className="h-5 w-5 text-fixed" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Route: {format(new Date(route.routeDate), 'EEEE, MMMM d, yyyy')}
        </h1>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex h-[300px] items-center justify-center bg-muted/30">
              <div className="text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Map visualization coming soon
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Google Maps integration placeholder
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stops</span>
              <span className="font-medium">{route.plannedCount} planned</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-normal">{route.completedCount} ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Drive Time</span>
              <span className="font-medium">~{formatDriveTime(route.totalEstDriveTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">~{route.totalDistanceMiles} miles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Focus Area</span>
              <Badge variant="secondary">{route.geographicFocus}</Badge>
            </div>

            {route.aiRecommended && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-primary mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">AI Recommended</span>
                </div>
                <p className="text-sm text-muted-foreground">{route.routeNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stop Sequence */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Stop Sequence</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={cn(
                'flex items-center gap-4 p-4 transition-colors',
                stop.status === 'COMPLETED' && 'bg-normal/5',
                stop.status === 'SKIPPED' && 'bg-critical/5 opacity-60'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold shrink-0">
                {stop.stopOrder}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={cn(
                    'font-medium text-foreground',
                    stop.status === 'SKIPPED' && 'line-through'
                  )}>
                    {stop.inspection.street}
                  </p>
                  {stop.inspection.fixedAppointment && (
                    <Badge variant="fixed" className="gap-1">
                      <Timer className="h-3 w-3" />
                      {format(new Date(stop.inspection.fixedAppointment), 'h:mm a')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {stop.inspection.city}, {stop.inspection.state} {stop.inspection.zip}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={stop.inspection.company === 'MIL' ? 'default' : stop.inspection.company === 'IPI' ? 'secondary' : 'fixed'}>
                    {stop.inspection.company}
                  </Badge>
                  <Badge variant={getUrgencyColor(stop.inspection.urgencyTier) as any}>
                    {stop.inspection.urgencyTier}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    #{stop.inspection.claimNumber}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {getStopIcon(stop.status, !!stop.inspection.fixedAppointment)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteDetail;
