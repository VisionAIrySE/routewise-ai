import { useState, useEffect } from 'react';
import { Database, Clock, FileSpreadsheet } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

interface RecentUpload {
  name: string;
  records: number;
  date: string;
}

export function DataSourceIndicator() {
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recent-csv-uploads');
    if (stored) {
      setRecentUploads(JSON.parse(stored));
    }
  }, []);

  if (recentUploads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="h-4 w-4" />
          <span className="text-sm">No data uploaded yet</span>
        </div>
      </div>
    );
  }

  const latestUpload = recentUploads[0];
  const uploadDate = parseISO(latestUpload.date);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Data Source</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Dashboard reflects uploaded CSV data, not live company platforms.
      </p>

      <div className="space-y-2">
        {recentUploads.slice(0, 3).map((upload, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-foreground">{upload.name}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0 ml-2">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{upload.date}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
        Last updated: {formatDistanceToNow(uploadDate, { addSuffix: true })}
      </p>
    </div>
  );
}
