import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { paddleService } from '@/lib/services/paddleService';
import { 
  PaddleSubscription, 
  PaddleTransaction, 
  PaddleCheckoutConfig,
  PaddleCheckoutResponse 
} from '@/lib/types';
import { PADDLE_CONFIG, formatPrice } from '@/lib/paddle';

export interface PaddleHookReturn {
  // State
  subscription: PaddleSubscription | null;
  transactions: PaddleTransaction[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createSubscription: (planName: keyof typeof PADDLE_CONFIG.products) => Promise<PaddleCheckoutResponse | null>;
  cancelSubscription: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Utility functions
  getCurrentPlan: () => string | null;
  getNextBillingDate: () => Date | null;
  getRemainingCredits: () => number;
  isSubscriptionActive: () => boolean;
}

export function usePaddle(): PaddleHookReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<PaddleSubscription | null>(null);
  const [transactions, setTransactions] = useState<PaddleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's Paddle data
  const loadPaddleData = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      setSubscription(null);
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load subscription and transactions in parallel
      const [subscriptionData, transactionsData] = await Promise.all([
        paddleService.getUserSubscription(user.uid),
        paddleService.getUserTransactions(user.uid, 20),
      ]);

      setSubscription(subscriptionData);
      setTransactions(transactionsData);
    } catch (err) {
      // Don't show Firebase errors for unauthenticated users
      if (err instanceof Error && err.message.includes('permissions')) {
        console.log('User not authenticated, skipping Paddle data load');
        setSubscription(null);
        setTransactions([]);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load payment data';
        setError(errorMessage);
        console.error('Error loading Paddle data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadPaddleData();
  }, [loadPaddleData]);

  // Create subscription checkout
  const createSubscription = useCallback(async (
    planName: keyof typeof PADDLE_CONFIG.products
  ): Promise<PaddleCheckoutResponse | null> => {
    if (!user?.uid || !user.email) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);
      const plan = PADDLE_CONFIG.products[planName];
      
      // Handle free plan differently
      if (plan.isFree) {
        // For free plan, we can directly allocate credits without going through Paddle
        try {
          await paddleService.allocateCreditsToUser(user.uid, plan.credits, 'bonus');
          // Redirect to success page
          const baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || window.location.origin;
          window.location.href = `${baseUrl}/dashboard?success=true&plan=free`;
          return null;
        } catch (err) {
          setError('Failed to activate free plan');
          return null;
        }
      }
      
      if (!plan.paddlePriceId) {
        setError(`Plan not configured. Paddle price ID for ${planName} is missing. Please check your environment variables.`);
        console.error('Missing Paddle price ID for plan:', planName, plan);
        return null;
      }

      // Use ngrok URL for development, fallback to localhost
      const baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || window.location.origin;
      
      const checkoutConfig: PaddleCheckoutConfig = {
        priceId: plan.paddlePriceId,
        customerEmail: user.email,
        customerName: user.displayName || undefined,
        successUrl: `${baseUrl}/dashboard?success=true`,
        cancelUrl: `${baseUrl}/dashboard?canceled=true`,
        customData: {
          user_id: user.uid,
          plan_type: planName,
          source: 'subscription',
        },
      };

      console.log('Creating Paddle checkout with config:', checkoutConfig);
      const response = await paddleService.createCheckout(checkoutConfig);
      console.log('Paddle checkout response:', response);
      
      // Paddle checkout opens in a new tab/window (redirect mode)
      // This provides a better user experience and avoids iframe issues
      // The user will be redirected to Paddle's secure checkout page
      if (response?.checkoutId) {
        return response;
      } else {
        setError('Failed to create checkout');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription checkout';
      setError(errorMessage);
      console.error('Error creating subscription checkout:', err);
      return null;
    }
  }, [user?.uid, user?.email, user?.displayName]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!subscription?.id) {
      setError('No active subscription to cancel');
      return false;
    }

    try {
      setError(null);
      
      // In a real implementation, you would call Paddle's API to cancel the subscription
      // For now, we'll just update the local state
      setSubscription(prev => prev ? { ...prev, status: 'canceled' } : null);
      
      // You would also want to call your backend to handle the cancellation
      // await paddleService.cancelSubscription(subscription.id);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      console.error('Error canceling subscription:', err);
      return false;
    }
  }, [subscription?.id]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadPaddleData();
  }, [loadPaddleData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get current plan name
  const getCurrentPlan = useCallback((): string | null => {
    if (!subscription) return null;
    
    // Map plan type to display name
    const planNames = {
      free: 'Free',
      enthusiast: 'Enthusiast',
      pro: 'Pro',
    };
    
    return planNames[subscription.planType] || subscription.planType;
  }, [subscription]);

  // Get next billing date
  const getNextBillingDate = useCallback((): Date | null => {
    if (!subscription?.nextBilledAt) return null;
    return subscription.nextBilledAt;
  }, [subscription?.nextBilledAt]);

  // Get remaining credits (this would come from your credits hook)
  const getRemainingCredits = useCallback((): number => {
    // This should integrate with your existing credits system
    // For now, returning a placeholder
    return subscription?.monthlyCredits || 0;
  }, [subscription?.monthlyCredits]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback((): boolean => {
    return subscription?.status === 'active';
  }, [subscription?.status]);

  return {
    // State
    subscription,
    transactions,
    loading,
    error,
    
    // Actions
    createSubscription,
    cancelSubscription,
    refreshData,
    clearError,
    
    // Utility functions
    getCurrentPlan,
    getNextBillingDate,
    getRemainingCredits,
    isSubscriptionActive,
  };
}

// Utility hook for getting plan information
export function usePaddlePlans() {
  const getPlanInfo = useCallback((planName: keyof typeof PADDLE_CONFIG.products) => {
    const plan = PADDLE_CONFIG.products[planName];
    if (!plan) return null;

    return {
      ...plan,
      formattedPrice: formatPrice(plan.price, plan.currency),
      formattedPricePerCredit: formatPrice(plan.price / plan.credits, plan.currency),
    };
  }, []);

  return {
    getPlanInfo,
    plans: PADDLE_CONFIG.products,
  };
}
