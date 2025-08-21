# Paddle v2 SDK Integration

This project now uses the modern Paddle Billing v2 SDK instead of the deprecated Classic API.

## What Changed

- ✅ **Removed**: Old `@paddle/paddle-js` package
- ✅ **Added**: Modern Paddle v2 SDK via CDN
- ✅ **Updated**: All types and interfaces to match v2 API
- ✅ **Simplified**: Configuration and initialization

## Setup

### 1. Environment Variables

Copy the required environment variables to your `.env.local` file:

```bash
# Paddle Client Token (from Paddle dashboard → Developers → Authentication)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=pk_test_your_token_here

# Paddle Price IDs (from Paddle dashboard → Products → Prices)
NEXT_PUBLIC_PADDLE_ENTHUSIAST_PRICE_ID=pri_your_enthusiast_price_id
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=pri_your_pro_price_id

# Paddle Webhook Secret (from Paddle dashboard → Developers → Webhooks)
PADDLE_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Paddle Dashboard Setup

1. **Get Client Token**: Go to Paddle Dashboard → Developers → Authentication
2. **Create Products & Prices**: Go to Products → Create Product → Add Price
3. **Copy Price IDs**: Use the `pri_xxx` IDs (not the old `pro_xxx` IDs)
4. **Set Webhook**: Go to Developers → Webhooks → Add endpoint

## Usage

### Initialize Paddle

The Paddle service automatically initializes when needed:

```typescript
import { paddleService } from '@/lib/services/paddleService';

// Paddle is automatically initialized when creating checkout
const checkout = await paddleService.createCheckout(config);
```

### Create Checkout

```typescript
import { usePaddle } from '@/lib/hooks/usePaddle';

function PricingComponent() {
  const { createSubscription } = usePaddle();
  
  const handleSubscribe = async (planName: 'enthusiast' | 'pro') => {
    try {
      const result = await createSubscription(planName);
      if (result) {
        console.log('Checkout created:', result.checkoutId);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };
  
  return (
    <button onClick={() => handleSubscribe('pro')}>
      Subscribe to Pro Plan
    </button>
  );
}
```

### Handle Webhooks

Webhooks are automatically processed by the `paddleService.processWebhook()` method:

```typescript
// In your API route (e.g., /api/paddle/webhook)
import { paddleService } from '@/lib/services/paddleService';

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const result = await paddleService.processWebhook(body);
    return Response.json({ success: result.success });
  } catch (error) {
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

## Key Differences from Old API

| Old API | New v2 API |
|---------|------------|
| `Paddle.Setup({ vendor: ... })` | `Paddle.Initialize({ token: ... })` |
| `pro_xxx` product IDs | `pri_xxx` price IDs |
| Complex checkout flow | Simple `Paddle.Checkout.open()` |
| Manual script loading | Automatic CDN loading |

## Troubleshooting

### Common Issues

1. **"Paddle not initialized"**: Check your `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` environment variable
2. **"Checkout not available"**: Ensure you're using the v2 SDK (`/v2/paddle.js`)
3. **"Price ID not found"**: Use `pri_xxx` IDs, not `pro_xxx` IDs

### Debug Mode

Enable debug logging by checking the browser console. The service logs:
- Paddle initialization status
- Environment configuration
- Checkout creation details
- Webhook processing results

## Migration Notes

- **Old product IDs**: Replace `pro_xxx` with `pri_xxx` price IDs
- **Environment variables**: Update to use `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- **Checkout calls**: Use the new `createCheckout` method
- **Webhook handling**: The new service handles all webhook types automatically

## Support

For Paddle-specific issues, refer to:
- [Paddle Billing API Documentation](https://developer.paddle.com/api-reference/overview)
- [Paddle v2 SDK Guide](https://developer.paddle.com/guides/get-started-with-paddle-billing)
- [Paddle Dashboard](https://vendors.paddle.com/)
