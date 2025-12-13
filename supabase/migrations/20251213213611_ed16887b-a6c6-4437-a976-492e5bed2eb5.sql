-- Enable RLS on tables that have it disabled
-- These are reference/lookup tables used by the application

-- Enable RLS on node_equivalence (reference table for node type mappings)
ALTER TABLE public.node_equivalence ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read node_equivalence (reference data)
CREATE POLICY "Authenticated users can read node_equivalence"
ON public.node_equivalence
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on use_case_keywords (reference table for keyword lookups)
ALTER TABLE public.use_case_keywords ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read use_case_keywords (reference data)
CREATE POLICY "Authenticated users can read use_case_keywords"
ON public.use_case_keywords
FOR SELECT
TO authenticated
USING (true);