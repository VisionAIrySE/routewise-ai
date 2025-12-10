import { useState } from 'react';
import { AlertTriangle, AlertCircle, Clock, ClipboardList, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { TodayRouteCard } from '@/components/TodayRouteCard';
import { WeeklyProgress } from '@/components/WeeklyProgress';
import { ExamplePrompts } from '@/components/ExamplePrompts';
import { AIChatPanel } from '@/components/AIChatPanel';
import { useInspectionStats } from '@/hooks/useInspections';

const Dashboard = () => {
  const { stats, isLoading, error } = useInspectionStats();
  const [chatOpen, setChatOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();

  const handlePromptClick = (prompt: string) => {
    setInitialPrompt(prompt);
    setChatOpen(true);
  };

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
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-8 w-12 bg-muted rounded mb-1" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            ))}
          </>
        ) : error ? (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            Failed to load inspection data. Please check your Airtable connection.
          </div>
        ) : (
          <>
            <StatCard
              title="Critical"
              value={stats.critical}
              subtitle="Due today or overdue"
              icon={AlertTriangle}
              variant="critical"
            />
            <StatCard
              title="Urgent"
              value={stats.urgent}
              subtitle="Due within 3 days"
              icon={AlertCircle}
              variant="urgent"
            />
            <StatCard
              title="Soon"
              value={stats.soon}
              subtitle="Due within 7 days"
              icon={Clock}
              variant="soon"
            />
            <StatCard
              title="Total Pending"
              value={stats.total}
              subtitle="All pending inspections"
              icon={ClipboardList}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <TodayRouteCard />
        </div>
        <div>
          <WeeklyProgress />
        </div>
      </div>

      {/* Example Prompts */}
      <ExamplePrompts onPromptClick={handlePromptClick} />

      {/* AI Chat Panel - triggered from prompts */}
      <AIChatPanel
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
};

export default Dashboard;
