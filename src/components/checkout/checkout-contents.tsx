'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  initializePaddle,
  type Paddle,
  type Environments,
  type CheckoutEventsData
} from '@paddle/paddle-js';

// Extended checkout events data with name property
interface ExtendedCheckoutEventsData extends CheckoutEventsData {
  name: string;
}
import { getTierIdFromPriceId, PricingTiers } from '@/lib/constants/pricing-tiers';
import { createOrLinkCustomer } from '@/lib/utils/paddle';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { CheckoutHeader } from './checkout-header';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutSkeleton } from './checkout-skeleton';
import { validatePaddleConfig, PADDLE_CLIENT_TOKEN, PADDLE_ENVIRONMENT } from '@/lib/config';

interface CheckoutContentsProps {
  priceId: string;
  userEmail: string;
}

export function CheckoutContents({ priceId, userEmail }: CheckoutContentsProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Simple validation using centralized config
  const validateEnvironment = useCallback(() => {
    return validatePaddleConfig();
  }, []);

  // Get tier information from price ID
  const tierId = getTierIdFromPriceId(priceId);
  const tier = tierId ? PricingTiers.find(t => t.id === tierId) : null;

  // Handle Paddle checkout events
  const handleCheckoutEvents = useCallback(async (data: ExtendedCheckoutEventsData) => {
    try {
      if (data.name === 'checkout.completed') {
        console.log('Checkout completed:', data);

        // Create/link Paddle customer if not already done
        if (user?.email && !user.user_metadata?.paddle_customer_id) {
          await createOrLinkCustomer(user.email);
        }

        // Redirect to success page
        router.push('/checkout/success');
      } else if (data.name === 'checkout.error') {
        console.error('Checkout error:', data);
        setError('Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('Error handling checkout event:', err);
      setError('An error occurred during checkout.');
    }
  }, [user, router]);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Paddle checkout
  const initializeCheckout = useCallback(async () => {
    try {
      // Ensure we're in the browser and component is mounted
      if (typeof window === 'undefined' || !isMounted) {
        return;
      }

      // Validate environment variables first
      if (!validateEnvironment()) {
        setIsLoading(false);
        return;
      }

      // Debug: Log configuration status (safe for production)
      console.log('Paddle Debug - Configuration Check:', {
        clientToken: PADDLE_CLIENT_TOKEN ? 'SET' : 'NOT SET',
        environment: PADDLE_ENVIRONMENT || 'UNDEFINED',
        configValid: validatePaddleConfig()
      });

      const paddleInstance = await initializePaddle({
        token: PADDLE_CLIENT_TOKEN!,
        environment: (PADDLE_ENVIRONMENT as Environments) || 'sandbox',
        eventCallback: (event) => {
          if (event.data && event.name) {
            handleCheckoutEvents(event.data as ExtendedCheckoutEventsData);
          }
        },
        checkout: {
          settings: {
            variant: 'one-page',
            displayMode: 'inline',
            theme: 'light',
            allowLogout: !userEmail,
            frameTarget: 'paddle-checkout-frame',
            frameInitialHeight: 450,
            frameStyle: 'width: 100%; background-color: transparent; border: none',
            successUrl: `${window.location.origin}/checkout/success`,
          },
        },
      });

      if (paddleInstance && priceId) {
        setPaddle(paddleInstance);

        // Wait for DOM to be ready before opening checkout
        const checkAndOpenCheckout = (attempts = 0) => {
          const checkoutFrame = document.getElementById('paddle-checkout-frame');

          if (checkoutFrame) {
            console.log('✅ Checkout frame found, opening Paddle checkout...');
            try {
              // Open checkout
              paddleInstance.Checkout.open({
                ...(userEmail && { customer: { email: userEmail } }),
                items: [{ priceId: priceId, quantity: 1 }],
              });
              console.log('✅ Paddle checkout opened successfully');
            } catch (checkoutError) {
              console.error('❌ Error opening Paddle checkout:', checkoutError);
              setError('Failed to open checkout. Please refresh the page.');
            }
          } else {
            if (attempts < 10) { // Try up to 10 times
              console.log(`⏳ Checkout frame not ready, attempt ${attempts + 1}/10, retrying...`);
              setTimeout(() => checkAndOpenCheckout(attempts + 1), 200);
            } else {
              console.error('❌ Paddle checkout frame not found after 10 attempts');
              setError('Checkout container not ready. Please refresh the page.');
            }
          }
        };

        // Start checking immediately, then retry if needed
        setTimeout(checkAndOpenCheckout, 100);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize Paddle:', err);
      setError('Failed to load checkout. Please refresh the page.');
      setIsLoading(false);
    }
  }, [isMounted, validateEnvironment, handleCheckoutEvents, priceId, userEmail]);

  // Initialize Paddle when component mounts and no paddle instance exists
  useEffect(() => {
    if (!paddle && isMounted) {
      console.log('🚀 Starting Paddle initialization...');
      initializeCheckout();
    }
  }, [paddle, isMounted, initializeCheckout]);

  // Additional effect to ensure DOM is fully ready
  useEffect(() => {
    if (paddle && isMounted) {
      console.log('🔄 Paddle instance ready, ensuring DOM is prepared...');
      // Give extra time for DOM to settle
      const timer = setTimeout(() => {
        const frame = document.getElementById('paddle-checkout-frame');
        console.log('DOM check - Checkout frame element:', frame ? 'FOUND' : 'NOT FOUND');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [paddle, isMounted]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any Paddle instances on unmount
      if (paddle && typeof window !== 'undefined') {
        try {
          // Paddle cleanup if available
        } catch (err) {
          console.warn('Error during Paddle cleanup:', err);
        }
      }
    };
  }, [paddle]);

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Checkout Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <CheckoutHeader tier={tier || undefined} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Summary */}
          <div className="order-2 lg:order-1">
            <CheckoutSummary tier={tier || undefined} priceId={priceId} />
          </div>

          {/* Paddle Checkout Frame */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Your Purchase</h3>

              {/* Paddle Checkout Container */}
              <div
                id="paddle-checkout-frame"
                className="w-full min-h-[450px] rounded-md border border-gray-200 bg-white"
                ref={(el) => {
                  if (el && typeof window !== 'undefined') {
                    console.log('🎯 Checkout frame element rendered and available');
                  }
                }}
              />

              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>Secure checkout powered by Paddle</p>
                <p className="mt-1">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
