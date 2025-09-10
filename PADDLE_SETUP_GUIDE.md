# Paddle Integration Setup Guide

This guide will help you complete the Paddle integration setup for your Next.js application.

## 🚀 Quick Start

### 1. Environment Configuration

Update your `.env.local` file with your Paddle credentials:

```bash
# Paddle Billing Configuration
NEXT_PUBLIC_PADDLE_ENV=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token_here
PADDLE_API_KEY=your_api_key_here
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_webhook_secret_here

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

Run the database migrations in order:

```sql
-- Run these in your Supabase SQL editor
-- 1. Customers table
-- 2. Subscriptions table
-- 3. Add subscription fields to users table
```

You can find the migration files in:
- `src/lib/migrations/004_create_customers_table.sql`
- `src/lib/migrations/005_create_subscriptions_table.sql`
- `src/lib/migrations/006_add_subscription_fields_to_users.sql`

### 3. Update Pricing Configuration

Edit `src/lib/constants/pricing-tiers.ts` and replace the placeholder price IDs with your actual Paddle price IDs:

```typescript
export const PricingTiers: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceId: {
      month: 'pri_01k4tdjr8f4hg5wnaew0mz2jqa', // Replace with your actual price ID
      year: 'pri_01k4tdkj0e1e0kbg7gsaynjg20'   // Replace with your actual price ID
    },
    // ... rest of configuration
  },
  // ... other tiers
];
```

## 🔧 Core Components

### Paddle Utilities

The integration includes several utility modules:

- **`get-paddle-instance.ts`** - Creates and configures Paddle SDK instance
- **`data-helpers.ts`** - Utility functions for data processing and error handling
- **`parse-money.ts`** - Currency conversion and formatting utilities
- **`webhook-processor.ts`** - Handles incoming Paddle webhooks
- **`subscription-manager.ts`** - Subscription management functions

### React Hooks

- **`usePaddleSubscription`** - Main hook for subscription management and credit allocation
- **`useSupabaseCredits`** - Existing credits hook (now integrated with subscriptions)

### Database Tables

The integration adds these tables to your existing database:

- **`customers`** - Maps Supabase users to Paddle customers
- **`subscriptions`** - Tracks Paddle subscription data
- **Enhanced `users` table** - Added subscription-related fields

## 🔄 Webhook Configuration

### 1. Set Up Webhook Endpoint

Your webhook endpoint is already configured at `/api/webhook`. In your Paddle dashboard:

1. Go to **Developer Tools** → **Webhooks**
2. Create a new webhook
3. Set the URL to: `https://yourdomain.com/api/webhook`
4. Select these events:
   - `subscription.created`
   - `subscription.updated`
   - `customer.created`
   - `customer.updated`
   - `transaction.completed`

### 2. Webhook Secret

Copy the webhook secret from Paddle and add it to your environment variables as `PADDLE_NOTIFICATION_WEBHOOK_SECRET`.

## 💳 Checkout Flow

To implement the checkout flow, you'll need to:

### 1. Create Checkout Page

Create `src/app/checkout/[priceId]/page.tsx`:

```typescript
'use client';

import { useParams } from 'next/navigation';
import { CheckoutContents } from '@/components/checkout/checkout-contents';

export default function CheckoutPage() {
  const { priceId } = useParams();

  return <CheckoutContents priceId={priceId as string} />;
}
```

### 2. Create Checkout Components

You'll need to create checkout components that use Paddle.js for inline checkout.

## 📊 Dashboard Integration

### 1. Subscription Management

Use the `usePaddleSubscription` hook in your dashboard:

```typescript
'use client';

import { usePaddleSubscription } from '@/lib/hooks/usePaddleSubscription';

export function SubscriptionManager() {
  const {
    subscriptions,
    activeSubscription,
    loading,
    error,
    cancelSubscription,
    upgradeSubscription,
    billingSummary
  } = usePaddleSubscription();

  // Your component logic here
}
```

### 2. Credit Allocation

Credits are automatically allocated based on subscription tier:

- **Starter**: 100 credits/month
- **Pro**: 500 credits/month
- **Advanced**: 2000 credits/month

## 🧪 Testing the Integration

### 1. Sandbox Environment

Use Paddle's sandbox environment for testing:

1. Set `NEXT_PUBLIC_PADDLE_ENV=sandbox`
2. Use sandbox API keys and client tokens
3. Test with Paddle's test cards

### 2. Test Webhooks

Use tools like ngrok or similar to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Update webhook URL in Paddle dashboard to use ngrok URL
```

### 3. Test Subscription Flow

1. Create a test subscription
2. Verify webhook events are processed
3. Check that credits are allocated correctly
4. Test subscription cancellation and reactivation

## 🔒 Security Considerations

### Environment Variables

- Never commit API keys to version control
- Use different keys for sandbox and production
- Rotate keys regularly

### Webhook Verification

- All webhooks are verified using HMAC signatures
- Invalid signatures are rejected with 400 status
- Webhook secrets are stored securely as environment variables

### Database Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Service role is used for webhook processing

## 🚀 Production Deployment

### 1. Switch to Production

When ready for production:

1. Set `NEXT_PUBLIC_PADDLE_ENV=production`
2. Update API keys and client tokens
3. Update webhook URL to production domain
4. Test thoroughly with small amounts

### 2. Price IDs

Make sure to update all price IDs in `pricing-tiers.ts` with your production price IDs.

### 3. Monitoring

Monitor your Paddle integration:

- Check webhook delivery in Paddle dashboard
- Monitor subscription events
- Track credit allocation
- Set up alerts for failed payments

## 🆘 Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check that `PADDLE_NOTIFICATION_WEBHOOK_SECRET` is correct
   - Ensure raw request body is used for signature verification

2. **Customer not found errors**
   - Ensure customers are created before subscriptions
   - Check that webhook events are processed in order

3. **Credits not allocated**
   - Verify subscription status is 'active'
   - Check that price IDs match your configuration
   - Ensure webhook processor is running

4. **Checkout not loading**
   - Verify client token is correct
   - Check that environment is properly set
   - Ensure Paddle.js is loaded correctly

### Debug Mode

Enable debug logging by setting the log level in `get-paddle-instance.ts`:

```typescript
logLevel: LogLevel.debug, // For debugging
```

## 📚 Additional Resources

- [Paddle Documentation](https://developer.paddle.com/)
- [Paddle.js Reference](https://developer.paddle.com/paddlejs/)
- [Webhook Events](https://developer.paddle.com/webhooks/overview)
- [Supabase Documentation](https://supabase.com/docs)

## 🎯 Next Steps

After completing the basic setup:

1. Implement the checkout UI components
2. Add subscription management to your dashboard
3. Set up billing history and transaction views
4. Add upgrade/downgrade functionality
5. Implement coupon and discount support
6. Add subscription analytics

The foundation is now in place for a complete subscription billing system integrated with your existing credit-based application!
