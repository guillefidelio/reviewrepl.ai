import { createClient } from '@supabase/supabase-js';
import {
  EventEntity,
  EventName,
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
  SubscriptionCanceledEvent,
} from '@paddle/paddle-node-sdk';

/**
 * Webhook processor class for handling Paddle events
 */
export class WebhookProcessor {
  private supabase;

  constructor() {
    // Use service role key for webhook processing to bypass RLS
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Main event processing method
   */
  async processEvent(eventData: EventEntity): Promise<void> {
    try {
      console.log(`Processing Paddle webhook event: ${eventData.eventType}`);

      switch (eventData.eventType) {
        case EventName.SubscriptionCreated:
        case EventName.SubscriptionUpdated:
          await this.updateSubscriptionData(eventData as SubscriptionCreatedEvent | SubscriptionUpdatedEvent);
          break;

        case EventName.CustomerCreated:
        case EventName.CustomerUpdated:
          await this.updateCustomerData(eventData as CustomerCreatedEvent | CustomerUpdatedEvent);
          break;

        case EventName.SubscriptionCanceled:
          await this.handleSubscriptionCanceled(eventData as SubscriptionCanceledEvent);
          break;

        case EventName.TransactionCompleted:
          await this.handleTransactionCompleted(eventData);
          break;

        default:
          console.log(`Unhandled event type: ${eventData.eventType}`);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  /**
   * Updates subscription data in the database
   */
  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent): Promise<void> {
    // First, find the user by paddle_customer_id
    const { data: userData, error: userError } = await this.supabase
      .from('users')
      .select('id')
      .eq('paddle_customer_id', eventData.data.customerId)
      .single();

    if (userError || !userData) {
      console.error('User not found for Paddle customer ID:', eventData.data.customerId);
      throw new Error('User not found for Paddle customer ID');
    }

    const { error } = await this.supabase
      .from('subscriptions')
      .upsert({
        subscription_id: eventData.data.id,
        user_id: userData.id,
        paddle_customer_id: eventData.data.customerId,
        subscription_status: eventData.data.status,
        price_id: eventData.data.items?.[0]?.price?.id || null,
        product_id: eventData.data.items?.[0]?.price?.productId || null,
        scheduled_change: eventData.data.scheduledChange?.effectiveAt || null,
        current_period_start: (eventData.data as { currentPeriodStart?: string }).currentPeriodStart || null,
        current_period_end: (eventData.data as { currentPeriodEnd?: string }).currentPeriodEnd || null,
        cancel_at_period_end: (eventData.data as { cancelAtPeriodEnd?: boolean }).cancelAtPeriodEnd || false,
      }, {
        onConflict: 'subscription_id'
      });

    if (error) {
      console.error('Error updating subscription data:', error);
      throw error;
    }

    // Update user table with latest subscription info
    await this.updateUserSubscriptionInfo(eventData, userData.id);

    console.log(`Updated subscription ${eventData.data.id} with status ${eventData.data.status}`);
  }

  /**
   * Updates user subscription info in the users table
   */
  private async updateUserSubscriptionInfo(
    eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent,
    userId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({
        subscription_status: eventData.data.status,
        subscription_id: eventData.data.id,
        subscription_tier: this.getTierFromPriceId(eventData.data.items?.[0]?.price?.id),
        subscription_renewal_date: (eventData.data as { currentPeriodEnd?: string }).currentPeriodEnd,
        last_subscription_update: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription info:', error);
      throw error;
    }
  }

  /**
   * Gets subscription tier from price ID
   */
  private getTierFromPriceId(priceId?: string): string | null {
    if (!priceId) return null;

    if (priceId.includes('starter')) return 'starter';
    if (priceId.includes('pro')) return 'pro';
    if (priceId.includes('advanced')) return 'advanced';

    return null;
  }

  /**
   * Updates customer data in the database (simplified - just logs for now)
   * In the simplified approach, customer data is stored directly in users table
   */
  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent): Promise<void> {
    console.log(`Customer event received for ${eventData.data.id} with email ${eventData.data.email}`);
    console.log('In simplified approach, customer data is managed through users table');
    // Customer data is now stored directly in the users table via paddle_customer_id
  }

  /**
   * Handles subscription cancellation
   */
  private async handleSubscriptionCanceled(eventData: SubscriptionCanceledEvent): Promise<void> {
    await this.updateSubscriptionData(eventData as unknown as SubscriptionUpdatedEvent);
    console.log(`Subscription ${eventData.data.id} has been canceled`);
  }

  /**
   * Handles completed transactions
   */
  private async handleTransactionCompleted(eventData: EventEntity): Promise<void> {
    // Here you could update credit balances, send notifications, etc.
    console.log(`Transaction completed for subscription/item: ${JSON.stringify(eventData.data)}`);
  }

  /**
   * Links a Paddle customer to a user account
   * In simplified approach, this stores paddle_customer_id directly in users table
   */
  async linkCustomerToUser(customerId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ paddle_customer_id: customerId })
      .eq('id', userId);

    if (error) {
      console.error('Error linking Paddle customer to user:', error);
      throw error;
    }

    console.log(`Linked Paddle customer ${customerId} to user ${userId}`);
  }

  /**
   * Gets Paddle customer ID by user ID
   */
  async getCustomerIdByUserId(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('paddle_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error getting Paddle customer ID by user ID:', error);
      throw error;
    }

    return data?.paddle_customer_id || null;
  }

  /**
   * Gets Paddle customer ID by email (for backwards compatibility)
   */
  async getCustomerIdByEmail(email: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('paddle_customer_id')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error getting Paddle customer ID by email:', error);
      throw error;
    }

    return data?.paddle_customer_id || null;
  }
}
