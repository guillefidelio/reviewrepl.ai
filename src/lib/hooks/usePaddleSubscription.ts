'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import {
  getSubscriptions,
  getCustomerId,
  cancelSubscription,
  reactivateSubscription,
  updateSubscriptionPrice,
  createOrLinkCustomer,
  type SubscriptionResponse,
  type TransactionResponse,
  type ApiResponse
} from '@/lib/utils/paddle';
import { isErrorResponse } from '@/lib/utils/paddle/data-helpers';
import { useSupabaseCredits } from './useSupabaseCredits';
import {
  PricingTiers,
  getTierIdFromPriceId,
  getCreditsForTier
} from '@/lib/constants/pricing-tiers';

// Type for billing cycles
type BillingCycle = 'month' | 'year';
import type {
  SubscriptionWithMetadata,
  BillingSummary,
  SubscriptionStatus
} from '@/lib/types/paddle';
import type { SubscriptionData } from '@/lib/utils/paddle/subscription-manager';

export interface SubscriptionState {
  subscriptions: SubscriptionWithMetadata[];
  activeSubscription: SubscriptionWithMetadata | null;
  loading: boolean;
  error: string | null;
  customerId: string | null;
}

export interface SubscriptionHookReturn extends SubscriptionState {
  // Subscription management
  refreshSubscriptions: () => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
  reactivateSubscription: (subscriptionId: string) => Promise<boolean>;
  upgradeSubscription: (subscriptionId: string, newTierId: string, billingCycle: BillingCycle) => Promise<boolean>;

  // Customer management
  createCustomer: (email: string) => Promise<string | null>;

  // Billing summary
  billingSummary: BillingSummary | null;

  // Transaction history
  getTransactionHistory: (subscriptionId?: string) => Promise<TransactionResponse | null>;

  // Utility functions
  clearError: () => void;
  hasActiveSubscription: boolean;
  currentTierName: string;
  daysUntilRenewal: number | null;
}

export function usePaddleSubscription() {
  const { user } = useSupabaseAuth();
  const { balance, updateCredits } = useSupabaseCredits();

  const [state, setState] = useState<SubscriptionState>({
    subscriptions: [],
    activeSubscription: null,
    loading: true,
    error: null,
    customerId: null
  });

  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);

  /**
   * Enriches subscription data with metadata from pricing tiers
   */
  const enrichSubscriptionData = useCallback((subscription: SubscriptionData): SubscriptionWithMetadata => {
    const priceId = subscription.items?.[0]?.price?.id;
    const tierId = priceId ? getTierIdFromPriceId(priceId) : null;
    const tier = tierId ? PricingTiers.find(t => t.id === tierId) : null;

    const currentPeriodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    const now = new Date();
    const daysUntilRenewal = currentPeriodEnd ? Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Create a base object with snake_case fields matching SubscriptionData
    const baseSubscription = {
      subscription_id: subscription.id,
      customer_id: subscription.customerId,
      subscription_status: subscription.status as SubscriptionStatus,
      price_id: priceId || null,
      product_id: subscription.items?.[0]?.price?.productId || null,
      scheduled_change: subscription.scheduledChange?.effectiveAt || null,
      current_period_start: subscription.currentPeriodStart || null,
      current_period_end: subscription.currentPeriodEnd || null,
      cancel_at_period_end: subscription.cancelAtPeriodEnd || false,
      created_at: new Date().toISOString(), // Not available in API response
      updated_at: new Date().toISOString(), // Not available in API response
    };

    return {
      ...baseSubscription,
      tierName: tier?.name || 'Unknown Plan',
      creditsAllocated: tier ? getCreditsForTier(tier.id, 'month') : 0, // Default to monthly credits
      nextBillingDate: subscription.currentPeriodEnd || null,
      daysUntilRenewal
    };
  }, []);

  /**
   * Allocates credits based on subscription tier
   */
  const allocateCreditsForSubscription = useCallback(async (subscription: SubscriptionWithMetadata) => {
    if (!user || !subscription.price_id) return;

    try {
      const tierId = getTierIdFromPriceId(subscription.price_id);
      if (!tierId) return;

      const monthlyCredits = getCreditsForTier(tierId, 'month');
      const totalCredits = monthlyCredits; // For now, allocate monthly amount

      // Update user credits
      await updateCredits(monthlyCredits, totalCredits);

      console.log(`Allocated ${monthlyCredits} credits for subscription ${subscription.subscription_id}`);
    } catch (error) {
      console.error('Error allocating credits for subscription:', error);
    }
  }, [user, updateCredits]);

  /**
   * Updates billing summary based on subscription data
   */
  const updateBillingSummary = useCallback((
    activeSubscription: SubscriptionWithMetadata | null
  ) => {
    if (!activeSubscription) {
      setBillingSummary(null);
      return;
    }

    const summary: BillingSummary = {
      currentPlan: activeSubscription.tierName,
      creditsRemaining: balance.available,
      nextBillingDate: activeSubscription.nextBillingDate,
      monthlySpend: 0, // This would need to be calculated from transaction history
      currency: 'USD', // Default currency
      isYearlyBilling: false // This would need to be determined from the price ID
    };

    setBillingSummary(summary);
  }, [balance.available]);

  /**
   * Fetches subscriptions and updates state
   */
  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Get customer ID first
      const customerId = await getCustomerId();

      // Get subscriptions
      const subscriptionResult: ApiResponse<SubscriptionResponse> = await getSubscriptions();

      if (isErrorResponse(subscriptionResult)) {
        throw new Error(subscriptionResult.error);
      }

      const subscriptions = subscriptionResult.data?.data || [];
      const enrichedSubscriptions = subscriptions.map(enrichSubscriptionData);

      // Find active subscription
      const activeSubscription = enrichedSubscriptions.find(
        sub => sub.subscription_status === 'active'
      ) || null;

      // Allocate credits for active subscription
      if (activeSubscription) {
        await allocateCreditsForSubscription(activeSubscription);
      }

      // Update billing summary
      updateBillingSummary(activeSubscription);

      setState({
        subscriptions: enrichedSubscriptions,
        activeSubscription,
        loading: false,
        error: null,
        customerId
      });

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscriptions'
      }));
    }
  }, [user, enrichSubscriptionData, allocateCreditsForSubscription, updateBillingSummary]);

  /**
   * Cancels a subscription
   */
  const handleCancelSubscription = useCallback(async (subscriptionId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const result: ApiResponse<boolean> = await cancelSubscription(subscriptionId);

      if (isErrorResponse(result)) {
        throw new Error(result.error);
      }

      // Refresh subscriptions after cancellation
      await fetchSubscriptions();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [fetchSubscriptions]);

  /**
   * Reactivates a canceled subscription
   */
  const handleReactivateSubscription = useCallback(async (subscriptionId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const result: ApiResponse<boolean> = await reactivateSubscription(subscriptionId);

      if (isErrorResponse(result)) {
        throw new Error(result.error);
      }

      // Refresh subscriptions after reactivation
      await fetchSubscriptions();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reactivate subscription';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [fetchSubscriptions]);

  /**
   * Upgrades/downgrades subscription
   */
  const handleUpgradeSubscription = useCallback(async (
    subscriptionId: string,
    newTierId: string,
    billingCycle: BillingCycle
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const newTier = PricingTiers.find(t => t.id === newTierId);
      if (!newTier) {
        throw new Error('Invalid tier selected');
      }

      const newPriceId = newTier.priceId[billingCycle];
      if (!newPriceId) {
        throw new Error('Price not available for selected billing cycle');
      }

      const result: ApiResponse<boolean> = await updateSubscriptionPrice(subscriptionId, newPriceId);

      if (isErrorResponse(result)) {
        throw new Error(result.error);
      }

      // Refresh subscriptions after upgrade
      await fetchSubscriptions();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [fetchSubscriptions]);

  /**
   * Creates or links a customer
   */
  const handleCreateCustomer = useCallback(async (email: string): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const result: ApiResponse<string> = await createOrLinkCustomer(email);

      if (isErrorResponse(result)) {
        throw new Error(result.error);
      }

      const customerId = result.data!;
      setState(prev => ({ ...prev, customerId }));

      return customerId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, []);

  /**
   * Gets transaction history
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTransactionHistory = useCallback(async (_subscriptionId?: string): Promise<TransactionResponse | null> => {
    try {
      // This would need to be implemented in the subscription-manager
      // For now, return null
      return null;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return null;
    }
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch subscriptions on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setState({
        subscriptions: [],
        activeSubscription: null,
        loading: false,
        error: null,
        customerId: null
      });
      setBillingSummary(null);
    }
  }, [user, fetchSubscriptions]);

  // Computed values
  const hasActiveSubscription = Boolean(state.activeSubscription);
  const currentTierName = state.activeSubscription?.tierName || 'Free Plan';
  const daysUntilRenewal = state.activeSubscription?.daysUntilRenewal || null;

  return {
    // State
    ...state,
    billingSummary,

    // Methods
    refreshSubscriptions: fetchSubscriptions,
    cancelSubscription: handleCancelSubscription,
    reactivateSubscription: handleReactivateSubscription,
    upgradeSubscription: handleUpgradeSubscription,
    createCustomer: handleCreateCustomer,
    getTransactionHistory,
    clearError,

    // Computed values
    hasActiveSubscription,
    currentTierName,
    daysUntilRenewal
  };
}
