import { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, CheckCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentUpload {
  name: string;
  records: number;
  date: string;
}

interface DataSourcesProps {
  onUploadClick: () => void;
}

export function DataSources({ onUploadClick }: DataSourcesProps) {
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);

  useEffect(() => {
    const loadUploads = () => {
      const stored = localStorage.getItem('recent-csv-uploads');
      if (stored) {
        setRecentUploads(JSON.parse(stored));
      }
    };

    loadUploads();

    // Listen for storage changes (from other tabs or PWA updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recent-csv-uploads') {
        loadUploads();
      }
    };

    // Also poll periodically to catch same-tab updates
    const interval = setInterval(loadUploads, 5000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Detect company from filename
  const getCompanyFromFilename = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('mil') || lower.includes('moratorium')) return 'MIL';
    if (lower.includes('ipi') || lower.includes('inspection')) return 'IPI';
    if (lower.includes('sig')) return 'SIG';
    return 'CSV';
  };

  const getCompanyColor = (company: string) => {
    switch (company) {
      case 'MIL': return 'bg-blue-500';
      case 'IPI': return 'bg-emerald-500';
      case 'SIG': return 'bg-purple-500';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Data Sources</h3>
            <p className="text-sm text-muted-foreground">Recent uploads</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onUploadClick}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {recentUploads.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent uploads</p>
          <p className="text-xs mt-1">Upload CSV/XLS files to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentUploads.slice(0, 3).map((upload, index) => {
            const company = getCompanyFromFilename(upload.name);
            const uploadDate = new Date(upload.date);
            const isRecent = Date.now() - uploadDate.getTime() < 24 * 60 * 60 * 1000;

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className={`h-8 w-8 rounded-lg ${getCompanyColor(company)} flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">{company.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" title={upload.name}>
                    {upload.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {upload.records} records · {isRecent
                      ? formatDistanceToNow(uploadDate, { addSuffix: true })
                      : format(uploadDate, 'MMM d')}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-normal shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
