# 🧪 Paddle Integration Testing Guide

This comprehensive guide will help you test the Paddle billing integration end-to-end.

## 📋 Prerequisites

Before testing, ensure you have:

1. **Environment Variables Configured:**
   ```bash
   NEXT_PUBLIC_PADDLE_ENV=sandbox
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_sandbox_client_token
   PADDLE_API_KEY=your_sandbox_api_key
   PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_sandbox_webhook_secret
   ```

2. **Database Tables Created:**
   - Run migrations: `004_create_customers_table.sql` (skip), `005_create_subscriptions_table.sql`, `006_add_subscription_fields_to_users.sql`

3. **Real Paddle Price IDs:**
   - Update `src/lib/constants/pricing-tiers.ts` with actual Paddle price IDs
   - Get them from: https://sandbox-vendors.paddle.com → Products → Prices

## 🔄 Testing Flow

### Phase 1: Environment Setup

#### 1.1 Test Environment Variables
```bash
# Check if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_PADDLE_ENV)"
node -e "console.log(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)"
```

#### 1.2 Test Database Connection
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users LIMIT 1;
SELECT * FROM subscriptions LIMIT 1;
```

#### 1.3 Test Paddle API Connection
```bash
# Check if Paddle SDK can initialize
npm run dev
# Visit http://localhost:3000 and check browser console for Paddle errors
```

### Phase 2: User Authentication

#### 2.1 Create Test User
1. Go to your app's signup page
2. Create a test user account
3. Verify user appears in `users` table

#### 2.2 Test User Table Updates
```sql
-- Check user was created
SELECT id, email, paddle_customer_id FROM users WHERE email = 'test@example.com';
```

### Phase 3: Pricing Page Testing

#### 3.1 Test Pricing Cards Display
1. Visit `/pricing` page (create this route if needed)
2. Verify all pricing tiers display correctly
3. Test monthly/yearly toggle
4. Check that "Subscribe Now" buttons work

#### 3.2 Test Price ID Validation
```typescript
// In browser console
import { PricingTiers } from '@/lib/constants/pricing-tiers';
console.log('Price IDs:', PricingTiers.map(t => t.priceId));
```

### Phase 4: Checkout Flow Testing

#### 4.1 Test Checkout Page Access
1. Click "Subscribe Now" on any pricing tier
2. Verify redirect to `/checkout/[priceId]`
3. Check that price ID is correctly extracted from URL

#### 4.2 Test Paddle.js Initialization
1. Open browser developer tools
2. Check console for Paddle initialization messages
3. Verify no JavaScript errors
4. Check network tab for Paddle API calls

#### 4.3 Test Checkout Form Display
1. Verify Paddle checkout iframe loads
2. Check that user email is pre-filled (if logged in)
3. Test form validation
4. Verify secure checkout messaging

### Phase 5: Payment Testing

#### 5.1 Use Paddle Sandbox Test Cards
```
✅ Success Card: 4242 4242 4242 4242
❌ Failed Card: 4000 0000 0000 0002
⏳ Processing: 4000 0025 0000 3155
```

#### 5.2 Test Successful Payment
1. Use success test card
2. Complete checkout process
3. Verify redirect to `/checkout/success`
4. Check success page displays correct information

#### 5.3 Verify Database Updates
```sql
-- Check user table updates
SELECT id, email, paddle_customer_id, subscription_status, subscription_id, subscription_tier
FROM users WHERE email = 'test@example.com';

-- Check subscriptions table
SELECT * FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

### Phase 6: Webhook Testing

#### 6.1 Test Webhook Endpoint
```bash
# Test webhook endpoint is accessible
curl -X GET https://yourdomain.com/api/webhook
# Should return: {"status":"ok","message":"Paddle webhook endpoint is active"}
```

#### 6.2 Simulate Webhook Events
Use tools like [ngrok](https://ngrok.com) or [webhook.site](https://webhook.site) to test webhooks:

```bash
# Expose local server
ngrok http 3000
# Update Paddle webhook URL to ngrok URL
```

#### 6.3 Test Webhook Processing
1. Make a test payment in Paddle sandbox
2. Verify webhook events are received
3. Check database updates after webhook processing

#### 6.4 Manual Webhook Testing
```bash
# Test webhook with curl (replace with real data)
curl -X POST https://yourdomain.com/api/webhook \
  -H "Content-Type: application/json" \
  -H "paddle-signature: your_signature" \
  -d '{"eventType":"subscription.created","data":{}}'
```

### Phase 7: Dashboard Testing

#### 7.1 Test Subscription Display
1. Login as test user
2. Visit dashboard
3. Verify subscription information displays correctly
4. Check credits are allocated properly

#### 7.2 Test Subscription Management
1. Test "Cancel Subscription" button
2. Verify subscription status changes
3. Test "Reactivate Subscription" if canceled
4. Check database updates after each action

#### 7.3 Test Billing History
1. Visit billing history section
2. Verify transactions appear
3. Test invoice download (if available)
4. Check date formatting and amounts

### Phase 8: Credit System Testing

#### 8.1 Test Credit Allocation
```sql
-- Check credits after subscription
SELECT email, credits_available, credits_total, subscription_status
FROM users WHERE email = 'test@example.com';
```

#### 8.2 Test Credit Consumption
1. Use your app's credit-consuming features
2. Verify credits decrease correctly
3. Test credit limit enforcement

#### 8.3 Test Monthly Credit Reset
```sql
-- Simulate monthly credit allocation (run this manually)
UPDATE users
SET credits_available = credits_available + credits_allocated_monthly,
    credits_total = credits_total + credits_allocated_monthly,
    credits_last_updated = now()
WHERE subscription_status = 'active';
```

### Phase 9: Error Handling Testing

#### 9.1 Test Invalid Price IDs
1. Visit `/checkout/invalid_price_id`
2. Verify error message displays
3. Test redirect behavior

#### 9.2 Test Network Failures
1. Disable internet connection during checkout
2. Verify error handling
3. Test recovery when connection restored

#### 9.3 Test Paddle API Errors
1. Use invalid API keys temporarily
2. Verify error messages
3. Restore valid keys and test recovery

### Phase 10: Production Readiness

#### 10.1 Switch to Production Environment
```bash
# Update environment variables
NEXT_PUBLIC_PADDLE_ENV=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_production_client_token
PADDLE_API_KEY=your_production_api_key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_production_webhook_secret
```

#### 10.2 Update Production Price IDs
- Replace sandbox price IDs with production ones
- Test with real payment methods (use small amounts)

#### 10.3 Production Webhook Setup
1. Update webhook URL to production domain
2. Verify webhook signature validation
3. Test with real payment data

## 🐛 Troubleshooting Common Issues

### Issue 1: Checkout Not Loading
**Symptoms:** Paddle iframe doesn't appear
**Solutions:**
- Check browser console for JavaScript errors
- Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is set
- Ensure Paddle.js is loading from CDN
- Check network tab for failed API calls

### Issue 2: Webhook Events Not Processing
**Symptoms:** Database not updating after payment
**Solutions:**
- Verify webhook URL is accessible
- Check webhook signature validation
- Review server logs for webhook processing errors
- Ensure `PADDLE_NOTIFICATION_WEBHOOK_SECRET` matches Paddle settings

### Issue 3: Credits Not Allocating
**Symptoms:** User has subscription but no credits
**Solutions:**
- Check `subscription_status` in users table
- Verify `credits_allocated_monthly` is set
- Check webhook processing for subscription events
- Manually trigger credit allocation if needed

### Issue 4: Subscription Status Incorrect
**Symptoms:** Dashboard shows wrong subscription status
**Solutions:**
- Check `subscriptions` table for latest data
- Verify webhook events are updating both tables
- Check `paddle_customer_id` mapping
- Refresh subscription data manually

## 📊 Monitoring & Analytics

### Key Metrics to Monitor
1. **Conversion Rate:** Visitors → Paid subscribers
2. **Churn Rate:** Subscription cancellations
3. **Failed Payments:** Payment processing errors
4. **Webhook Success Rate:** Webhook delivery and processing
5. **Credit Usage:** How users consume credits

### Logging Important Events
```typescript
// Add to webhook processing
console.log('Subscription created:', {
  userId: userId,
  subscriptionId: eventData.data.id,
  priceId: eventData.data.items[0].price.id,
  amount: eventData.data.items[0].price.unitPrice.amount
});
```

## 🎯 Success Criteria

✅ **All tests pass:**
- Checkout flow works end-to-end
- Webhooks process correctly
- Database updates properly
- Credits allocate correctly
- Dashboard displays accurate information
- Error handling works as expected

✅ **Production ready:**
- Environment variables configured
- Production price IDs set
- Webhook URL updated
- SSL certificate valid
- Monitoring and alerting set up

## 🚀 Go Live Checklist

- [ ] Environment variables updated for production
- [ ] Production price IDs configured
- [ ] Webhook URL updated in Paddle dashboard
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Test payment with real card (small amount)
- [ ] Verify webhook processing in production
- [ ] Monitor error logs for 24 hours
- [ ] Set up alerts for failed payments

## 📞 Support Resources

- **Paddle Documentation:** https://developer.paddle.com
- **Paddle Status Page:** https://status.paddle.com
- **Supabase Logs:** Check your Supabase dashboard
- **Browser DevTools:** Network and Console tabs

---

## 🎉 You're Ready!

Following this testing guide will ensure your Paddle integration is robust, secure, and ready for production. Start with Phase 1 and work through each phase systematically. Good luck! 🚀
