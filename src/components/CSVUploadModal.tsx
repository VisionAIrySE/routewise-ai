import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RecentUpload {
  name: string;
  records: number;
  date: string;
}

export function CSVUploadModal({ open, onOpenChange }: CSVUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load recent uploads from localStorage
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>(() => {
    const stored = localStorage.getItem('recent-csv-uploads');
    return stored ? JSON.parse(stored) : [];
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the Edge Function for CSV upload
      const response = await fetch(
        'https://ftlprmktjrhkxwrgwtig.supabase.co/functions/v1/csv-upload',
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bHBybWt0anJoa3h3cmd3dGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTU0MjIsImV4cCI6MjA3OTk3MTQyMn0.jjXzhQcLcBINGLssVkC3fs6AW8MkspXbiPGkRpu80rk',
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || `Upload failed: ${response.status}`);
      }
      
      // Extract records count from response
      const recordsCount = result.records_processed || result.count || result.records || 0;
      const companyDetected = result.company_detected || result.company || 'Unknown';

      // Update recent uploads
      const newUpload: RecentUpload = {
        name: file.name,
        records: recordsCount,
        date: new Date().toISOString().split('T')[0],
      };
      const updatedUploads = [newUpload, ...recentUploads.slice(0, 4)];
      setRecentUploads(updatedUploads);
      localStorage.setItem('recent-csv-uploads', JSON.stringify(updatedUploads));

      toast({
        title: 'Upload Successful',
        description: `Processed ${recordsCount} ${companyDetected} inspections`,
      });

      // Refresh inspections data
      queryClient.invalidateQueries({ queryKey: ['inspections'] });

      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Inspections
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
            ) : (
              <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-foreground">
              {uploading ? 'Uploading...' : 'Drag & drop CSV or XLSX file here'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Supported: MIL, IPI, SIG export formats
            </p>
          </div>

          {/* Recent Uploads */}
          {recentUploads.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Recent Uploads</h4>
              <div className="space-y-2">
                {recentUploads.map((upload, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-normal" />
                      <span className="font-medium truncate max-w-[200px]">{upload.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {upload.records} records
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
