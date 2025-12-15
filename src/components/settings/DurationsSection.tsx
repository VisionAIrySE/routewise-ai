import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { CompanyProfile, UserCompanySetting } from '@/hooks/useSettings';

interface Props {
  companies: CompanyProfile[];
  userSettings: UserCompanySetting[];
  onSave: (settings: { company_code: string; duration_minutes: number }[]) => Promise<unknown>;
  isSaving: boolean;
}

export function DurationsSection({ companies, userSettings, onSave, isSaving }: Props) {
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    if (companies.length > 0) {
      const defaults: Record<string, number> = {};
      companies.forEach((c) => {
        const userOverride = userSettings.find((s) => s.company_code === c.code);
        defaults[c.code] = userOverride?.duration_minutes || c.default_duration_minutes || 30;
      });
      setDurations(defaults);
    }
  }, [companies, userSettings]);

  const handleSave = async () => {
    try {
      const settings = Object.entries(durations).map(([company_code, duration_minutes]) => ({
        company_code,
        duration_minutes,
      }));
      await onSave(settings);
      toast.success('Duration settings saved!');
    } catch (error) {
      toast.error('Failed to save duration settings');
    }
  };

  if (companies.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Inspection Durations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No companies configured yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Inspection Durations
        </CardTitle>
        <CardDescription>Override default inspection times per company</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {companies.map((company) => (
          <div key={company.code} className="flex items-center gap-4">
            <Label className="w-32 font-medium">{company.name || company.code}</Label>
            <Input
              type="number"
              className="w-20"
              min="5"
              max="240"
              value={durations[company.code] || company.default_duration_minutes || 30}
              onChange={(e) =>
                setDurations((prev) => ({
                  ...prev,
                  [company.code]: parseInt(e.target.value) || 30,
                }))
              }
            />
            <span className="text-sm text-muted-foreground">
              min (default: {company.default_duration_minutes || 30})
            </span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Durations'}
        </Button>
      </CardFooter>
    </Card>
  );
}
