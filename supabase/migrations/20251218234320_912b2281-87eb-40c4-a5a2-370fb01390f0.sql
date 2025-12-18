-- Add columns for manual appointments and appointment types
ALTER TABLE public.inspections
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'inspection';

-- Add description column for personal/other appointments
ALTER TABLE public.inspections
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add a check constraint for appointment_type values
ALTER TABLE public.inspections
DROP CONSTRAINT IF EXISTS valid_appointment_type;

-- Use a trigger for validation instead of CHECK constraint
CREATE OR REPLACE FUNCTION validate_appointment_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.appointment_type IS NOT NULL AND NEW.appointment_type NOT IN ('inspection', 'personal', 'meeting', 'other') THEN
    RAISE EXCEPTION 'Invalid appointment_type: %. Must be one of: inspection, personal, meeting, other', NEW.appointment_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_appointment_type ON public.inspections;
CREATE TRIGGER check_appointment_type
  BEFORE INSERT OR UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_type();