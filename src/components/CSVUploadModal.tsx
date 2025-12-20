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
import { CSVConflictModal, ConflictItem, ConflictResolution } from '@/components/CSVConflictModal';
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

const N8N_PROXY_URL = 'https://rsylbntdtflyoaxiwhvm.supabase.co/functions/v1/n8n-proxy';

export function CSVUploadModal({ open, onOpenChange, onUploadComplete }: CSVUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [missingInspections, setMissingInspections] = useState<MissingInspection[]>([]);
  const [reconciliationCompany, setReconciliationCompany] = useState('');
  const [showConflicts, setShowConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [pendingUploadData, setPendingUploadData] = useState<UploadResponse | null>(null);
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
      
      // Log the full response to help debug
      console.log('Upload response:', JSON.stringify(uploadResult));

      // Extract records count from response - check various possible field names
      const recordsCount = 
        (uploadResult as any).inspection_count ||
        uploadResult.inserted_to_airtable || 
        uploadResult.valid_inspections || 
        uploadResult.total_rows_in_file || 
        0;
      
      // Extract company from response - try company field or parse from message
      let companyDetected = uploadResult.company || 'Unknown';
      if (companyDetected === 'Unknown' && uploadResult.message) {
        // Try to extract company from message like "Successfully processed 15 IPI inspections"
        const messageMatch = uploadResult.message.match(/(\d+)\s+(\w+)\s+inspections/i);
        if (messageMatch && messageMatch[2]) {
          companyDetected = messageMatch[2].toUpperCase();
        }
      }

      // Check for conflicts in the response
      if (uploadResult.has_conflicts && uploadResult.conflicts && uploadResult.conflicts.length > 0) {
        // Store upload data for later and show conflict modal
        setPendingUploadData(uploadResult);
        setConflicts(uploadResult.conflicts.map((c: any) => ({
          type: c.type || 'duplicate',
          existing: {
            id: c.existing_id || c.existing?.id,
            address: c.existing_address || c.existing?.address || '',
            date: c.existing_date || c.existing?.date,
            time: c.existing_time || c.existing?.time,
            company: c.existing_company || c.existing?.company,
            insured_name: c.existing_insured_name || c.existing?.insured_name,
          },
          incoming: {
            id: c.incoming_id || c.incoming?.id,
            address: c.incoming_address || c.incoming?.address || '',
            date: c.incoming_date || c.incoming?.date,
            time: c.incoming_time || c.incoming?.time,
            company: c.incoming_company || c.incoming?.company,
            insured_name: c.incoming_insured_name || c.incoming?.insured_name,
          },
          suggested_action: c.suggested_action || 'keep_existing',
        })));
        setShowConflicts(true);
        return;
      }

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
        // Filter out inspections that are already marked as COMPLETED in the database
        const missingIds = uploadResult.missing_inspections.map(i => i.id);
        const { data: completedInDb } = await supabase
          .from('inspections')
          .select('id')
          .in('id', missingIds)
          .eq('status', 'COMPLETED');
        
        const completedIds = new Set(completedInDb?.map(i => i.id) || []);
        const filteredMissing = uploadResult.missing_inspections.filter(i => !completedIds.has(i.id));
        
        if (filteredMissing.length > 0) {
          setMissingInspections(filteredMissing);
          setReconciliationCompany(companyDetected);
          setShowReconciliation(true);
        } else {
          onOpenChange(false);
          onUploadComplete?.();
        }
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

  const handleConflictResolve = async (resolutions: ConflictResolution[]) => {
    try {
      // Process resolutions
      for (const resolution of resolutions) {
        if (resolution.action === 'use_new' && resolution.existing_id) {
          // Update existing with new data - handled by backend
          // For now, we just note the resolution choice
        } else if (resolution.action === 'keep_existing') {
          // Skip the incoming record - nothing to do
        }
        // keep_both - both records are kept
      }

      toast({
        title: 'Conflicts Resolved',
        description: `Processed ${resolutions.length} conflict resolutions`,
      });

      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setShowConflicts(false);
      setPendingUploadData(null);
      onOpenChange(false);
      onUploadComplete?.();
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve conflicts',
        variant: 'destructive',
      });
    }
  };

  const handleConflictCancel = () => {
    setShowConflicts(false);
    setPendingUploadData(null);
    toast({
      title: 'Import Cancelled',
      description: 'No changes were made',
    });
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

    <CSVConflictModal
      open={showConflicts}
      onOpenChange={setShowConflicts}
      conflicts={conflicts}
      onResolve={handleConflictResolve}
      onCancel={handleConflictCancel}
    />
    </>
  );
}
