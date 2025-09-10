'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PricingTiers } from '@/lib/constants/pricing-tiers';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { Button } from '@/components/ui/button';

type BillingCycle = 'month' | 'year';

export function PricingCards() {
  const { user } = useSupabaseAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('month');

  const handleSubscribe = (tierId: string) => {
    const tier = PricingTiers.find(t => t.id === tierId);
    if (!tier) return;

    const priceId = tier.priceId[billingCycle];
    if (priceId) {
      // Redirect to checkout with the price ID
      window.location.href = `/checkout/${priceId}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Select the perfect plan for your AI review generation needs
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div className="relative bg-white rounded-lg p-1 flex">
            <button
              onClick={() => setBillingCycle('month')}
              className={`relative px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('year')}
              className={`relative px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
              tier.featured
                ? 'border-blue-500 scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Featured Badge */}
            {tier.featured && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-gray-600 mt-2">{tier.description}</p>
              </div>

              {/* Credits */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {billingCycle === 'month' ? tier.credits.monthly : tier.credits.yearly}
                </div>
                <div className="text-gray-600">
                  credits per {billingCycle === 'month' ? 'month' : 'year'}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleSubscribe(tier.id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  tier.featured
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
                disabled={!tier.priceId[billingCycle]}
              >
                {!tier.priceId[billingCycle] ? 'Coming Soon' : 'Subscribe Now'}
              </Button>

              {/* Login Required */}
              {!user && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  <Link href="/auth" className="text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>{' '}
                  to subscribe
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-gray-600">
          Questions about our plans?{' '}
          <Link href="/contact" className="text-blue-600 hover:text-blue-500">
            Contact our sales team
          </Link>
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>30-day money back guarantee</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure payment processing</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
