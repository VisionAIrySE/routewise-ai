import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { Gift, Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReferralCodeCard() {
  const { data: profile, isLoading } = useProfile();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!profile?.referral_code) return;
    
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (!profile?.referral_code) return;
    
    const shareText = `Join Inspector Route AI and get 2 weeks free with my referral code: ${profile.referral_code}`;
    const shareUrl = `${window.location.origin}/signup?ref=${profile.referral_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspector Route AI Referral',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Share link copied!');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your Referral Code</CardTitle>
        </div>
        <CardDescription>
          Share your code to give friends 2 weeks free — you get 2 weeks added too!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="text-lg font-mono px-4 py-2 bg-muted/50 border-primary/30"
          >
            {profile?.referral_code || 'No code'}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
