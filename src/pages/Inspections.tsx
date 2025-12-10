import { useState, useMemo } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InspectionCard } from '@/components/InspectionCard';
import { useInspections } from '@/hooks/useInspections';
import type { Company, UrgencyTier, InspectionStatus } from '@/lib/mockData';

const Inspections = () => {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<Company | 'ALL'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyTier | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | 'ALL'>('ALL');

  const { data: inspections, isLoading, error } = useInspections({
    company: companyFilter,
    urgency: urgencyFilter,
    status: statusFilter,
  });

  const filteredInspections = useMemo(() => {
    if (!inspections) return [];
    
    return inspections.filter((inspection) => {
      if (search === '') return true;
      return (
        inspection.fullAddress.toLowerCase().includes(search.toLowerCase()) ||
        inspection.claimNumber.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [inspections, search]);

  const sortedInspections = useMemo(() => {
    return [...filteredInspections].sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [filteredInspections]);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Inspections
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage and filter your inspection queue
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by address or claim number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={companyFilter} onValueChange={(v) => setCompanyFilter(v as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Companies</SelectItem>
                <SelectItem value="MIL">MIL</SelectItem>
                <SelectItem value="IPI">IPI</SelectItem>
                <SelectItem value="SIG">SIG</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Urgency</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="SOON">Soon</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `Showing ${sortedInspections.length} inspections`}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading inspections...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <Filter className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Failed to load inspections</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your Airtable connection and try again
          </p>
        </div>
      )}

      {/* Inspection List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {sortedInspections.map((inspection, index) => (
            <div key={inspection.id} style={{ animationDelay: `${index * 50}ms` }}>
              <InspectionCard inspection={inspection} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && sortedInspections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No inspections found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}
    </div>
  );
};

export default Inspections;
