/**
 * TypeScript types for Paddle integration
 */

// Re-export common Paddle types
export type {
  Price,
  Customer,
  Subscription,
  Transaction,
  EventEntity,
  EventName,
} from '@paddle/paddle-node-sdk';

// Custom types for our application

/**
 * Paddle environment type
 */
export type PaddleEnvironment = 'sandbox' | 'production';

/**
 * Billing cycle type
 */
export type BillingCycle = 'month' | 'year';

/**
 * Subscription status type
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'paused'
  | 'trialing';

/**
 * Customer data from our database
 */
export interface CustomerData {
  customer_id: string;
  user_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription data from our database
 */
export interface SubscriptionData {
  subscription_id: string;
  customer_id: string;
  subscription_status: SubscriptionStatus;
  price_id: string | null;
  product_id: string | null;
  scheduled_change: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Price preview data for frontend
 */
export interface PricePreview {
  currency: string;
  amount: number;
  formattedAmount: string;
  billingCycle: string;
}

/**
 * Paddle prices grouped by currency and billing cycle
 */
export interface PaddlePrices {
  [key: string]: PricePreview;
}

/**
 * Checkout session data
 */
export interface CheckoutSession {
  id: string;
  url: string;
  customerId: string;
  priceId: string;
  status: 'pending' | 'completed' | 'expired' | 'canceled';
}

/**
 * Webhook event data structure
 */
export interface WebhookEventData {
  id: string;
  eventType: string;
  data: any;
  occurredAt: string;
}

/**
 * Transaction data with formatted amounts
 */
export interface TransactionData {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  status: string;
  createdAt: string;
  billingPeriod: {
    startsAt: string;
    endsAt: string;
  } | null;
}

/**
 * Subscription with additional metadata
 */
export interface SubscriptionWithMetadata extends SubscriptionData {
  tierName: string;
  creditsAllocated: number;
  nextBillingDate: string | null;
  daysUntilRenewal: number | null;
}

/**
 * Customer with subscription data
 */
export interface CustomerWithSubscriptions extends CustomerData {
  subscriptions: SubscriptionWithMetadata[];
  activeSubscription: SubscriptionWithMetadata | null;
}

/**
 * Billing history item
 */
export interface BillingHistoryItem {
  id: string;
  type: 'subscription' | 'transaction' | 'credit_purchase';
  description: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  status: string;
  date: string;
}

/**
 * Dashboard billing summary
 */
export interface BillingSummary {
  currentPlan: string;
  creditsRemaining: number;
  nextBillingDate: string | null;
  monthlySpend: number;
  currency: string;
  isYearlyBilling: boolean;
}

/**
 * Paddle configuration
 */
export interface PaddleConfig {
  environment: PaddleEnvironment;
  clientToken: string;
  apiKey: string;
  webhookSecret: string;
}

/**
 * Checkout options for Paddle.js
 */
export interface CheckoutOptions {
  token: string;
  environment: PaddleEnvironment;
  eventCallback?: (event: any) => void;
  checkout?: {
    settings?: {
      variant?: 'one-page' | 'multi-page';
      displayMode?: 'inline' | 'overlay';
      theme?: 'light' | 'dark';
      allowLogout?: boolean;
      frameTarget?: string;
      frameInitialHeight?: number;
      frameStyle?: string;
      successUrl?: string;
      showAddDiscounts?: boolean;
      showAddTaxId?: boolean;
    };
  };
}

/**
 * Price preview request parameters
 */
export interface PricePreviewParams {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  address?: {
    countryCode: string;
  };
  customer?: {
    id: string;
    email?: string;
  };
  discountId?: string;
}

/**
 * API Response wrapper for Paddle operations
 */
export interface PaddleApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Subscription management actions
 */
export type SubscriptionAction =
  | 'cancel'
  | 'reactivate'
  | 'upgrade'
  | 'downgrade'
  | 'pause'
  | 'resume';

/**
 * Credit allocation based on subscription tier
 */
export interface CreditAllocation {
  tierId: string;
  billingCycle: BillingCycle;
  creditsPerMonth: number;
  totalCredits: number;
  resetDate: string;
}

/**
 * Paddle webhook verification result
 */
export interface WebhookVerificationResult {
  isValid: boolean;
  eventData?: any;
  error?: string;
}
