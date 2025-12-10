import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

  // Mock recent uploads
  const recentUploads: RecentUpload[] = [
    { name: 'MIL_export_2024-11-05.csv', records: 34, date: '2024-11-05' },
    { name: 'IPI_batch_2024-11-04.xlsx', records: 12, date: '2024-11-04' },
    { name: 'SIG_schedule_2024-11-03.csv', records: 8, date: '2024-11-03' },
  ];

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
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app, this would POST to n8n webhook:
    // const formData = new FormData();
    // formData.append('file', file);
    // await fetch(import.meta.env.VITE_N8N_CSV_WEBHOOK_URL, {
    //   method: 'POST',
    //   body: formData
    // });

    toast({
      title: 'Upload Successful',
      description: `Processed ${Math.floor(Math.random() * 20 + 10)} inspections from ${file.name}`,
    });

    setUploading(false);
    onOpenChange(false);
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
            <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground" />
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
                    <span className="font-medium">{upload.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {upload.records} records
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
