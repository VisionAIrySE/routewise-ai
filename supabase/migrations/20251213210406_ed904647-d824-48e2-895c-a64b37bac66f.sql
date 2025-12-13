-- Create team role enum
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member');

-- Create team member status enum  
CREATE TYPE public.team_member_status AS ENUM ('pending', 'active', 'removed');

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  seat_count INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  status team_member_status NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id 
    AND user_id = _user_id 
    AND status = 'active'
  )
$$;

-- Create security definer function to check team admin/owner
CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id 
    AND user_id = _user_id 
    AND role IN ('owner', 'admin')
    AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = _team_id AND owner_id = _user_id
  )
$$;

-- Get user's team
CREATE OR REPLACE FUNCTION public.get_user_team(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM public.team_members
  WHERE user_id = _user_id AND status = 'active'
  LIMIT 1
$$;

-- RLS Policies for teams
CREATE POLICY "Team owners can manage their team"
ON public.teams FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Team members can view their team"
ON public.teams FOR SELECT
USING (public.is_team_member(auth.uid(), id));

-- RLS Policies for team_members
CREATE POLICY "Team admins can manage members"
ON public.team_members FOR ALL
USING (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team members can view team roster"
ON public.team_members FOR SELECT
USING (public.is_team_member(auth.uid(), team_id));

-- Allow team admins to view member routes
CREATE POLICY "Team admins can view member routes"
ON public.saved_routes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = saved_routes.user_id
    AND tm.status = 'active'
    AND public.is_team_admin(auth.uid(), tm.team_id)
  )
);

-- Create updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_email ON public.team_members(email);