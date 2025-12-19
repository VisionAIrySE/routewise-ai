import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Loader2, Plus, Pencil } from 'lucide-react';
import type { Appointment } from '@/types/appointment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { usePendingInspections } from '@/hooks/useInspections';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';
import type { Inspection } from '@/lib/mockData';

const appointmentSchema = z.object({
  appointment_type: z.enum(['inspection', 'adhoc']),
  appointment_date: z.date({ required_error: 'Date is required' }),
  appointment_time: z.string().min(1, 'Time is required'),
  duration_minutes: z.number().min(5).max(480),
  inspection_id: z.string().optional(),
  title: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof appointmentSchema>;

interface AddAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  inspection?: Inspection;
  editAppointment?: Appointment | null;
}

export function AddAppointmentModal({ 
  open, 
  onOpenChange, 
  defaultDate,
  inspection,
  editAppointment,
}: AddAppointmentModalProps) {
  const isEditing = !!editAppointment;
  const { toast } = useToast();
  const { data: pendingInspections = [] } = usePendingInspections();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  // Helper to convert time string like "12:00 PM" to 24h format "12:00"
  const convertTo24h = (time12h: string | undefined): string => {
    if (!time12h) return '09:00';
    // If already in 24h format, return as-is
    if (!time12h.includes('AM') && !time12h.includes('PM')) return time12h;
    
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12';
    } else if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointment_type: inspection ? 'inspection' : 'adhoc',
      appointment_date: defaultDate || new Date(),
      appointment_time: '09:00',
      duration_minutes: 30,
      inspection_id: inspection?.id,
      title: '',
      address: '',
      city: '',
      notes: '',
    },
  });

  // Reset form when modal opens with new props
  useEffect(() => {
    if (open) {
      if (editAppointment) {
        // Editing existing appointment
        reset({
          appointment_type: editAppointment.appointment_type as 'inspection' | 'adhoc',
          appointment_date: parseISO(editAppointment.appointment_date),
          appointment_time: convertTo24h(editAppointment.appointment_time || undefined),
          duration_minutes: editAppointment.duration_minutes || 30,
          inspection_id: editAppointment.inspection_id || undefined,
          title: editAppointment.title || '',
          address: editAppointment.address || '',
          city: editAppointment.city || '',
          notes: editAppointment.notes || '',
        });
      } else {
        // Creating new appointment
        reset({
          appointment_type: inspection ? 'inspection' : 'adhoc',
          appointment_date: defaultDate || new Date(),
          appointment_time: '09:00',
          duration_minutes: 30,
          inspection_id: inspection?.id,
          title: '',
          address: '',
          city: '',
          notes: '',
        });
      }
    }
  }, [open, inspection, defaultDate, editAppointment, reset]);

  const appointmentType = watch('appointment_type');
  const selectedInspectionId = watch('inspection_id');

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && editAppointment) {
        // Update existing appointment
        await updateAppointment.mutateAsync({
          id: editAppointment.id,
          data: {
            appointment_date: data.appointment_date,
            appointment_time: data.appointment_time,
            duration_minutes: data.duration_minutes,
            title: data.appointment_type === 'adhoc' ? data.title : undefined,
            address: data.appointment_type === 'adhoc' ? data.address : undefined,
            notes: data.notes,
          },
        });

        toast({
          title: 'Appointment Updated',
          description: 'The appointment has been updated.',
        });
      } else {
        // Create new appointment
        await createAppointment.mutateAsync({
          appointment_type: data.appointment_type,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          duration_minutes: data.duration_minutes,
          inspection_id: data.appointment_type === 'inspection' ? data.inspection_id : undefined,
          title: data.appointment_type === 'adhoc' ? data.title : undefined,
          address: data.appointment_type === 'adhoc' ? data.address : undefined,
          city: data.appointment_type === 'adhoc' ? data.city : undefined,
          notes: data.notes,
        });

        toast({
          title: 'Appointment Created',
          description: data.appointment_type === 'inspection' 
            ? 'Inspection appointment has been scheduled.'
            : 'Personal appointment has been added.',
        });
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} appointment. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const isSaving = createAppointment.isPending || updateAppointment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-5 w-5 text-primary" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
            {isEditing ? 'Edit Appointment' : 'Add Appointment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selector - only show if not pre-linked to inspection */}
          {!inspection && (
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <RadioGroup
                value={appointmentType}
                onValueChange={(value) => setValue('appointment_type', value as 'inspection' | 'adhoc')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inspection" id="type-inspection" />
                  <Label htmlFor="type-inspection" className="font-normal cursor-pointer">
                    Inspection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adhoc" id="type-adhoc" />
                  <Label htmlFor="type-adhoc" className="font-normal cursor-pointer">
                    Personal / Ad-hoc
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Inspection Selector */}
          {appointmentType === 'inspection' && !inspection && (
            <div className="space-y-2">
              <Label>Select Inspection</Label>
              <Select
                value={selectedInspectionId}
                onValueChange={(value) => setValue('inspection_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an inspection..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingInspections.map((insp) => (
                    <SelectItem key={insp.id} value={insp.id}>
                      <span className="truncate">
                        {insp.claimNumber ? `${insp.claimNumber} - ` : ''}
                        {insp.street}, {insp.city}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pendingInspections.length === 0 && (
                <p className="text-xs text-muted-foreground">No pending inspections available</p>
              )}
            </div>
          )}

          {/* Pre-linked inspection display */}
          {inspection && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">{inspection.street}</p>
              <p className="text-sm text-muted-foreground">{inspection.city}, {inspection.state}</p>
            </div>
          )}

          {/* Ad-hoc fields */}
          {appointmentType === 'adhoc' && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Doctor appointment, Lunch, etc."
                  {...register('title')}
                />
              </div>
              <div className="space-y-2">
                <Label>Address (optional for routing)</Label>
                <Input
                  placeholder="123 Main St"
                  {...register('address')}
                />
              </div>
              <div className="space-y-2">
                <Label>City (optional)</Label>
                <Input
                  placeholder="Portland"
                  {...register('city')}
                />
              </div>
            </>
          )}

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !watch('appointment_date') && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('appointment_date') ? format(watch('appointment_date'), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watch('appointment_date')}
                  onSelect={(date) => date && setValue('appointment_date', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.appointment_date && (
              <p className="text-xs text-destructive">{errors.appointment_date.message}</p>
            )}
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              {...register('appointment_time')}
              className="w-full"
            />
            {errors.appointment_time && (
              <p className="text-xs text-destructive">{errors.appointment_time.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={String(watch('duration_minutes'))}
              onValueChange={(value) => setValue('duration_minutes', Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes..."
              {...register('notes')}
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Appointment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
