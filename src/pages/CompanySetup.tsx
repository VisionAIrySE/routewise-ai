import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Upload, Check, X, AlertCircle, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { 
  suggestMappings, 
  getUnmappedColumns, 
  generateCompanyCode, 
  validateMappings,
  parseCSVHeaders,
  formatMappingsForDB,
  FIELD_LABELS,
  FIELD_PRIORITY,
  REQUIRED_FIELDS
} from '@/lib/columnMappingUtils';
import { useSaveCompanyProfile } from '@/hooks/useCompanyProfiles';

type AppointmentType = 'none' | 'call_ahead' | 'date_only' | 'datetime';

export default function CompanySetup() {
  const navigate = useNavigate();
  const saveCompanyProfile = useSaveCompanyProfile();
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Mapping state
  const [mappings, setMappings] = useState<Record<string, string | null>>({});
  const [autoDetected, setAutoDetected] = useState<Set<string>>(new Set());
  
  // Company details state
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [defaultDuration, setDefaultDuration] = useState(15);
  const [highValueDuration, setHighValueDuration] = useState(90);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('none');
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'details'>('upload');

  const handleFileRead = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const extractedHeaders = parseCSVHeaders(content);
      
      if (extractedHeaders.length === 0) {
        toast.error('Could not parse headers from file');
        return;
      }
      
      setHeaders(extractedHeaders);
      setUploadedFile(file);
      
      // Auto-suggest mappings
      const suggested = suggestMappings(extractedHeaders);
      setMappings(suggested);
      
      // Track which fields were auto-detected
      const detected = new Set<string>();
      for (const [field, value] of Object.entries(suggested)) {
        if (value) detected.add(field);
      }
      setAutoDetected(detected);
      
      // Auto-generate company code from filename
      const baseName = file.name.replace(/\.(csv|xlsx|xls)$/i, '');
      setCompanyCode(generateCompanyCode(baseName));
      setCompanyName(baseName);
      
      setStep('mapping');
      toast.success(`Detected ${extractedHeaders.length} columns`);
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileRead(file);
    } else {
      toast.error('Please upload a CSV or Excel file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const updateMapping = (field: string, value: string | null) => {
    setMappings(prev => ({ ...prev, [field]: value === 'none' ? null : value }));
  };

  const handleContinueToDetails = () => {
    const validation = validateMappings(mappings);
    if (!validation.valid) {
      toast.error(`Missing required fields: ${validation.missing.map(f => FIELD_LABELS[f]).join(', ')}`);
      return;
    }
    setStep('details');
  };

  const handleSave = async () => {
    if (!companyCode.trim() || !companyName.trim()) {
      toast.error('Company code and name are required');
      return;
    }

    try {
      await saveCompanyProfile.mutateAsync({
        code: companyCode.toUpperCase(),
        name: companyName,
        column_fingerprint: headers,
        column_mappings: formatMappingsForDB(mappings),
        default_duration_minutes: defaultDuration,
        high_value_duration_minutes: highValueDuration,
        appointment_type: appointmentType
      });
      
      toast.success('Company profile saved successfully');
      navigate('/app/settings');
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast.error('Failed to save company profile');
    }
  };

  const unmappedColumns = getUnmappedColumns(headers, mappings);

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
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
                {step === 'upload' && 'Upload a sample export file to auto-detect column mappings'}
                {step === 'mapping' && 'Review and adjust the detected column mappings'}
                {step === 'details' && 'Configure company details and save'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Sample Export File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop a CSV or Excel file from this company,<br />
                or click below to browse
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Select File
                </label>
              </Button>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{uploadedFile?.name}</span>
                <span className="text-primary">({headers.length} columns detected)</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Field Mappings</h3>
                <div className="grid gap-3">
                  {FIELD_PRIORITY.map(field => {
                    const isRequired = REQUIRED_FIELDS.includes(field);
                    const isDetected = autoDetected.has(field);
                    const value = mappings[field];
                    
                    return (
                      <div key={field} className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                          {value ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : isRequired ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <Label className="w-40 text-sm">
                          {FIELD_LABELS[field]}
                          {isRequired && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                          value={value || 'none'}
                          onValueChange={(v) => updateMapping(field, v)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Select --</SelectItem>
                            {headers.map(header => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isDetected && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            (auto)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {unmappedColumns.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2">Unmapped Columns</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    These columns will be included in the fingerprint for future file matching
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unmappedColumns.map(col => (
                      <span key={col} className="px-2 py-1 bg-background rounded text-xs">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('upload')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleContinueToDetails}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Company Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyCode">Company Code *</Label>
                  <Input
                    id="companyCode"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    placeholder="e.g., IPI"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Short identifier (3-10 characters)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Insurance Property Inspections"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 15)}
                    min={5}
                    max={180}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highValueDuration">High-Value Duration (minutes)</Label>
                  <Input
                    id="highValueDuration"
                    type="number"
                    value={highValueDuration}
                    onChange={(e) => setHighValueDuration(parseInt(e.target.value) || 90)}
                    min={15}
                    max={300}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Appointment Type</Label>
                <RadioGroup
                  value={appointmentType}
                  onValueChange={(v) => setAppointmentType(v as AppointmentType)}
                  className="grid gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="apt-none" />
                    <Label htmlFor="apt-none" className="font-normal cursor-pointer">
                      None - No appointments needed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="call_ahead" id="apt-call" />
                    <Label htmlFor="apt-call" className="font-normal cursor-pointer">
                      Call Ahead - Inspector must call to schedule
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date_only" id="apt-date" />
                    <Label htmlFor="apt-date" className="font-normal cursor-pointer">
                      Date Only - Company provides date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="datetime" id="apt-datetime" />
                    <Label htmlFor="apt-datetime" className="font-normal cursor-pointer">
                      Date + Time - Company provides exact datetime
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('mapping')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saveCompanyProfile.isPending}
                >
                  {saveCompanyProfile.isPending ? 'Saving...' : 'Save Company Profile'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
