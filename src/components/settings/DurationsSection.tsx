import { useState, useEffect } from 'react';
import { Timer, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');

  // Only show companies the user has configured
  const userCompanyCodes = userSettings.map(s => s.company_code);
  const userCompanies = companies.filter(c => userCompanyCodes.includes(c.code));
  
  // Companies available to add (not yet in user's list)
  const availableToAdd = companies.filter(c => !userCompanyCodes.includes(c.code));

  useEffect(() => {
    if (userCompanies.length > 0) {
      const defaults: Record<string, number> = {};
      userCompanies.forEach((c) => {
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

  const handleAddCompany = async () => {
    if (!selectedCompanyCode) return;
    
    const company = companies.find(c => c.code === selectedCompanyCode);
    if (!company) return;

    try {
      // Add the new company with its default duration
      const newSettings = [
        ...Object.entries(durations).map(([company_code, duration_minutes]) => ({
          company_code,
          duration_minutes,
        })),
        {
          company_code: selectedCompanyCode,
          duration_minutes: company.default_duration_minutes || 30,
        },
      ];
      
      await onSave(newSettings);
      setShowAddDialog(false);
      setSelectedCompanyCode('');
      toast.success(`Added ${company.name}`);
    } catch (error) {
      toast.error('Failed to add company');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Inspection Durations
            </CardTitle>
            <CardDescription>Override default inspection times per company</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Company</DialogTitle>
                <DialogDescription>
                  Select a company to add to your inspection durations.
                </DialogDescription>
              </DialogHeader>
              
              {availableToAdd.length > 0 ? (
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Select Company</Label>
                    <Select value={selectedCompanyCode} onValueChange={setSelectedCompanyCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableToAdd.map((company) => (
                          <SelectItem key={company.code} value={company.code}>
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <p className="text-muted-foreground">
                    All available companies have been added.
                  </p>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Don't see your company? Set up a new company with custom CSV mapping.
                    </p>
                    <Button variant="outline" asChild>
                      <a href="/app/company-setup" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Company Setup
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {availableToAdd.length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      Don't see your company?{' '}
                      <a href="/app/company-setup" className="text-primary hover:underline">
                        Set up a new company with CSV mapping
                      </a>
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCompany} disabled={!selectedCompanyCode || isSaving}>
                      Add Company
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {userCompanies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No companies configured yet. Click "Add Company" to get started.
          </p>
        ) : (
          userCompanies.map((company) => (
            <div key={company.code} className="flex items-center gap-4">
              <Label className="w-40 font-medium">{company.name || company.code}</Label>
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
          ))
        )}
      </CardContent>
      {userCompanies.length > 0 && (
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Durations'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
