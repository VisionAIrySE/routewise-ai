import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Building2, Clock } from 'lucide-react';
import { useCompanies, type Company } from '@/hooks/useProfile';

interface SelectedCompany {
  company_id: string;
  code: string;
  name: string;
  avg_inspection_minutes: number;
}

interface CompanySelectorProps {
  selectedCompanies: SelectedCompany[];
  onAdd: (company: SelectedCompany) => void;
  onRemove: (companyId: string) => void;
  onUpdateMinutes: (companyId: string, minutes: number) => void;
  error?: string;
}

export function CompanySelector({
  selectedCompanies,
  onAdd,
  onRemove,
  onUpdateMinutes,
  error,
}: CompanySelectorProps) {
  const [search, setSearch] = useState('');
  const { data: companies = [], isLoading } = useCompanies(search);

  const availableCompanies = companies.filter(
    (c) => !selectedCompanies.some((sc) => sc.company_id === c.id)
  );

  const handleSelect = (company: Company) => {
    onAdd({
      company_id: company.id,
      code: company.code,
      name: company.name,
      avg_inspection_minutes: company.default_inspection_minutes,
    });
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search or add a company..."
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {search.length > 0 && (
        <div className="border border-border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          ) : availableCompanies.length > 0 ? (
            <div className="divide-y divide-border">
              {availableCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-primary">{company.code}</span>
                    <span className="mx-2 text-muted-foreground">—</span>
                    <span>{company.name}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No matching companies found. Contact support to add your company.
            </div>
          )}
        </div>
      )}

      {/* Selected Companies */}
      {selectedCompanies.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Your Companies</p>
          {selectedCompanies.map((company) => (
            <div
              key={company.company_id}
              className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-bold">
                  {company.code}
                </Badge>
                <span className="text-sm">{company.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={10}
                    max={120}
                    value={company.avg_inspection_minutes}
                    onChange={(e) =>
                      onUpdateMinutes(company.company_id, parseInt(e.target.value) || 30)
                    }
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(company.company_id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedCompanies.length === 0 && search.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Search for companies above to add them</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
