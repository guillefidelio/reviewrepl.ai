'use client';

import { useEffect } from 'react';

interface CheckoutContentsProps {
  checkoutUrl: string;
}

export function CheckoutContents({ checkoutUrl }: CheckoutContentsProps) {
  // Redirect the user as soon as the component mounts
  useEffect(() => {
    if (checkoutUrl) {
      // Use window.location.href for a full page redirect
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  // Render a loading state while the redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Redirecting to Checkout...</h1>
        <p className="mt-2 text-gray-600">Please wait while we securely transfer you to our payment partner.</p>
        {/* You can add a spinner component here */}
      </div>
    </div>
  );
}
