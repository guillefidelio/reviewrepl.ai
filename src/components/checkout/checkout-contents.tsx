'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useRouter, usePathname } from 'next/navigation';

interface CheckoutContentsProps {
  checkoutUrl: string;
}

export function CheckoutContents({ checkoutUrl }: CheckoutContentsProps) {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Handle Paddle redirect back to our site
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if this is a Paddle redirect back to our site
    if (urlParams.has('_ptxn')) {
      console.log('🔍 Detected Paddle redirect back to site');
      // This is a successful payment - redirect to success page
      router.push('/checkout/success');
      return;
    }
  }, [router]);

  // Handle authentication and redirect
  useEffect(() => {
    if (loading) return; // Still loading auth state

    if (!user) {
      // User is not authenticated - redirect to login with current path as redirect
      if (!hasRedirected) {
        console.log('🔍 Checkout: User not authenticated, redirecting to login');
        const redirectUrl = encodeURIComponent(pathname);
        router.push(`/supabase-login?redirect=${redirectUrl}`);
        setHasRedirected(true);
      }
      return;
    }

    // User is authenticated - proceed to checkout
    if (checkoutUrl && !hasRedirected) {
      console.log('🔍 Checkout: User authenticated, redirecting to Paddle');
      window.location.href = checkoutUrl;
      setHasRedirected(true);
    }
  }, [user, loading, checkoutUrl, router, pathname, hasRedirected]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-semibold mt-4">Checking Authentication...</h1>
          <p className="mt-2 text-gray-600">Please wait while we verify your session.</p>
        </div>
      </div>
    );
  }

  // Show redirect state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <h1 className="text-2xl font-semibold mt-4">
          {!user ? 'Redirecting to Login...' : 'Redirecting to Checkout...'}
        </h1>
        <p className="mt-2 text-gray-600">
          {!user
            ? 'Please sign in to continue with your purchase.'
            : 'Please wait while we securely transfer you to our payment partner.'
          }
        </p>
      </div>
    </div>
  );
}
