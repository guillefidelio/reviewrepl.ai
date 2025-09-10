-- Migration: Add subscription-related fields to users table
-- This enhances the existing users table to track subscription status and credit allocation
-- SIMPLIFIED: Direct Paddle customer ID storage, no separate customers table needed

-- Add subscription-related columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
ADD COLUMN IF NOT EXISTS credits_allocated_monthly INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_renewal_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_subscription_update TIMESTAMPTZ DEFAULT now();

-- Add comments for documentation
COMMENT ON COLUMN public.users.subscription_status IS 'Current subscription status: active, inactive, canceled, or past_due';
COMMENT ON COLUMN public.users.subscription_id IS 'Paddle subscription ID for the active subscription';
COMMENT ON COLUMN public.users.subscription_tier IS 'Current subscription tier (starter, pro, advanced)';
COMMENT ON COLUMN public.users.credits_allocated_monthly IS 'Monthly credit allocation based on subscription tier';
COMMENT ON COLUMN public.users.subscription_renewal_date IS 'Next subscription renewal date';
COMMENT ON COLUMN public.users.last_subscription_update IS 'Last time subscription data was updated';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON public.users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);

-- Function to update user subscription data when subscription changes
CREATE OR REPLACE FUNCTION update_user_subscription_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the users table with subscription information
  IF NEW.subscription_status = 'active' THEN
    UPDATE public.users
    SET
      subscription_status = 'active',
      subscription_id = NEW.subscription_id,
      subscription_tier = (
        SELECT tier_id
        FROM (
          VALUES
            ('pri_starter_monthly', 'starter'),
            ('pri_starter_yearly', 'starter'),
            ('pri_pro_monthly', 'pro'),
            ('pri_pro_yearly', 'pro'),
            ('pri_advanced_monthly', 'advanced'),
            ('pri_advanced_yearly', 'advanced')
        ) AS tiers(price_id, tier_id)
        WHERE price_id = NEW.price_id
      ),
      credits_allocated_monthly = CASE
        WHEN NEW.price_id LIKE '%starter%' THEN 100
        WHEN NEW.price_id LIKE '%pro%' THEN 500
        WHEN NEW.price_id LIKE '%advanced%' THEN 2000
        ELSE 0
      END,
      subscription_renewal_date = NEW.current_period_end,
      last_subscription_update = now()
    WHERE id = (
      SELECT user_id
      FROM public.customers
      WHERE customer_id = NEW.customer_id
    );
  ELSE
    -- If subscription is not active, update status but keep other data
    UPDATE public.users
    SET
      subscription_status = NEW.subscription_status,
      last_subscription_update = now()
    WHERE id = (
      SELECT user_id
      FROM public.customers
      WHERE customer_id = NEW.customer_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update user data when subscription changes
DROP TRIGGER IF EXISTS trigger_update_user_subscription ON public.subscriptions;
CREATE TRIGGER trigger_update_user_subscription
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscription_data();

-- Function to allocate credits monthly based on subscription
CREATE OR REPLACE FUNCTION allocate_monthly_credits()
RETURNS void AS $$
BEGIN
  -- Allocate credits to users with active subscriptions
  UPDATE public.users
  SET
    credits_available = credits_available + credits_allocated_monthly,
    credits_total = credits_total + credits_allocated_monthly,
    credits_last_updated = now()
  WHERE subscription_status = 'active'
    AND subscription_renewal_date > now()
    AND (credits_last_updated IS NULL OR credits_last_updated < now() - interval '30 days');

  -- Log the credit allocation
  INSERT INTO public.jobs (
    user_id,
    job_type,
    payload,
    status,
    created_at,
    updated_at
  )
  SELECT
    id,
    'credit_allocation',
    json_build_object(
      'type', 'monthly_subscription',
      'credits_allocated', credits_allocated_monthly,
      'subscription_tier', subscription_tier
    ),
    'completed',
    now(),
    now()
  FROM public.users
  WHERE subscription_status = 'active'
    AND credits_last_updated >= now() - interval '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Add comments for the functions
COMMENT ON FUNCTION update_user_subscription_data() IS 'Updates user table with subscription data when subscription changes';
COMMENT ON FUNCTION allocate_monthly_credits() IS 'Allocates monthly credits to users with active subscriptions';
