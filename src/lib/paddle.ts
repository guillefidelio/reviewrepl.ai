// Paddle v2 SDK configuration for modern Paddle Billing API
// Configured to use redirect mode (new tab/window) instead of iframe

// Product and pricing configuration
export const PADDLE_CONFIG = {
  // Environment configuration
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  
  // Paddle client token (from Paddle dashboard → Developers → Authentication)
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
  
  // Webhook configuration
  webhook: {
    secret: process.env.PADDLE_WEBHOOK_SECRET || '',
  },
  
  // Product and pricing configuration
  products: {
    free: {
      id: 'free',
      name: 'Free Plan',
      description: 'Perfect for getting started',
      credits: 10,
      price: 0,
      currency: 'USD',
      interval: 'month' as const,
      isFree: true,
      paddlePriceId: '', // No Paddle price ID for free plan
    },
    enthusiast: {
      id: 'enthusiast',
      name: 'Enthusiast Plan',
      description: 'Great for regular users',
      credits: 50,
      price: 29.00,
      currency: 'USD',
      interval: 'month' as const,
      isFree: false,
      paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_ENTHUSIAST_PRICE_ID || '',
    },
    pro: {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Perfect for power users',
      credits: 150,
      price: 49.00,
      currency: 'USD',
      interval: 'month' as const,
      isFree: false,
      paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || '',
    },
  },
};

// Get product by ID
export function getProductById(productId: string) {
  return Object.values(PADDLE_CONFIG.products).find(product => 
    product.id === productId || product.paddlePriceId === productId
  );
}

// Get product by Paddle price ID
export function getProductByPaddlePriceId(paddlePriceId: string) {
  return Object.values(PADDLE_CONFIG.products).find(product => 
    product.paddlePriceId === paddlePriceId
  );
}

// Get subscription plan by name
export function getSubscriptionPlan(planName: keyof typeof PADDLE_CONFIG.products) {
  return PADDLE_CONFIG.products[planName];
}

// Utility function to format prices
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Validate webhook signature (for server-side use)
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This will be implemented with proper webhook validation
  // For now, returning true in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // TODO: Implement proper webhook signature validation
  // This should use crypto.createHmac to verify the signature
  return false;
}
