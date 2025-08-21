// Paddle v2 SDK types for modern Paddle Billing API

// Paddle v2 SDK global types
declare global {
  interface Window {
    Paddle: PaddleStatic;
  }
}

// Paddle v2 SDK namespace
export interface PaddleEnvironment {
  set(environment: 'sandbox' | 'production'): void;
}

export interface PaddleInitialize {
  (config: { token: string }): void;
}

export interface PaddleCheckoutOptions {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  customer: {
    email: string;
    name?: string;
  };
  customData?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaddleCheckout {
  open(options: PaddleCheckoutOptions): Promise<void>;
}

export interface PaddleStatic {
  Environment: PaddleEnvironment;
  Initialize: PaddleInitialize;
  Checkout: PaddleCheckout;
}

// Product and pricing configuration
export interface PaddleProduct {
  id: string;
  name: string;
  description?: string;
  credits: number;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  isFree: boolean;
  paddlePriceId: string; // The actual Paddle price ID (pri_xxx)
}

export interface PaddleSubscription {
  id: string;
  userId: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  quantity: number;
  currency: string;
  unitPrice: number;
  totalPrice: number;
  billingCycle: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  firstBilledAt?: Date;
  nextBilledAt?: Date;
  pausedAt?: Date;
  canceledAt?: Date;
  collectionMode: 'automatic' | 'manual';
  customData?: Record<string, unknown>;
  
  // Our custom fields
  planType: 'free' | 'enthusiast' | 'pro';
  monthlyCredits: number;
  paddleProductId: string;
}

export interface PaddleTransaction {
  id: string;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  invoiceId?: string;
  status: 'draft' | 'ready' | 'billed' | 'paid' | 'completed' | 'canceled' | 'past_due';
  currency: string;
  total: number;
  subtotal: number;
  tax: number;
  collectionMode: 'automatic' | 'manual';
  createdAt: Date;
  updatedAt: Date;
  billedAt?: Date;
  paidAt?: Date;
  customData?: Record<string, unknown>;
  
  // Our custom fields
  creditsAllocated: number;
  transactionType: 'subscription' | 'one_time_purchase' | 'credit_package';
}

export interface PaddleCustomer {
  id: string;
  userId: string;
  email: string;
  name?: string;
  marketingConsent: boolean;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  customData?: Record<string, unknown>;
}

// Paddle checkout options (for the actual API call)
export interface PaddleCheckoutOptions {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  customer: {
    email: string;
    name?: string;
  };
  customData?: string;
  settings: {
    displayMode: 'overlay' | 'redirect';
    theme?: 'light' | 'dark';
    locale?: string;
    successUrl: string;
    cancelUrl: string;
    allowLogout?: boolean;
  };
  // Legacy support - these are now moved to settings
  successUrl?: string;
  cancelUrl?: string;
}

// Checkout configuration
export interface PaddleCheckoutConfig {
  priceId: string; // Paddle price ID (pri_xxx)
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  customData?: Record<string, unknown>;
}

// Checkout response
export interface PaddleCheckoutResponse {
  checkoutId: string;
  status: 'pending' | 'completed' | 'failed';
}

// Webhook event types
export interface PaddleWebhookEvent {
  event_type: string;
  event_id: string;
  occurred_at: string;
  data: unknown;
}

export type PaddleWebhookEventType = PaddleWebhookEvent;

// Webhook processing result
export interface WebhookProcessingResult {
  success: boolean;
  message: string;
  processedAt: Date;
  eventId: string;
  eventType: string;
  errors?: string[];
}

// Paddle API error response
export interface PaddleApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
