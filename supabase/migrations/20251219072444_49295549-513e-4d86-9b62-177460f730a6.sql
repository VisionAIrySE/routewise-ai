-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- Link to inspection (NULL for ad-hoc)
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
  -- Appointment details
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  duration_minutes INTEGER DEFAULT 30,
  -- For ad-hoc only (inspection appointments get address from inspection)
  address TEXT,
  city TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  -- Type and description
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('inspection', 'adhoc')),
  title TEXT,
  notes TEXT,
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_appointments_user_date ON public.appointments(user_id, appointment_date);
CREATE INDEX idx_appointments_inspection ON public.appointments(inspection_id) WHERE inspection_id IS NOT NULL;
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can manage their own appointments
CREATE POLICY "Users can manage own appointments"
ON public.appointments
FOR ALL
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();