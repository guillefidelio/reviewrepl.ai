import { createClient } from '@supabase/supabase-js';
import { getPaddleInstance, ErrorMessage, type ApiResponse } from './data-helpers';
import { WebhookProcessor } from './webhook-processor';

/**
 * Response types for subscription operations
 */
export interface SubscriptionResponse {
  data: any[];
  hasMore: boolean;
  totalRecords: number;
}

export interface TransactionResponse {
  data: any[];
  hasMore: boolean;
  totalRecords: number;
}

/**
 * Gets Paddle customer ID for the current user
 * In simplified approach, this is stored directly in users table
 */
export async function getCustomerId(): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('users')
      .select('paddle_customer_id')
      .eq('id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return ''; // No customer found
      }
      throw error;
    }

    return data?.paddle_customer_id || '';
  } catch (error) {
    console.error('Error getting Paddle customer ID:', error);
    return '';
  }
}

/**
 * Gets all subscriptions for the current user
 */
export async function getSubscriptions(): Promise<ApiResponse<SubscriptionResponse>> {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return { data: { data: [], hasMore: false, totalRecords: 0 } };
    }

    const paddle = getPaddleInstance();
    const subscriptionCollection = paddle.subscriptions.list({
      customerId: [customerId],
      perPage: 20
    });

    const subscriptions = await subscriptionCollection.next();

    return {
      data: {
        data: subscriptions,
        hasMore: subscriptionCollection.hasMore,
        totalRecords: subscriptionCollection.estimatedTotal,
      }
    };
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return { error: ErrorMessage };
  }
}

/**
 * Gets transactions for a specific subscription
 */
export async function getTransactions(
  subscriptionId: string,
  after: string = ''
): Promise<ApiResponse<TransactionResponse>> {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return { error: 'Customer not found' };
    }

    const paddle = getPaddleInstance();
    const transactionCollection = paddle.transactions.list({
      customerId: [customerId],
      after: after || undefined,
      perPage: 10,
      status: ['billed', 'paid', 'past_due', 'completed', 'canceled'],
      subscriptionId: subscriptionId ? [subscriptionId] : undefined,
    });

    const transactions = await transactionCollection.next();

    return {
      data: {
        data: transactions,
        hasMore: transactionCollection.hasMore,
        totalRecords: transactionCollection.estimatedTotal,
      }
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    return { error: ErrorMessage };
  }
}

/**
 * Creates or links a customer in Paddle
 */
export async function createOrLinkCustomer(email: string): Promise<ApiResponse<string>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Check if customer already exists
    const processor = new WebhookProcessor();
    let customerId = await processor.getCustomerIdByEmail(email);

    if (!customerId) {
      // Create new customer in Paddle
      const paddle = getPaddleInstance();
      const customer = await paddle.customers.create({
        email: email,
      });
      customerId = customer.id;

      // Link customer to user in database
      await processor.linkCustomerToUser(customerId, user.user.id);
    }

    return { data: customerId };
  } catch (error) {
    console.error('Error creating/linking customer:', error);
    return { error: ErrorMessage };
  }
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<ApiResponse<boolean>> {
  try {
    const paddle = getPaddleInstance();
    await paddle.subscriptions.update(subscriptionId, {
      cancelAtPeriodEnd: true,
    });

    return { data: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { error: ErrorMessage };
  }
}

/**
 * Reactivates a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<ApiResponse<boolean>> {
  try {
    const paddle = getPaddleInstance();
    await paddle.subscriptions.update(subscriptionId, {
      cancelAtPeriodEnd: false,
    });

    return { data: true };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return { error: ErrorMessage };
  }
}

/**
 * Updates subscription price (upgrade/downgrade)
 */
export async function updateSubscriptionPrice(
  subscriptionId: string,
  newPriceId: string
): Promise<ApiResponse<boolean>> {
  try {
    const paddle = getPaddleInstance();
    await paddle.subscriptions.update(subscriptionId, {
      items: [{
        priceId: newPriceId,
        quantity: 1,
      }],
    });

    return { data: true };
  } catch (error) {
    console.error('Error updating subscription price:', error);
    return { error: ErrorMessage };
  }
}
