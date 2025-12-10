import { AlertTriangle, AlertCircle, Clock, ClipboardList } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { TodayRouteCard } from '@/components/TodayRouteCard';
import { WeeklyProgress } from '@/components/WeeklyProgress';
import { mockInspections } from '@/lib/mockData';

const Dashboard = () => {
  const pending = mockInspections.filter(i => i.status === 'PENDING');
  const critical = pending.filter(i => i.urgencyTier === 'CRITICAL');
  const urgent = pending.filter(i => i.urgencyTier === 'URGENT');
  const soon = pending.filter(i => i.urgencyTier === 'SOON');

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Inspector Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your inspection workload
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Critical"
          value={critical.length}
          subtitle="Due today or overdue"
          icon={AlertTriangle}
          variant="critical"
        />
        <StatCard
          title="Urgent"
          value={urgent.length}
          subtitle="Due within 3 days"
          icon={AlertCircle}
          variant="urgent"
        />
        <StatCard
          title="Soon"
          value={soon.length}
          subtitle="Due within 7 days"
          icon={Clock}
          variant="soon"
        />
        <StatCard
          title="Total Pending"
          value={pending.length}
          subtitle="All pending inspections"
          icon={ClipboardList}
          variant="default"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayRouteCard />
        </div>
        <div>
          <WeeklyProgress />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
