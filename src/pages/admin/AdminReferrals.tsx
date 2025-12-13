import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin, ReferralCredit } from '@/hooks/useAdmin';
import { Gift, DollarSign, Clock, CheckCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReferrals() {
  const { fetchReferralCredits, updateReferralStatus } = useAdmin();
  const [credits, setCredits] = useState<ReferralCredit[]>([]);
  const [filteredCredits, setFilteredCredits] = useState<ReferralCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCredits();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredCredits(credits);
    } else {
      setFilteredCredits(credits.filter(c => c.status === statusFilter));
    }
  }, [statusFilter, credits]);

  async function loadCredits() {
    setLoading(true);
    const data = await fetchReferralCredits();
    setCredits(data);
    setFilteredCredits(data);
    setLoading(false);
  }

  async function handleStatusChange(id: string, newStatus: 'applied' | 'paid_out') {
    await updateReferralStatus(id, newStatus);
    loadCredits();
  }

  // Calculate stats
  const pendingCount = credits.filter(c => c.status === 'pending').length;
  const appliedCount = credits.filter(c => c.status === 'applied').length;
  const pendingCash = credits
    .filter(c => c.status === 'pending' && c.credit_type === 'cash')
    .reduce((sum, c) => sum + c.credit_amount, 0);
  const pendingWeeks = credits
    .filter(c => c.status === 'pending' && c.credit_type === 'free_weeks')
    .reduce((sum, c) => sum + c.credit_amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case 'applied': return <Badge className="bg-green-500">Applied</Badge>;
      case 'paid_out': return <Badge className="bg-blue-500">Paid Out</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCreditTypeBadge = (type: string) => {
    switch (type) {
      case 'free_weeks': return <Badge variant="secondary">Free Weeks</Badge>;
      case 'cash': return <Badge className="bg-primary">Cash</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Referrals</h2>
          <p className="text-muted-foreground">Manage referral credits and payouts</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{credits.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Credits</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground">{appliedCount} applied</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Weeks</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingWeeks}</div>
                  <p className="text-xs text-muted-foreground">Free weeks to apply</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cash Owed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${pendingCash.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">To company referrers</p>
                </CardContent>
              </Card>
            </div>

            {/* Referrals Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Referral Credits</CardTitle>
                  <CardDescription>{filteredCredits.length} referral{filteredCredits.length !== 1 ? 's' : ''}</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="paid_out">Paid Out</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCredits.map((credit) => (
                      <TableRow key={credit.id}>
                        <TableCell>{getCreditTypeBadge(credit.credit_type)}</TableCell>
                        <TableCell>
                          {credit.credit_type === 'cash' 
                            ? `$${credit.credit_amount.toFixed(2)}`
                            : `${credit.credit_amount} weeks`
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(credit.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(credit.created_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {credit.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              {credit.credit_type === 'free_weeks' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(credit.id, 'applied')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Apply
                                </Button>
                              )}
                              {credit.credit_type === 'cash' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(credit.id, 'paid_out')}
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          )}
                          {credit.status !== 'pending' && (
                            <span className="text-muted-foreground text-sm">
                              {credit.applied_at && `Applied ${format(new Date(credit.applied_at), 'MMM d')}`}
                              {credit.paid_out_at && `Paid ${format(new Date(credit.paid_out_at), 'MMM d')}`}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCredits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No referral credits found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
