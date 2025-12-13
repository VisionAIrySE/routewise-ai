import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin, SubscriptionEvent } from '@/hooks/useAdmin';
import { Users, CreditCard, TrendingUp, Route, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminOverview() {
  const { getSubscriptionStats, getRoutesStats, fetchSubscriptionEvents } = useAdmin();
  const [subStats, setSubStats] = useState({ active: 0, trialing: 0, canceled: 0, pastDue: 0, byTier: {} as Record<string, number> });
  const [routeStats, setRouteStats] = useState({ total: 0, thisWeek: 0, thisMonth: 0, uniqueUsers: 0 });
  const [recentEvents, setRecentEvents] = useState<SubscriptionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [subs, routes, events] = await Promise.all([
        getSubscriptionStats(),
        getRoutesStats(),
        fetchSubscriptionEvents(),
      ]);
      setSubStats(subs);
      setRouteStats(routes);
      setRecentEvents(events.slice(0, 10));
      setLoading(false);
    }
    loadData();
  }, [getSubscriptionStats, getRoutesStats, fetchSubscriptionEvents]);

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'created': return <Badge className="bg-green-500">New</Badge>;
      case 'canceled': return <Badge variant="destructive">Canceled</Badge>;
      case 'upgraded': return <Badge className="bg-primary">Upgraded</Badge>;
      case 'refunded': return <Badge variant="outline" className="text-amber-500 border-amber-500">Refunded</Badge>;
      default: return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          <p className="text-muted-foreground">Dashboard statistics and recent activity</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{subStats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {subStats.trialing} trialing, {subStats.pastDue || 0} past due
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subStats.active + subStats.trialing + subStats.canceled}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all tiers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Routes Created</CardTitle>
                  <Route className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{routeStats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {routeStats.thisWeek} this week, {routeStats.thisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Route Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{routeStats.uniqueUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Users with saved routes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tier Breakdown */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Tiers</CardTitle>
                  <CardDescription>Distribution by plan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(subStats.byTier).map(([tier, count]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${
                            tier === 'team' ? 'bg-primary' : 
                            tier === 'individual' ? 'bg-blue-500' : 'bg-muted'
                          }`} />
                          <span className="capitalize">{tier}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                    {Object.keys(subStats.byTier).length === 0 && (
                      <p className="text-muted-foreground text-sm">No subscription data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest subscription events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEventBadge(event.event_type)}
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {event.to_tier && `${event.to_tier}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    ))}
                    {recentEvents.length === 0 && (
                      <p className="text-muted-foreground text-sm">No recent events</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
