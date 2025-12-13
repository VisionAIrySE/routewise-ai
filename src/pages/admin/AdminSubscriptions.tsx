import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin, SubscriptionEvent } from '@/hooks/useAdmin';
import { CreditCard, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminSubscriptions() {
  const { getSubscriptionStats, fetchSubscriptionEvents } = useAdmin();
  const [stats, setStats] = useState({ active: 0, trialing: 0, canceled: 0, pastDue: 0, byTier: {} as Record<string, number> });
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SubscriptionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      const [statsData, eventsData] = await Promise.all([
        getSubscriptionStats(),
        fetchSubscriptionEvents(),
      ]);
      setStats(statsData);
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      setLoading(false);
    }
    loadData();
  }, [getSubscriptionStats, fetchSubscriptionEvents]);

  useEffect(() => {
    if (eventFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.event_type === eventFilter));
    }
  }, [eventFilter, events]);

  // Calculate MRR (simplified - would need actual pricing data)
  const individualPrice = 17;
  const teamPrice = 15;
  const mrr = (stats.byTier['individual'] || 0) * individualPrice + 
              (stats.byTier['team'] || 0) * teamPrice * 3; // Assuming avg 3 seats

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'created': return <Badge className="bg-green-500">New Signup</Badge>;
      case 'canceled': return <Badge variant="destructive">Canceled</Badge>;
      case 'upgraded': return <Badge className="bg-primary">Upgraded</Badge>;
      case 'downgraded': return <Badge variant="outline" className="text-amber-500 border-amber-500">Downgraded</Badge>;
      case 'refunded': return <Badge variant="outline" className="text-red-500 border-red-500">Refunded</Badge>;
      case 'renewed': return <Badge className="bg-blue-500">Renewed</Badge>;
      case 'trial_extended': return <Badge variant="secondary">Trial Extended</Badge>;
      default: return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  // Calculate churn (canceled in last 30 days / total active)
  const recentCancels = events.filter(e => {
    if (e.event_type !== 'canceled') return false;
    const eventDate = new Date(e.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return eventDate > thirtyDaysAgo;
  }).length;

  const churnRate = stats.active > 0 ? ((recentCancels / stats.active) * 100).toFixed(1) : '0';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Subscriptions</h2>
          <p className="text-muted-foreground">Subscription metrics and recent activity</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">Paying customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Trialing</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{stats.trialing}</div>
                  <p className="text-xs text-muted-foreground">In trial period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Est. MRR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mrr.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{churnRate}%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Tier Breakdown and Events */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>By Tier</CardTitle>
                  <CardDescription>Subscription distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.byTier).map(([tier, count]) => {
                      const total = Object.values(stats.byTier).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={tier} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="capitalize font-medium">{tier}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                tier === 'team' ? 'bg-primary' : 
                                tier === 'individual' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(stats.byTier).length === 0 && (
                      <p className="text-muted-foreground text-sm">No subscription data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Events</CardTitle>
                    <CardDescription>Subscription activity</CardDescription>
                  </div>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="created">New Signups</SelectItem>
                      <SelectItem value="canceled">Cancellations</SelectItem>
                      <SelectItem value="upgraded">Upgrades</SelectItem>
                      <SelectItem value="refunded">Refunds</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {filteredEvents.slice(0, 20).map((event) => (
                      <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="space-y-1">
                          {getEventBadge(event.event_type)}
                          {event.to_tier && (
                            <p className="text-sm text-muted-foreground">
                              {event.from_tier && event.from_tier !== event.to_tier 
                                ? `${event.from_tier} → ${event.to_tier}`
                                : event.to_tier
                              }
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-xs text-muted-foreground">{event.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    ))}
                    {filteredEvents.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No events found
                      </p>
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
