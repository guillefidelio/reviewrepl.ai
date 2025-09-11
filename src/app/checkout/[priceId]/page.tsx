import { getPaddleInstance } from '@/lib/utils/paddle/get-paddle-instance';
import { CheckoutContents } from '@/components/checkout/checkout-contents';
import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Extended type to include success_url and cancel_url (Paddle API uses snake_case)
interface ExtendedTransactionRequest {
  items: Array<{ priceId: string; quantity: number }>;
  customerId?: string;
  customData?: Record<string, unknown>;
  success_url?: string;
  cancel_url?: string;
}

interface PathParams {
  priceId: string;
}

export default async function CheckoutPage({ params }: { params: Promise<PathParams> }) {
  const { priceId } = await params;

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

  // ✅ Step 1: Perform the auth check OUTSIDE the try block
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Not needed for read-only auth check
        },
      },
    }
  );

    const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.log('❌ Checkout: User authentication failed, redirecting to login');
    return redirect('/supabase-login?redirect=' + encodeURIComponent(`/checkout/${priceId}`));
  }

  const user = userData.user;
  console.log('✅ Checkout: User authenticated, proceeding to Paddle:', { userId: user.id });

  try {
    // 2. Get server-side Paddle instance
    const paddle = getPaddleInstance();

    // 3. Create transaction to get checkout URL
    const transactionRequest: ExtendedTransactionRequest = {
      items: [{ priceId: priceId, quantity: 1 }],
      // Set redirect URLs for after payment (Paddle API expects snake_case)
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`
    };

    if (user) {
      transactionRequest.customerId = user.user_metadata?.paddle_customer_id;
      transactionRequest.customData = { user_id: user.id };
    }

    const transaction = await paddle.transactions.create(transactionRequest);

    if (!transaction.checkout?.url) {
      console.error('No checkout URL returned from Paddle');
      return notFound();
    }

    console.log('✅ Paddle checkout URL created:', transaction.checkout.url);

    // 4. Pass the checkout URL to client component
    // Client component will redirect to Paddle immediately
    return <CheckoutContents checkoutUrl={transaction.checkout.url} />;

  } catch (error) {
    console.error('❌ Failed to create Paddle transaction:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-4">There was an error preparing your checkout.</p>
          <p className="text-sm text-gray-500">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }
}
