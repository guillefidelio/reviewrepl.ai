-- Migration: Create simplified subscriptions table for Paddle integration
-- This table tracks Paddle subscription data with direct user reference

CREATE TABLE public.subscriptions (
  subscription_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_customer_id TEXT NOT NULL,
  subscription_status TEXT NOT NULL,
  price_id TEXT,
  product_id TEXT,
  scheduled_change TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (subscription_id)
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_customer_id ON subscriptions(paddle_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(subscription_status);
CREATE INDEX idx_subscriptions_price_id ON subscriptions(price_id);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own subscription data
CREATE POLICY "Users can view own subscription data" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscription data (for webhooks)
CREATE POLICY "Service role can manage subscription data" ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Tracks Paddle subscription data for billing integration';
COMMENT ON COLUMN subscriptions.subscription_id IS 'Paddle subscription ID';
COMMENT ON COLUMN subscriptions.user_id IS 'Supabase user ID (direct reference)';
COMMENT ON COLUMN subscriptions.paddle_customer_id IS 'Paddle customer ID for API calls';
COMMENT ON COLUMN subscriptions.subscription_status IS 'Current subscription status (active, canceled, etc.)';
COMMENT ON COLUMN subscriptions.price_id IS 'Paddle price ID for the subscription';
COMMENT ON COLUMN subscriptions.product_id IS 'Paddle product ID';
COMMENT ON COLUMN subscriptions.scheduled_change IS 'Scheduled subscription changes (upgrade/downgrade)';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN subscriptions.current_period_end IS 'End of current billing period';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at period end';
