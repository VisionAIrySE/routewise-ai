import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CompanySetup() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !companyCode.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // TODO: Implement company creation with CSV mapping
    toast.info('Company setup with CSV mapping coming soon');
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/app/settings')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Add New Company</CardTitle>
              <CardDescription>
                Set up a new inspection company and map their CSV export format
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., ABC Inspections"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCode">Company Code *</Label>
              <Input
                id="companyCode"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Short code used to identify this company (3-10 characters)
              </p>
            </div>

            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Plus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                CSV Column Mapping
              </p>
              <p className="text-xs text-muted-foreground">
                Upload a sample CSV file to map columns to our required fields.
                <br />
                This feature is coming soon.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/app/settings')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Company
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
