import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { usePendingInspections } from '@/hooks/useInspections';
import { cn } from '@/lib/utils';

const appointmentSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  time: z.string().min(1, 'Time is required'),
  duration_min: z.number().min(5).max(480),
  appointment_type: z.enum(['inspection', 'personal', 'meeting', 'other']),
  inspection_id: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AddAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

export function AddAppointmentModal({ open, onOpenChange, defaultDate }: AddAppointmentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: pendingInspections = [] } = usePendingInspections();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: defaultDate || new Date(),
      time: '09:00',
      duration_min: 30,
      appointment_type: 'personal',
      address: '',
      description: '',
      notes: '',
    },
  });

  const appointmentType = watch('appointment_type');
  const selectedInspectionId = watch('inspection_id');

  // When linking to an existing inspection, auto-fill address
  const handleInspectionSelect = (inspectionId: string) => {
    setValue('inspection_id', inspectionId);
    const inspection = pendingInspections.find(i => i.id === inspectionId);
    if (inspection) {
      setValue('address', inspection.fullAddress);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Build the fixed_appointment timestamp
      const [hours, minutes] = data.time.split(':').map(Number);
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      const fixedAppointment = appointmentDate.toISOString();

      // Format appointment_time as "12:00 PM" style
      const formattedTime = format(appointmentDate, 'h:mm a');

      if (data.appointment_type === 'inspection' && data.inspection_id) {
        // Update existing inspection with appointment time
        const { error } = await supabase
          .from('inspections')
          .update({
            fixed_appointment: fixedAppointment,
            appointment_time: formattedTime,
            duration_min: data.duration_min,
            notes: data.notes || null,
          })
          .eq('id', data.inspection_id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: 'Appointment Scheduled',
          description: 'Inspection appointment has been set.',
        });
      } else {
        // Create a new manual appointment entry
        const addressParts = (data.address || 'Personal Appointment').split(',');
        const street = addressParts[0]?.trim() || 'Personal Appointment';
        const city = addressParts[1]?.trim() || 'N/A';
        const stateZip = addressParts[2]?.trim().split(' ') || ['OR', '00000'];
        const state = stateZip[0] || 'OR';
        const zip = stateZip[1] || '00000';

        const { error } = await supabase
          .from('inspections')
          .insert({
            user_id: user.id,
            is_manual: true,
            appointment_type: data.appointment_type,
            fixed_appointment: fixedAppointment,
            appointment_time: formattedTime,
            duration_min: data.duration_min,
            street,
            city,
            state,
            zip,
            full_address: data.address || 'Personal Appointment',
            description: data.description || null,
            notes: data.notes || null,
            company_name: 'MANUAL',
            status: 'PLANNED',
            urgency_tier: 'NORMAL',
          });

        if (error) throw error;

        toast({
          title: 'Appointment Added',
          description: `${data.appointment_type.charAt(0).toUpperCase() + data.appointment_type.slice(1)} appointment created.`,
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      
      // Reset form and close
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={appointmentType}
              onValueChange={(value) => setValue('appointment_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* For Inspection type - link to existing */}
          {appointmentType === 'inspection' && (
            <div className="space-y-2">
              <Label>Link to Inspection</Label>
              <Select
                value={selectedInspectionId}
                onValueChange={handleInspectionSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select inspection..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingInspections.map((inspection) => (
                    <SelectItem key={inspection.id} value={inspection.id}>
                      <span className="truncate">
                        {inspection.street}, {inspection.city}
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

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !watch('date') && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('date') ? format(watch('date'), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watch('date')}
                  onSelect={(date) => date && setValue('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              {...register('time')}
              className="w-full"
            />
            {errors.time && (
              <p className="text-xs text-destructive">{errors.time.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Select
              value={String(watch('duration_min'))}
              onValueChange={(value) => setValue('duration_min', Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address (for non-inspection types) */}
          {appointmentType !== 'inspection' && (
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input
                placeholder="123 Main St, City, ST 12345"
                {...register('address')}
              />
            </div>
          )}

          {/* Description */}
          {appointmentType !== 'inspection' && (
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="What is this appointment for?"
                {...register('description')}
              />
            </div>
          )}

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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Appointment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
