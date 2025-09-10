'use client';

import { Tier } from '@/lib/constants/pricing-tiers';

interface CheckoutHeaderProps {
  tier: Tier | undefined;
}

export function CheckoutHeader({ tier }: CheckoutHeaderProps) {
  if (!tier) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
        <p className="mt-2 text-lg text-gray-600">Secure checkout for your subscription</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="text-4xl">{tier.icon}</div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Subscribe to {tier.name}</h1>
      <p className="mt-2 text-lg text-gray-600">{tier.description}</p>

      {/* Features */}
      <div className="mt-6 max-w-md mx-auto">
        <ul className="text-sm text-gray-600 space-y-2">
          {tier.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
