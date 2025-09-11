'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutContentsProps {
  priceId: string;
  userEmail?: string;
  userId?: string;
}

export function CheckoutContents({ priceId, userEmail, userId }: CheckoutContentsProps) {
  const router = useRouter();
  const [paddle, setPaddle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Paddle redirect back to our site
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if this is a Paddle redirect back to our site
    if (urlParams.has('_ptxn')) {
      console.log('🔍 Detected Paddle redirect back to site - payment completed');
      // This is a successful payment - redirect to success page
      router.push('/checkout/success');
      return;
    }
  }, [router]);

  // Initialize Paddle.js and create checkout
  useEffect(() => {
    const initializePaddleCheckout = async () => {
      if (!priceId) {
        console.error('❌ No priceId provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Initializing Paddle.js checkout for priceId:', priceId);

        // Dynamic import to avoid SSR issues
        const { Paddle } = await import('@paddle/paddle-js');

        // Initialize Paddle with client token
        const paddleInstance = await Paddle.initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
          environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox',
          eventCallback: (event: any) => {
            console.log('🔍 Paddle event:', event.name, event.data);

            if (event.name === 'checkout.completed') {
              console.log('✅ Checkout completed successfully');
              router.push('/checkout/success');
            } else if (event.name === 'checkout.error') {
              console.error('❌ Checkout error:', event.data);
              // Handle error - could redirect to error page or show error message
            }
          }
        });

        console.log('✅ Paddle.js initialized successfully');
        setPaddle(paddleInstance);

        // Create checkout session
        const checkoutConfig = {
          items: [{ priceId: priceId, quantity: 1 }],
          settings: {
            displayMode: 'overlay', // or 'inline'
            variant: 'one-page',
            successUrl: `${window.location.origin}/checkout/success`,
            cancelUrl: `${window.location.origin}/pricing`,
            theme: 'light', // or 'dark'
            locale: 'en',
            showAddDiscounts: true,
          },
          customData: {
            user_id: userId,
          }
        };

        // Add customer information if we have user email
        if (userEmail) {
          checkoutConfig.customer = {
            email: userEmail
          };
        }

        console.log('🔍 Opening Paddle checkout with config:', JSON.stringify(checkoutConfig, null, 2));

        // Open the checkout
        await paddleInstance.Checkout.open(checkoutConfig);

        console.log('✅ Paddle checkout opened successfully');
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Failed to initialize Paddle checkout:', error);
        setIsLoading(false);
      }
    };

    initializePaddleCheckout();
  }, [priceId, userEmail, userId, router]);

  // Show loading while initializing Paddle
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-semibold mt-4">Setting up Secure Checkout...</h1>
          <p className="mt-2 text-gray-600">Please wait while we securely connect to our payment partner.</p>
        </div>
      </div>
    );
  }

  // This component will be replaced by Paddle's checkout overlay
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-gray-600">Paddle checkout should be loading above this content.</p>
        {process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' && (
          <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            🧪 This is a sandbox checkout for testing purposes
          </p>
        )}
      </div>
    </div>
  );
}
