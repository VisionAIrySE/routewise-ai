import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'urgent' | 'soon' | 'normal';
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    critical: 'bg-critical/10 border-critical/20',
    urgent: 'bg-urgent/10 border-urgent/20',
    soon: 'bg-soon/10 border-soon/20',
    normal: 'bg-normal/10 border-normal/20',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    critical: 'text-critical bg-critical/20',
    urgent: 'text-urgent bg-urgent/20',
    soon: 'text-soon bg-soon/20',
    normal: 'text-normal bg-normal/20',
  };

  const valueStyles = {
    default: 'text-foreground',
    critical: 'text-critical',
    urgent: 'text-urgent',
    soon: 'text-soon',
    normal: 'text-normal',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all hover:shadow-md animate-fade-in',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('mt-2 text-3xl font-bold', valueStyles[variant])}>
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={cn('rounded-lg p-2.5', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
