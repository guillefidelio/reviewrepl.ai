'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckoutContents } from '@/components/checkout/checkout-contents';
import { CheckoutSkeleton } from '@/components/checkout/checkout-skeleton';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useSupabaseAuth();

  const priceId = params.priceId as string;
  const userEmail = user?.email || searchParams.get('email') || '';

  if (!priceId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Price ID</h1>
          <p className="text-gray-600">Please select a valid pricing plan to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContents
        priceId={priceId}
        userEmail={userEmail}
      />
    </Suspense>
  );
}
