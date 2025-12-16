-- Add column_fingerprint to company_profiles for auto-detecting company from CSV headers
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS column_fingerprint TEXT[];

-- Add comment explaining the column
COMMENT ON COLUMN public.company_profiles.column_fingerprint IS 'Array of column headers from sample CSV file, used to auto-identify company on future uploads';