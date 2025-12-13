import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin, PromoCode } from '@/hooks/useAdmin';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminPromoCodes() {
  const { fetchPromoCodes, createPromoCode, togglePromoCode, deletePromoCode } = useAdmin();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'free_trial_days',
    discount_value: '',
    usage_limit: '',
    valid_until: '',
    applicable_tiers: [] as string[],
  });

  useEffect(() => {
    loadCodes();
  }, []);

  async function loadCodes() {
    setLoading(true);
    const data = await fetchPromoCodes();
    setCodes(data);
    setLoading(false);
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  }

  async function handleCreate() {
    if (!form.code || !form.discount_value) {
      toast.error('Please fill in required fields');
      return;
    }

    await createPromoCode({
      code: form.code.toUpperCase(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      valid_from: new Date().toISOString(),
      valid_until: form.valid_until || null,
      applicable_tiers: form.applicable_tiers.length > 0 ? form.applicable_tiers : null,
      is_active: true,
    });

    setCreateOpen(false);
    setForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      usage_limit: '',
      valid_until: '',
      applicable_tiers: [],
    });
    loadCodes();
  }

  async function handleToggle(id: string, currentState: boolean) {
    await togglePromoCode(id, !currentState);
    loadCodes();
  }

  async function handleDelete(id: string) {
    await deletePromoCode(id);
    loadCodes();
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Code copied');
  }

  const getDiscountDisplay = (code: PromoCode) => {
    switch (code.discount_type) {
      case 'percentage': return `${code.discount_value}% off`;
      case 'fixed': return `$${code.discount_value} off`;
      case 'free_trial_days': return `${code.discount_value} extra trial days`;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Promo Codes</h2>
            <p className="text-muted-foreground">Create and manage discount codes</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Promo Code</DialogTitle>
                <DialogDescription>
                  Create a new promotional discount code
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="SUMMER20"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="uppercase"
                    />
                    <Button variant="outline" onClick={generateCode}>Generate</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Summer sale discount"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount Type</label>
                    <Select
                      value={form.discount_type}
                      onValueChange={(v) => setForm({ ...form, discount_type: v as typeof form.discount_type })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="free_trial_days">Extra Trial Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      type="number"
                      placeholder={form.discount_type === 'percentage' ? '20' : '5'}
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Usage Limit (optional)</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={form.usage_limit}
                      onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valid Until (optional)</label>
                    <Input
                      type="date"
                      value={form.valid_until}
                      onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Applicable Tiers</label>
                  <div className="flex gap-4">
                    {['individual', 'team', 'enterprise'].map((tier) => (
                      <div key={tier} className="flex items-center gap-2">
                        <Checkbox
                          id={tier}
                          checked={form.applicable_tiers.includes(tier)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setForm({ ...form, applicable_tiers: [...form.applicable_tiers, tier] });
                            } else {
                              setForm({ ...form, applicable_tiers: form.applicable_tiers.filter(t => t !== tier) });
                            }
                          }}
                        />
                        <label htmlFor={tier} className="text-sm capitalize">{tier}</label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Leave empty for all tiers</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Code</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
            <CardDescription>{codes.length} code{codes.length !== 1 ? 's' : ''} total</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono bg-muted px-2 py-1 rounded text-sm">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyCode(code.code, code.id)}
                          >
                            {copiedId === code.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {code.description && (
                          <p className="text-xs text-muted-foreground mt-1">{code.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getDiscountDisplay(code)}</Badge>
                      </TableCell>
                      <TableCell>
                        {code.usage_limit 
                          ? `${code.usage_count} / ${code.usage_limit}` 
                          : `${code.usage_count} uses`
                        }
                      </TableCell>
                      <TableCell>
                        {code.valid_until 
                          ? format(new Date(code.valid_until), 'MMM d, yyyy')
                          : <span className="text-muted-foreground">No expiry</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={code.is_active}
                          onCheckedChange={() => handleToggle(code.id, code.is_active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete promo code?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the code "{code.code}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(code.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {codes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No promo codes yet. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
