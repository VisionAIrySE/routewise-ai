import { CheckCircle2, TrendingUp, Calendar, CalendarDays, CalendarRange, Loader2 } from 'lucide-react';
import { useCompletionStats } from '@/hooks/useInspections';

export function CompletionStats() {
  const { data: stats, isLoading } = useCompletionStats();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'This Week',
      value: stats?.thisWeek ?? 0,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'This Month',
      value: stats?.thisMonth ?? 0,
      icon: CalendarDays,
      color: 'text-normal',
      bgColor: 'bg-normal/10',
    },
    {
      label: 'This Year',
      value: stats?.thisYear ?? 0,
      icon: CalendarRange,
      color: 'text-soon',
      bgColor: 'bg-soon/10',
    },
  ];

  // Calculate company percentages
  const totalByCompany = (stats?.byCompany.MIL ?? 0) + (stats?.byCompany.IPI ?? 0) + (stats?.byCompany.SIG ?? 0);
  const companyData = [
    { name: 'MIL', count: stats?.byCompany.MIL ?? 0, color: 'bg-blue-500' },
    { name: 'IPI', count: stats?.byCompany.IPI ?? 0, color: 'bg-emerald-500' },
    { name: 'SIG', count: stats?.byCompany.SIG ?? 0, color: 'bg-purple-500' },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-normal/10">
          <CheckCircle2 className="h-5 w-5 text-normal" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Completed</h3>
          <p className="text-sm text-muted-foreground">Inspections finished</p>
        </div>
      </div>

      {/* Time Period Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="text-center p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${item.bgColor} mb-2`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Company Breakdown Bar */}
      {totalByCompany > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">By Company (All Time)</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            {companyData.map((company) => {
              const percentage = (company.count / totalByCompany) * 100;
              if (percentage === 0) return null;
              return (
                <div
                  key={company.name}
                  className={`${company.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${company.name}: ${company.count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {companyData.map((company) => (
              <span key={company.name} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${company.color}`} />
                {company.name} ({company.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {totalByCompany === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">No completions recorded yet</p>
        </div>
      )}
    </div>
  );
}
