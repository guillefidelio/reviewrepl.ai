'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutContentsProps {
  checkoutUrl: string;
}

export function CheckoutContents({ checkoutUrl }: CheckoutContentsProps) {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Handle Paddle redirect back to our site (if user manually navigates back)
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

  // Redirect to Paddle checkout immediately when component mounts
  useEffect(() => {
    if (checkoutUrl && !hasRedirected) {
      console.log('🔍 Redirecting to Paddle checkout:', checkoutUrl);
      window.location.href = checkoutUrl;
      setHasRedirected(true);
    }
  }, [checkoutUrl, hasRedirected]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <h1 className="text-2xl font-semibold mt-4">Redirecting to Checkout...</h1>
        <p className="mt-2 text-gray-600">Please wait while we securely transfer you to our payment partner.</p>
      </div>
    </div>
  );
}
