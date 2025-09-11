import { getPaddleInstance } from '@/lib/utils/paddle/get-paddle-instance';
import { CheckoutContents } from '@/components/checkout/checkout-contents';
import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/lib/utils/auth/get-user';

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

  const user = await getUser();

  if (!user) {
    // Redirect to login if not authenticated
    return redirect('/supabase-login?redirect=' + encodeURIComponent(`/checkout/${priceId}`));
  }

  try {
    // 1. Get server-side Paddle instance
    const paddle = getPaddleInstance();

    // 2. Create transaction to get checkout URL
    const transaction = await paddle.transactions.create({
      items: [{ priceId: priceId, quantity: 1 }],
      customerId: user.user_metadata?.paddle_customer_id, // Use existing customer if available
      customData: {
        user_id: user.id,
      },
    });

    if (!transaction.checkout?.url) {
      console.error('No checkout URL returned from Paddle');
      return notFound();
    }

    console.log('✅ Paddle checkout URL created:', transaction.checkout.url);

    // 3. Pass the checkout URL to client component for redirect
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
