import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, XCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
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

export function SubscriptionManagement() {
  const { subscribed, tier, subscriptionEnd, openCustomerPortal, loading } = useSubscription();
  const [isOpening, setIsOpening] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsOpening(true);
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsOpening(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsOpening(true);
      // Opens Stripe customer portal where user can cancel
      await openCustomerPortal();
      toast.info('Cancellation', {
        description: 'Use the Stripe portal to cancel your subscription. It will remain active until the end of your billing cycle.',
      });
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open cancellation portal');
    } finally {
      setIsOpening(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Special tiers don't show cancellation
  const isSpecialTier = tier && ['lifetime', 'founder', 'owner'].includes(tier);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your Inspector Route AI subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={subscribed ? 'default' : 'secondary'}>
            {subscribed ? (tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Active') : 'Inactive'}
          </Badge>
        </div>

        {subscriptionEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Renews</span>
            <span className="text-sm">
              {new Date(subscriptionEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageSubscription}
            disabled={isOpening || !subscribed}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>

          {subscribed && !isSpecialTier && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isOpening}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until the end of your current billing cycle. 
                    After that, you'll lose access to Inspector Route AI features.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Continue to Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}