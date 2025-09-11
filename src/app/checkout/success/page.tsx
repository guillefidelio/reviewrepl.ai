'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePaddleSubscription } from '@/lib/hooks/usePaddleSubscription';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { billingSummary, refreshSubscriptions } = usePaddleSubscription();

  useEffect(() => {
    // Refresh subscription data when the page loads
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  if (!user) {
    router.push('/supabase-login?redirect=/checkout/success');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg">
        <div className="px-8 py-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {billingSummary?.currentPlan || 'Your Plan'}!
          </h1>

          <p className="text-gray-600 mb-8">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>

          {/* Subscription Details */}
          {billingSummary && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Subscription Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{billingSummary.currentPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span className="font-medium">{billingSummary.creditsRemaining} available</span>
                </div>
                {billingSummary.nextBillingDate && (
                  <div className="flex justify-between">
                    <span>Next Billing:</span>
                    <span className="font-medium">
                      {new Date(billingSummary.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to Dashboard
              <svg className="ml-2 -mr-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard/profile"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Manage Subscription
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Questions about your subscription?{' '}
              <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:text-blue-500">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
