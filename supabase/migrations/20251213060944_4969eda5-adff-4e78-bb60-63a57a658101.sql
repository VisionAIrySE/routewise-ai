-- Create saved_routes table for storing optimized routes
CREATE TABLE public.saved_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  planning_session_id UUID DEFAULT gen_random_uuid(),
  route_date DATE NOT NULL,
  day_of_week INTEGER,
  route_name TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  stops_count INTEGER NOT NULL DEFAULT 0,
  total_miles NUMERIC(10,2),
  total_hours NUMERIC(10,2),
  drive_hours NUMERIC(10,2),
  inspection_hours NUMERIC(10,2),
  fuel_cost NUMERIC(10,2),
  zones TEXT[],
  start_time TEXT,
  finish_time TEXT,
  stops_json JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  original_request TEXT,
  hours_requested NUMERIC(10,2),
  location_filter TEXT,
  exclusions TEXT[],
  anchor_stop_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_routes
CREATE POLICY "Users can view their own routes"
ON public.saved_routes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes"
ON public.saved_routes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
ON public.saved_routes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
ON public.saved_routes
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_saved_routes_updated_at
BEFORE UPDATE ON public.saved_routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient calendar queries
CREATE INDEX idx_saved_routes_user_date ON public.saved_routes(user_id, route_date);
CREATE INDEX idx_saved_routes_planning_session ON public.saved_routes(planning_session_id);