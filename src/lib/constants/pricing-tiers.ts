/**
 * Pricing tier configuration for Paddle integration
 * Maps subscription tiers to Paddle price IDs
 */

export interface Tier {
  id: 'starter' | 'pro' | 'advanced';
  name: string;
  description: string;
  features: string[];
  featured: boolean;
  icon: string;
  priceId: Record<string, string>; // { month: 'price_id', year: 'price_id' }
  credits: {
    monthly: number;
    yearly: number;
  };
}

/**
 * Pricing tiers configuration
 * IMPORTANT: Replace the price IDs below with your actual Paddle price IDs
 * You can get these from your Paddle dashboard after creating products and prices
 */
export const PricingTiers: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started with AI-powered reviews',
    icon: '🚀',
    featured: false,
    priceId: {
      // Replace with your actual Paddle price IDs
      month: 'pri_01k4tdjr8f4hg5wnaew0mz2jqa',
      year: 'pri_01k4tdkj0e1e0kbg7gsaynjg20'
    },
    credits: {
      monthly: 100,
      yearly: 1200 // 100 credits/month * 12
    },
    features: [
      '100 AI-generated reviews per month',
      'Basic customization options',
      'Email support',
      'Standard response templates',
      'Basic analytics dashboard'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    icon: '⭐',
    featured: true,
    priceId: {
      // Replace with your actual Paddle price IDs
      month: 'pri_01k37390w7cg3smehx5td0b7gk',
      year: 'pri_01k4tdgn9f6c9d20pxjycdjsye'
    },
    credits: {
      monthly: 500,
      yearly: 6000 // 500 credits/month * 12
    },
    features: [
      '500 AI-generated reviews per month',
      'Advanced customization',
      'Priority email support',
      'Custom response templates',
      'Advanced analytics',
      'Multi-location support',
      'Team collaboration tools'
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Enterprise-grade solution for large businesses',
    icon: '🏆',
    featured: false,
    priceId: {
      // Replace with your actual Paddle price IDs
      month: 'pri_01k373b1rst3zhhwfzjhbnhdf4',
      year: 'pri_01k4tdfgm8jz9vm636bty6y1kw'
    },
    credits: {
      monthly: 2000,
      yearly: 24000 // 2000 credits/month * 12
    },
    features: [
      '2000 AI-generated reviews per month',
      'Full customization suite',
      'Dedicated account manager',
      'White-label options',
      'Advanced API access',
      'Custom integrations',
      '24/7 phone support',
      'Enterprise security features'
    ]
  }
];

/**
 * Utility functions for working with pricing tiers
 */

/**
 * Gets a pricing tier by ID
 */
export function getTierById(id: string): Tier | undefined {
  return PricingTiers.find(tier => tier.id === id);
}

/**
 * Gets the price ID for a specific tier and billing cycle
 */
export function getPriceId(tierId: string, billingCycle: 'month' | 'year'): string | undefined {
  const tier = getTierById(tierId);
  return tier?.priceId[billingCycle];
}

/**
 * Gets credits for a specific tier and billing cycle
 */
export function getCreditsForTier(tierId: string, billingCycle: 'month' | 'year'): number {
  const tier = getTierById(tierId);
  if (!tier) return 0;

  return billingCycle === 'month' ? tier.credits.monthly : tier.credits.yearly;
}

/**
 * Gets all available billing cycles
 */
export function getBillingCycles(): Array<'month' | 'year'> {
  return ['month', 'year'];
}

/**
 * Calculates savings percentage for yearly billing
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyYearlyTotal = monthlyPrice * 12;
  const savings = monthlyYearlyTotal - yearlyPrice;
  return Math.round((savings / monthlyYearlyTotal) * 100);
}

/**
 * Gets the featured pricing tier
 */
export function getFeaturedTier(): Tier | undefined {
  return PricingTiers.find(tier => tier.featured);
}

/**
 * Gets tier ID from price ID
 */
export function getTierIdFromPriceId(priceId: string): string | undefined {
  for (const tier of PricingTiers) {
    if (Object.values(tier.priceId).includes(priceId)) {
      return tier.id;
    }
  }
  return undefined;
}
