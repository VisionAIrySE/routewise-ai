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
import { ReconcileInspections } from '@/components/ReconcileInspections';
import { MissingInspection, UploadResponse } from '@/lib/routeUtils';

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

interface RecentUpload {
  name: string;
  records: number;
  date: string;
}

const N8N_PROXY_URL = 'https://ftlprmktjrhkxwrgwtig.supabase.co/functions/v1/n8n-proxy';

export function CSVUploadModal({ open, onOpenChange, onUploadComplete }: CSVUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [missingInspections, setMissingInspections] = useState<MissingInspection[]>([]);
  const [reconciliationCompany, setReconciliationCompany] = useState('');
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
      // Get the auth token for secure proxy calls
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Send through secure n8n-proxy Edge Function
      const response = await fetch(`${N8N_PROXY_URL}?action=upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it automatically
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || `Upload failed: ${response.status}`);
      }

      const uploadResult = result as UploadResponse;

      // Extract records count from response
      const recordsCount = uploadResult.inserted_to_airtable || uploadResult.valid_inspections || uploadResult.total_rows_in_file || 0;
      const companyDetected = uploadResult.company || 'Unknown';

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

      // Check if reconciliation is needed
      if (uploadResult.needs_reconciliation && uploadResult.missing_inspections && uploadResult.missing_inspections.length > 0) {
        setMissingInspections(uploadResult.missing_inspections);
        setReconciliationCompany(companyDetected);
        setShowReconciliation(true);
      } else {
        onOpenChange(false);
        onUploadComplete?.();
      }
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

  const handleReconciliationComplete = (completedCount: number, removedCount: number) => {
    toast({
      title: 'Reconciliation Complete',
      description: `${completedCount} completed, ${removedCount} removed`,
    });
    queryClient.invalidateQueries({ queryKey: ['inspections'] });
    onOpenChange(false);
  };

  return (
    <>
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

    <ReconcileInspections
      open={showReconciliation}
      onOpenChange={setShowReconciliation}
      inspections={missingInspections}
      company={reconciliationCompany}
      onComplete={handleReconciliationComplete}
    />
    </>
  );
}
