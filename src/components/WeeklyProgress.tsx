import { TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useWeeklyStats } from '@/hooks/useInspections';
import { Skeleton } from '@/components/ui/skeleton';

export function WeeklyProgress() {
  const { completed, total, isLoading } = useWeeklyStats();
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-normal/10">
          <TrendingUp className="h-5 w-5 text-normal" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Overall Progress</h3>
          <p className="text-sm text-muted-foreground">Completion tracking</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Completion Rate</span>
          <span className="font-semibold text-foreground">
            {percentage}% ({completed}/{total})
          </span>
        </div>
        <Progress value={percentage} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completed} completed</span>
          <span>{pending} pending</span>
        </div>
      </div>
    </div>
  );
}
