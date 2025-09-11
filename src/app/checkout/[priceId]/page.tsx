import { CheckoutContents } from '@/components/checkout/checkout-contents';
import { redirect } from 'next/navigation';
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

    const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.log('❌ Checkout: User authentication failed, redirecting to login');
    return redirect('/supabase-login?redirect=' + encodeURIComponent(`/checkout/${priceId}`));
  }

  const user = userData.user;
  console.log('✅ Checkout: User authenticated, proceeding to Paddle:', { userId: user.id });

  try {
    // Instead of creating a transaction, we'll create a checkout session on the client side
    // Pass the user info to the client component for proper Paddle.js initialization

    console.log('✅ Checkout: Passing priceId and user info to client component for Paddle.js checkout');

    // 4. Pass the priceId and user info to client component
    return <CheckoutContents priceId={priceId} userEmail={user.email} userId={user.id} />;

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
