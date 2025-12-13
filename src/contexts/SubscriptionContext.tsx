import { createContext, useContext, ReactNode } from 'react';
import { useSubscription, SubscriptionState, PRICE_IDS, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';

interface SubscriptionContextType extends SubscriptionState {
  tier: string | null;
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string, quantity?: number) => Promise<any>;
  openCustomerPortal: () => Promise<any>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscription = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}

export { PRICE_IDS, SUBSCRIPTION_TIERS };
