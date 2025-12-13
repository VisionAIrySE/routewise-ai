import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  seat_count: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string | null;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active' | 'removed';
  invited_at: string;
  joined_at: string | null;
  profile?: {
    name: string | null;
    email: string | null;
  };
}

export interface MemberRoute {
  id: string;
  route_date: string;
  route_name: string | null;
  stops_count: number;
  total_miles: number | null;
  total_hours: number | null;
  status: string;
  user_id: string;
}

export function useTeam() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's team via the function
      const { data: teamId } = await supabase.rpc('get_user_team', { _user_id: user.id });
      
      if (!teamId) {
        // Check if user owns a team
        const { data: ownedTeam } = await supabase
          .from('teams')
          .select('*')
          .eq('owner_id', user.id)
          .single();
        
        if (ownedTeam) {
          setTeam(ownedTeam);
          setIsAdmin(true);
        } else {
          setTeam(null);
        }
      } else {
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();
        
        if (teamData) {
          setTeam(teamData);
          // Check if user is admin
          const { data: isAdminResult } = await supabase.rpc('is_team_admin', {
            _user_id: user.id,
            _team_id: teamId
          });
          setIsAdmin(isAdminResult || false);
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMembers = useCallback(async () => {
    if (!team) return;
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id)
        .neq('status', 'removed')
        .order('role', { ascending: true });
      
      if (error) throw error;
      
      // Fetch profiles for active members
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          if (member.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', member.user_id)
              .single();
            return { ...member, profile };
          }
          return member;
        })
      );
      
      setMembers(membersWithProfiles as TeamMember[]);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [team]);

  const inviteMember = async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!team || !user) return;
    
    try {
      const { error } = await supabase.from('team_members').insert({
        team_id: team.id,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
      });
      
      if (error) throw error;
      
      toast.success(`Invitation sent to ${email}`);
      await fetchMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite member');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!team) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'removed' as const })
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast.success('Member removed');
      await fetchMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    if (!team) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast.success('Role updated');
      await fetchMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const fetchMemberRoutes = async (userId: string): Promise<MemberRoute[]> => {
    try {
      const { data, error } = await supabase
        .from('saved_routes')
        .select('id, route_date, route_name, stops_count, total_miles, total_hours, status, user_id')
        .eq('user_id', userId)
        .order('route_date', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member routes:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    if (team) {
      fetchMembers();
    }
  }, [team, fetchMembers]);

  return {
    team,
    members,
    isAdmin,
    loading,
    inviteMember,
    removeMember,
    updateMemberRole,
    fetchMemberRoutes,
    refetch: fetchTeam,
  };
}
