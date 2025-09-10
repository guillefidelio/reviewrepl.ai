# Paddle Integration - Simplified Database Structure

## 🎯 **Simplified Approach Overview**

Instead of using **3 separate tables** (users, customers, subscriptions), we've streamlined it to **just 2 tables**:

### **Before (Complex):**
- `users` table - Your existing user data
- `customers` table - Paddle customer mappings
- `subscriptions` table - Paddle subscription data

### **After (Simplified):**
- `users` table - Your existing user data + Paddle customer ID + subscription summary
- `subscriptions` table - Full Paddle subscription details (with direct user reference)

## 📊 **Database Schema**

### **Users Table (Enhanced)**
```sql
-- Your existing users table + these Paddle fields:
ALTER TABLE public.users
ADD COLUMN paddle_customer_id TEXT,                    -- Direct Paddle customer ID
ADD COLUMN subscription_status TEXT,                   -- active/inactive/canceled/past_due
ADD COLUMN subscription_id TEXT,                       -- Current active subscription ID
ADD COLUMN subscription_tier TEXT,                     -- starter/pro/advanced
ADD COLUMN credits_allocated_monthly INTEGER,          -- Monthly credit allocation
ADD COLUMN subscription_renewal_date TIMESTAMPTZ,      -- Next renewal date
ADD COLUMN last_subscription_update TIMESTAMPTZ;       -- Last webhook update
```

### **Subscriptions Table (Simplified)**
```sql
-- Clean Paddle subscription data with direct user reference:
CREATE TABLE public.subscriptions (
  subscription_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),              -- Direct user reference
  paddle_customer_id TEXT NOT NULL,                    -- For API calls
  subscription_status TEXT NOT NULL,
  price_id TEXT,
  product_id TEXT,
  scheduled_change TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🔄 **Data Flow**

### **1. User Signs Up**
- User creates account in your `users` table
- No Paddle customer created yet

### **2. User Makes First Purchase**
- Paddle creates customer and subscription
- Webhook updates:
  - `users.paddle_customer_id` = Paddle customer ID
  - `users.subscription_id` = Active subscription ID
  - `users.subscription_status` = 'active'
  - `subscriptions` table gets full subscription details

### **3. Ongoing Subscription Management**
- All subscription changes via Paddle webhooks
- Updates both tables automatically
- Credits allocated based on `subscription_tier`

## ✅ **Benefits of Simplified Approach**

### **Reduced Complexity**
- ✅ **50% fewer tables** to manage
- ✅ **Direct user references** (no join needed for basic queries)
- ✅ **Simpler queries** for common operations
- ✅ **Easier debugging** - data is more centralized

### **Better Performance**
- ✅ **Fewer JOINs** for user + subscription queries
- ✅ **Direct foreign keys** to auth.users
- ✅ **Optimized indexes** on frequently queried fields

### **Easier Maintenance**
- ✅ **Clear data ownership** - subscriptions belong to users
- ✅ **Simplified RLS policies** - direct user_id references
- ✅ **Better audit trail** - user data and subscription data together

## 🛠 **Setup Instructions**

### **1. Database Migration**
Run these migrations in Supabase SQL Editor:

```sql
-- Skip: 004_create_customers_table.sql (not needed)

-- Run: 005_create_subscriptions_table.sql (simplified version)
-- Run: 006_add_subscription_fields_to_users.sql (adds Paddle fields to users)
```

### **2. Environment Variables**
```bash
# Same as before
NEXT_PUBLIC_PADDLE_ENV=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_API_KEY=your_api_key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_webhook_secret
```

### **3. Webhook Configuration**
- **URL**: `https://yourdomain.com/api/webhook`
- **Events**: `subscription.created`, `subscription.updated`, `customer.created`, `customer.updated`
- **Secret**: Your `PADDLE_NOTIFICATION_WEBHOOK_SECRET`

## 🔍 **Query Examples**

### **Get User's Active Subscription**
```sql
-- Simple query with direct join
SELECT u.*, s.*
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.id = 'user-id'
  AND s.subscription_status = 'active';
```

### **Get All Users with Subscriptions**
```sql
-- Direct query on users table
SELECT *
FROM users
WHERE subscription_status = 'active'
ORDER BY subscription_renewal_date;
```

### **Credit Allocation Query**
```sql
-- Update credits based on subscription tier
UPDATE users
SET credits_available = CASE
  WHEN subscription_tier = 'starter' THEN 100
  WHEN subscription_tier = 'pro' THEN 500
  WHEN subscription_tier = 'advanced' THEN 2000
  ELSE credits_available
END
WHERE subscription_status = 'active';
```

## 🎯 **API Usage**

### **Get Current User Subscription**
```typescript
import { getSubscriptions } from '@/lib/utils/paddle';

// Gets subscription data for current user
const subscriptions = await getSubscriptions();
```

### **Create Customer (First Purchase)**
```typescript
import { createOrLinkCustomer } from '@/lib/utils/paddle';

// Creates Paddle customer and links to user
const customerId = await createOrLinkCustomer(user.email);
```

## 🔒 **Security**

### **Row Level Security (RLS)**
- ✅ Users can only access their own subscription data
- ✅ Service role can manage all data (for webhooks)
- ✅ Direct user_id references simplify policies

### **Webhook Verification**
- ✅ HMAC signature verification on all webhooks
- ✅ Secure storage of webhook secrets
- ✅ Raw body processing to maintain signature integrity

## 🚀 **Migration Benefits**

### **For Your Existing System**
- ✅ **Zero breaking changes** to existing user queries
- ✅ **Backward compatible** with your current user table
- ✅ **Seamless integration** with existing credit system
- ✅ **Automatic credit allocation** based on subscription tier

### **For Future Development**
- ✅ **Scalable structure** for multiple subscriptions per user
- ✅ **Clean separation** of Paddle data vs. your business data
- ✅ **Easy upgrades/downgrades** with full subscription history
- ✅ **Audit trail** for all subscription changes

## 🎉 **Result**

You now have a **production-ready Paddle integration** with:

- **📊 2-table structure** (instead of 3)
- **🔗 Direct user references** (better performance)
- **⚡ Automatic credit allocation** (based on subscription tier)
- **🔄 Real-time webhook updates** (subscription status, renewals, cancellations)
- **🛡️ Full security** (RLS, webhook verification)
- **📈 Scalable design** (ready for future features)

The integration handles the complete subscription lifecycle while keeping your database structure clean and performant!
