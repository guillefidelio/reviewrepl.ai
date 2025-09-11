import { getPaddleInstance } from '@/lib/utils/paddle/get-paddle-instance';
import { CheckoutContents } from '@/components/checkout/checkout-contents';
import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('🔍 Direct server auth check:', {
    hasSession: !!sessionData.session,
    hasUser: !!sessionData.session?.user,
    sessionError: sessionError?.message,
    userId: sessionData.session?.user?.id,
    userEmail: sessionData.session?.user?.email,
    cookiesCount: cookieStore.getAll().length,
    cookieNames: cookieStore.getAll().map(c => c.name)
  });

  if (!sessionData.session?.user) {
    console.log('❌ Checkout: No user session found, redirecting to login');
    return redirect('/supabase-login?redirect=' + encodeURIComponent(`/checkout/${priceId}`));
  }

  const user = sessionData.session.user;
  console.log('✅ Checkout: User authenticated, proceeding to Paddle:', { userId: user.id });

  try {
    // 2. Get server-side Paddle instance
    const paddle = getPaddleInstance();

    // 3. Create transaction to get checkout URL
    const transaction = await paddle.transactions.create({
      items: [{ priceId: priceId, quantity: 1 }],
      ...(user && {
        customerId: user.user_metadata?.paddle_customer_id,
        customData: { user_id: user.id }
      }),
    });

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
