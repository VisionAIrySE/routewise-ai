import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTeam, TeamMember, MemberRoute } from '@/hooks/useTeam';
import { Users, UserPlus, Route, Calendar, Trash2, Shield, User, Mail, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function TeamDashboard() {
  const { team, members, isAdmin, loading, inviteMember, removeMember, updateMemberRole, fetchMemberRoutes } = useTeam();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberRoutes, setMemberRoutes] = useState<MemberRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await inviteMember(inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteRole('member');
    setInviteOpen(false);
  };

  const handleViewRoutes = async (member: TeamMember) => {
    if (!member.user_id) return;
    setSelectedMember(member);
    setRoutesLoading(true);
    const routes = await fetchMemberRoutes(member.user_id);
    setMemberRoutes(routes);
    setRoutesLoading(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-primary">Owner</Badge>;
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      default:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Team Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>No Team Found</CardTitle>
            <CardDescription>
              You're not currently part of a team. Team features are available with the Team subscription plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/pricing">View Team Plans</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMembers = members.filter(m => m.status === 'active').length;
  const pendingInvites = members.filter(m => m.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
          <p className="text-muted-foreground">Team Dashboard</p>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They'll receive an email with instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Admins can invite and remove members, and view all team routes.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              of {team.seat_count} seats used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvites}</div>
            <p className="text-xs text-muted-foreground">awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(0, team.seat_count - activeMembers)}</div>
            <p className="text-xs text-muted-foreground">remaining</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="routes" className="gap-2">
            <Route className="h-4 w-4" />
            Routes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team's members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {member.profile?.name || member.email}
                            </div>
                            {member.profile?.name && (
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        {member.joined_at
                          ? format(new Date(member.joined_at), 'MMM d, yyyy')
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {member.status === 'active' && member.user_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewRoutes(member)}
                              >
                                <Route className="h-4 w-4" />
                              </Button>
                            )}
                            {member.role !== 'owner' && (
                              <>
                                <Select
                                  value={member.role}
                                  onValueChange={(v) => updateMemberRole(member.id, v as 'admin' | 'member')}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will remove {member.email} from the team. They will lose access to team features.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => removeMember(member.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Team Routes</CardTitle>
              <CardDescription>
                {selectedMember 
                  ? `Viewing routes for ${selectedMember.profile?.name || selectedMember.email}`
                  : 'Select a team member to view their routes'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedMember ? (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Click the route icon next to a team member to view their saved routes.
                  </p>
                </div>
              ) : routesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : memberRoutes.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No routes found for this member.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Stops</TableHead>
                      <TableHead>Miles</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberRoutes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(route.route_date), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{route.route_name || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {route.stops_count}
                          </div>
                        </TableCell>
                        <TableCell>{route.total_miles?.toFixed(1) || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {route.total_hours?.toFixed(1) || '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={route.status === 'completed' ? 'default' : 'outline'}>
                            {route.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
