'use client';

import { Tier } from '@/lib/constants/pricing-tiers';

interface CheckoutSummaryProps {
  tier: Tier | undefined;
  priceId: string;
}

export function CheckoutSummary({ tier, priceId }: CheckoutSummaryProps) {
  if (!tier) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="text-sm text-gray-600">
          <p>Loading plan details...</p>
        </div>
      </div>
    );
  }

  const billingCycle = priceId.includes('year') ? 'year' : 'month';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

      <div className="space-y-4">
        {/* Plan Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{tier.icon}</div>
            <div>
              <h4 className="font-medium text-gray-900">{tier.name} Plan</h4>
                <p className="text-sm text-gray-600">
                  {billingCycle === 'month' ? tier.credits.monthly : tier.credits.yearly} credits per {billingCycle === 'month' ? 'month' : 'year'}
                </p>
            </div>
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Billing Cycle</span>
          <span className="font-medium">
            {billingCycle === 'year' ? 'Annual' : 'Monthly'}
          </span>
        </div>

        {/* Credits Included */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Credits Included</span>
          <span className="font-medium">
            {billingCycle === 'month' ? tier.credits.monthly : tier.credits.yearly} credits/{billingCycle === 'month' ? 'month' : 'year'}
          </span>
        </div>

        {/* Features */}
        <div className="border-t pt-4">
          <h5 className="font-medium text-gray-900 mb-2">What&apos;s Included:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Security Notice */}
        <div className="border-t pt-4">
          <div className="flex items-start text-sm text-gray-600">
            <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Secure Checkout</p>
              <p>Your payment information is encrypted and processed securely by Paddle.</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:text-blue-500">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}
