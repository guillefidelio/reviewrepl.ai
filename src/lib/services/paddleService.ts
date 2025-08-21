import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  PaddleSubscription, 
  PaddleTransaction, 
  PaddleCustomer,
  PaddleWebhookEventType,
  WebhookProcessingResult,
  PaddleCheckoutConfig,
  PaddleCheckoutResponse,
  PaddleCheckoutOptions
} from '@/lib/types';
import { PADDLE_CONFIG, getProductByPaddlePriceId } from '@/lib/paddle';

export class PaddleService {
  private static instance: PaddleService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PaddleService {
    if (!PaddleService.instance) {
      PaddleService.instance = new PaddleService();
    }
    return PaddleService.instance;
  }

  // Helper method to parse custom_data from webhooks
  private parseCustomData(customData?: string | Record<string, unknown> | unknown): Record<string, unknown> | null {
    if (!customData) {
      return null;
    }

    if (typeof customData === 'string') {
      try {
        return JSON.parse(customData);
      } catch (error) {
        console.error('Failed to parse custom_data:', error);
        return null;
      }
    }

    if (typeof customData === 'object' && customData !== null) {
      return customData as Record<string, unknown>;
    }

    return null;
  }

  // Helper method to map Paddle subscription statuses to our internal types
  private mapSubscriptionStatus(paddleStatus: string): 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused' {
    const statusMap = {
      active: 'active',
      canceled: 'canceled',
      cancelled: 'canceled', // Handle both spellings
      trialing: 'trialing',
      paused: 'paused',
      past_due: 'past_due',
      incomplete: 'canceled', // Map incomplete to canceled
      archived: 'canceled', // Map archived to canceled
    } as const;

    return statusMap[paddleStatus as keyof typeof statusMap] || 'canceled';
  }

  // Helper method to map Paddle transaction statuses to our internal types
  private mapTransactionStatus(paddleStatus: string): 'draft' | 'ready' | 'billed' | 'paid' | 'completed' | 'canceled' | 'past_due' {
    const statusMap = {
      draft: 'draft',
      ready: 'ready',
      billed: 'billed',
      paid: 'paid',
      completed: 'completed',
      canceled: 'canceled',
      cancelled: 'canceled', // Handle both spellings
      past_due: 'past_due',
      failed: 'canceled', // Map failed to canceled
    } as const;

    return statusMap[paddleStatus as keyof typeof statusMap] || 'canceled';
  }

  // Helper method to map collection modes
  private mapCollectionMode(paddleMode: string): 'automatic' | 'manual' {
    return paddleMode === 'manual' ? 'manual' : 'automatic';
  }

  // Initialize Paddle v2 SDK
  async initializePaddle(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Load Paddle v2 SDK script if not already loaded
      if (!document.querySelector('script[src*="paddle.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        console.log('Paddle SDK script loaded successfully');
      } else {
        console.log('Paddle SDK script already loaded');
      }

      // Wait for Paddle to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if Paddle is available
      if (!window.Paddle) {
        throw new Error('Paddle SDK not loaded');
      }

      console.log('Paddle SDK loaded, available methods:', Object.keys(window.Paddle));

      // Set environment
      if (window.Paddle.Environment?.set) {
        window.Paddle.Environment.set(PADDLE_CONFIG.environment as 'sandbox' | 'production');
        console.log(`Paddle environment set to: ${PADDLE_CONFIG.environment}`);
      } else {
        console.warn('Paddle.Environment.set not available');
      }

      // Initialize with client token
      if (window.Paddle.Initialize && PADDLE_CONFIG.clientToken) {
        window.Paddle.Initialize({
          token: PADDLE_CONFIG.clientToken,
        });
        console.log('Paddle initialized successfully with token');
      } else {
        if (!PADDLE_CONFIG.clientToken) {
          console.error('Paddle client token not found in environment variables');
          console.error('Expected: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN');
          console.error('Current config:', {
            environment: PADDLE_CONFIG.environment,
            hasClientToken: !!PADDLE_CONFIG.clientToken,
            clientTokenLength: PADDLE_CONFIG.clientToken.length
          });
        }
        if (!window.Paddle.Initialize) {
          console.error('Paddle.Initialize method not available');
        }
        throw new Error('Paddle initialization failed - check configuration');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Paddle:', error);
      throw new Error('Failed to initialize Paddle');
    }
  }

  // Create checkout session for subscription
  async createCheckout(config: PaddleCheckoutConfig): Promise<PaddleCheckoutResponse> {
    try {
      // Ensure Paddle is initialized
      if (!this.isInitialized) {
        await this.initializePaddle();
      }

      if (typeof window === 'undefined') {
        throw new Error('Checkout can only be created on the client side');
      }

      if (!window.Paddle?.Checkout?.open) {
        console.error('Paddle Checkout not available');
        console.error('Available Paddle methods:', Object.keys(window.Paddle));
        if (window.Paddle.Checkout) {
          console.error('Paddle.Checkout methods:', Object.keys(window.Paddle.Checkout));
        }
        throw new Error('Paddle Checkout not available - check initialization');
      }

      console.log('Opening Paddle checkout with config:', config);

      // Convert customData to JSON string as required by Paddle
      const customDataString = config.customData ? JSON.stringify(config.customData) : undefined;

      // Log the exact configuration being sent to Paddle for debugging
      const paddleConfig: PaddleCheckoutOptions = {
        items: [
          {
            priceId: config.priceId,
            quantity: 1,
          },
        ],
        customer: {
          email: config.customerEmail,
        },
        customData: customDataString,
        settings: {
          displayMode: 'redirect', // Force redirect mode to avoid iframe issues
          theme: 'light',
          locale: 'en',
          successUrl: config.successUrl,
          cancelUrl: config.cancelUrl,
          allowLogout: false,
        }
      };
      
      console.log('Full checkout config being sent to Paddle:', JSON.stringify(paddleConfig, null, 2));

      // Open Paddle checkout in redirect mode (new tab/window)
      try {
        console.log('Attempting to open Paddle checkout in redirect mode...');
        
        // Add comprehensive logging before sending to Paddle
        console.log('=== SENDING TO PADDLE ===');
        console.log(JSON.stringify(paddleConfig, null, 2));
        console.log('========================');
        
        // Log Paddle object state
        console.log('Paddle object available:', !!window.Paddle);
        console.log('Paddle.Checkout available:', !!window.Paddle?.Checkout);
        console.log('Paddle.Checkout.open available:', !!window.Paddle?.Checkout?.open);
        console.log('Paddle methods:', Object.keys(window.Paddle || {}));
        if (window.Paddle?.Checkout) {
          console.log('Paddle.Checkout methods:', Object.keys(window.Paddle.Checkout));
        }
        
        const result = await window.Paddle.Checkout.open(paddleConfig);
        console.log('Paddle result:', result);
        console.log('Paddle checkout opened successfully in redirect mode');
        console.log('User should now see a new tab/window with the checkout form');
      } catch (checkoutError) {
        console.error('Error opening Paddle checkout:', checkoutError);
        console.error('Checkout config that failed:', paddleConfig);
        
        // Enhanced error logging
        console.error('=== PADDLE ERROR DETAILS ===');
        console.error('Error type:', typeof checkoutError);
        console.error('Error constructor:', checkoutError?.constructor?.name);
        
        if (checkoutError instanceof Error) {
          console.error('Error message:', checkoutError.message);
          console.error('Error name:', checkoutError.name);
          console.error('Error stack:', checkoutError.stack);
        }
        
        // Try to get more specific error information
        if (checkoutError && typeof checkoutError === 'object') {
          console.error('Full error object:', JSON.stringify(checkoutError, null, 2));
          
          // Check for specific Paddle error properties
          if ('code' in checkoutError) {
            console.error('Paddle error code:', (checkoutError as Record<string, unknown>).code);
          }
          if ('message' in checkoutError) {
            console.error('Paddle error message:', (checkoutError as Record<string, unknown>).message);
          }
          if ('details' in checkoutError) {
            console.error('Paddle error details:', (checkoutError as Record<string, unknown>).details);
          }
          if ('status' in checkoutError) {
            console.error('Paddle error status:', (checkoutError as Record<string, unknown>).status);
          }
          if ('statusText' in checkoutError) {
            console.error('Paddle error statusText:', (checkoutError as Record<string, unknown>).statusText);
          }
        }
        
        console.error('==========================');
        
        throw new Error(`Paddle checkout failed: ${checkoutError instanceof Error ? checkoutError.message : 'Unknown error'}`);
      }

      // Since Paddle.Checkout.open() doesn't return session data,
      // we return a simple response. The actual checkout data will come via webhooks
      return {
        checkoutId: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
      };
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw new Error('Failed to create checkout');
    }
  }

  // Create or update Paddle customer in our database
  async createOrUpdateCustomer(
    userId: string,
    customerData: {
      id: string;
      email: string;
      name?: string;
      marketingConsent: boolean;
      status: 'active' | 'archived';
    }
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const customerRef = doc(db, 'paddleCustomers', customerData.id);
      const customer: PaddleCustomer = {
        id: customerData.id,
        userId,
        email: customerData.email,
        name: customerData.name,
        marketingConsent: customerData.marketingConsent,
        status: customerData.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(customerRef, customer, { merge: true });
      return customerData.id;
    } catch (error) {
      console.error('Error creating/updating Paddle customer:', error);
      throw new Error('Failed to create/update customer');
    }
  }

  // Create or update Paddle subscription in our database
  async createOrUpdateSubscription(
    subscriptionData: {
      id: string;
      customer_id: string;
      price_id: string;
      status: string;
      quantity: number;
      currency: string;
      unit_price: number;
      billing_cycle: {
        interval: string;
        frequency: number;
      };
      created_at: string;
      updated_at: string;
      started_at: string;
      first_billed_at?: string;
      next_billed_at?: string;
      paused_at?: string;
      canceled_at?: string;
      collection_mode: string;
      custom_data?: Record<string, unknown>;
    },
    userId: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const subscriptionRef = doc(db, 'paddleSubscriptions', subscriptionData.id);
      
      // Determine plan type and credits based on price ID
      const product = getProductByPaddlePriceId(subscriptionData.price_id);
      const planType = product?.id || 'free';
      const monthlyCredits = product?.credits || 10;

      const subscription: PaddleSubscription = {
        id: subscriptionData.id,
        userId,
        customerId: subscriptionData.customer_id,
        priceId: subscriptionData.price_id,
        status: this.mapSubscriptionStatus(subscriptionData.status),
        quantity: subscriptionData.quantity,
        currency: subscriptionData.currency,
        unitPrice: subscriptionData.unit_price,
        totalPrice: subscriptionData.unit_price * subscriptionData.quantity,
        billingCycle: {
          interval: subscriptionData.billing_cycle.interval as 'day' | 'week' | 'month' | 'year',
          frequency: subscriptionData.billing_cycle.frequency,
        },
        createdAt: new Date(subscriptionData.created_at),
        updatedAt: new Date(subscriptionData.updated_at),
        startedAt: new Date(subscriptionData.started_at),
        firstBilledAt: subscriptionData.first_billed_at ? new Date(subscriptionData.first_billed_at) : undefined,
        nextBilledAt: subscriptionData.next_billed_at ? new Date(subscriptionData.next_billed_at) : undefined,
        pausedAt: subscriptionData.paused_at ? new Date(subscriptionData.paused_at) : undefined,
        canceledAt: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at) : undefined,
        collectionMode: this.mapCollectionMode(subscriptionData.collection_mode),
        customData: subscriptionData.custom_data,
        planType: planType as 'free' | 'enthusiast' | 'pro',
        monthlyCredits,
        paddleProductId: subscriptionData.price_id,
      };

      // Use merge to avoid overwriting fields that might have been updated elsewhere
      // but be careful not to merge arrays or complex objects that should be replaced
      await setDoc(subscriptionRef, subscription, { 
        merge: true,
        mergeFields: [
          'id', 'userId', 'customerId', 'priceId', 'status', 'quantity', 
          'currency', 'unitPrice', 'totalPrice', 'billingCycle', 
          'updatedAt', 'startedAt', 'firstBilledAt', 'nextBilledAt', 
          'pausedAt', 'canceledAt', 'collectionMode', 'planType', 
          'monthlyCredits', 'paddleProductId'
        ]
      });
      return subscriptionData.id;
    } catch (error) {
      console.error('Error creating/updating Paddle subscription:', error);
      throw new Error('Failed to create/update subscription');
    }
  }

  // Create or update Paddle transaction in our database
  async createOrUpdateTransaction(
    transactionData: {
      id: string;
      customer_id: string;
      price_id: string;
      subscription_id?: string;
      invoice_id?: string;
      status: string;
      currency: string;
      total: number;
      subtotal: number;
      tax: number;
      collection_mode: string;
      created_at: string;
      updated_at: string;
      billed_at?: string;
      paid_at?: string;
      custom_data?: Record<string, unknown>;
    },
    userId: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const transactionRef = doc(db, 'paddleTransactions', transactionData.id);
      
      // Determine transaction type and credits
      const product = getProductByPaddlePriceId(transactionData.price_id);
      const creditsAllocated = product?.credits || 0;
      const transactionType = transactionData.subscription_id ? 'subscription' : 'one_time_purchase';

      const transaction: PaddleTransaction = {
        id: transactionData.id,
        userId,
        customerId: transactionData.customer_id,
        subscriptionId: transactionData.subscription_id,
        invoiceId: transactionData.invoice_id,
        status: this.mapTransactionStatus(transactionData.status),
        currency: transactionData.currency,
        total: transactionData.total,
        subtotal: transactionData.subtotal,
        tax: transactionData.tax,
        collectionMode: this.mapCollectionMode(transactionData.collection_mode),
        createdAt: new Date(transactionData.created_at),
        updatedAt: new Date(transactionData.updated_at),
        billedAt: transactionData.billed_at ? new Date(transactionData.billed_at) : undefined,
        paidAt: transactionData.paid_at ? new Date(transactionData.paid_at) : undefined,
        customData: transactionData.custom_data,
        creditsAllocated,
        transactionType: transactionType as 'subscription' | 'one_time_purchase' | 'credit_package',
      };

      // Use merge to avoid overwriting fields that might have been updated elsewhere
      await setDoc(transactionRef, transaction, { 
        merge: true,
        mergeFields: [
          'id', 'userId', 'customerId', 'subscriptionId', 'invoiceId', 
          'status', 'currency', 'total', 'subtotal', 'tax', 'collectionMode',
          'updatedAt', 'billedAt', 'paidAt', 'creditsAllocated', 'transactionType'
        ]
      });
      return transactionData.id;
    } catch (error) {
      console.error('Error creating/updating Paddle transaction:', error);
      throw new Error('Failed to create/update transaction');
    }
  }

  // Allocate credits to user based on subscription or purchase
  async allocateCreditsToUser(
    userId: string,
    credits: number,
    source: 'subscription' | 'purchase' | 'bonus',
    transactionId?: string
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentCredits = userData.credits?.available || 0;
      const totalCredits = userData.credits?.total || 0;
      
      const newAvailableCredits = currentCredits + credits;
      const newTotalCredits = totalCredits + credits;

      // Update user credits
      await updateDoc(userRef, {
        'credits.available': newAvailableCredits,
        'credits.total': newTotalCredits,
        'credits.lastUpdated': serverTimestamp(),
      });

      // Create credit transaction record
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const creditTransactionRef = collection(db, 'users', userId, 'creditTransactions');
      await addDoc(creditTransactionRef, {
        userId,
        type: source === 'subscription' ? 'allocation' : 'purchase',
        amount: credits,
        balanceAfter: newAvailableCredits,
        timestamp: serverTimestamp(),
        description: `${source === 'subscription' ? 'Monthly subscription credits' : 'Credit package purchase'} - ${credits} credits`,
        source: source,
        transactionId: transactionId || null,
      });

      console.log(`Allocated ${credits} credits to user ${userId}`);
    } catch (error) {
      console.error('Error allocating credits to user:', error);
      throw new Error('Failed to allocate credits');
    }
  }

  // Process webhook events from Paddle
  async processWebhook(
    event: PaddleWebhookEventType
  ): Promise<WebhookProcessingResult> {
    const result: WebhookProcessingResult = {
      success: false,
      message: '',
      processedAt: new Date(),
      eventId: event.event_id,
      eventType: event.event_type,
      errors: [],
    };

    try {
      switch (event.event_type) {
        case 'subscription.created':
        case 'subscription.updated':
          await this.handleSubscriptionEvent(event);
          break;
        
        case 'subscription.canceled':
          await this.handleSubscriptionCanceled(event);
          break;
        
        case 'transaction.created':
          await this.handleTransactionCreated(event);
          break;
        
        case 'transaction.paid':
          await this.handleTransactionPaid(event);
          break;
        
        case 'customer.created':
        case 'customer.updated':
          await this.handleCustomerEvent(event);
          break;
        
        default:
          result.errors?.push(`Unhandled event type: ${event.event_type}`);
      }

      // Only set success to true if there are no errors
      if (!result.errors || result.errors.length === 0) {
        result.success = true;
        result.message = `Successfully processed ${event.event_type} event`;
      } else {
        result.success = false;
        result.message = `Errors while processing ${event.event_type} event`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!result.errors) {
        result.errors = [];
      }
      result.errors.push(errorMessage);
      result.success = false;
      result.message = `Failed to process ${event.event_type} event`;
      console.error(`Webhook processing error for ${event.event_type}:`, error);
    }

    // Log webhook processing result
    await this.logWebhookResult(result);

    return result;
  }

  // Handle subscription events (created/updated)
  private async handleSubscriptionEvent(event: PaddleWebhookEventType): Promise<void> {
    const data = event.data as {
      custom_data?: string | { user_id?: string };
      price_id: string;
      status: string;
    };
    
    // Parse custom_data - Paddle sends it as stringified JSON
    const customData = this.parseCustomData(data.custom_data);
    const userId = customData?.user_id as string;
    if (!userId) {
      throw new Error('No user ID found in subscription custom data');
    }

    await this.createOrUpdateSubscription(event.data as Parameters<typeof this.createOrUpdateSubscription>[0], userId);
    
    // If this is a new subscription or status changed to active, allocate credits
    if (event.event_type === 'subscription.created' || 
        (event.event_type === 'subscription.updated' && data.status === 'active')) {
      const product = getProductByPaddlePriceId(data.price_id);
      if (product?.credits) {
        await this.allocateCreditsToUser(userId, product.credits, 'subscription');
      }
    }
  }

  // Handle subscription cancellation
  private async handleSubscriptionCanceled(event: PaddleWebhookEventType): Promise<void> {
    const data = event.data as {
      custom_data?: string | { user_id?: string };
    };
    
    // Parse custom_data - Paddle sends it as stringified JSON
    const customData = this.parseCustomData(data.custom_data);
    const userId = customData?.user_id as string;
    if (!userId) {
      throw new Error('No user ID found in subscription custom data');
    }

    await this.createOrUpdateSubscription(event.data as Parameters<typeof this.createOrUpdateSubscription>[0], userId);
    
    // Note: Credits are not removed on cancellation, they remain available
    // but won't be replenished on next billing cycle
  }

  // Handle transaction creation
  private async handleTransactionCreated(event: PaddleWebhookEventType): Promise<void> {
    const data = event.data as {
      custom_data?: string | { user_id?: string };
    };
    
    // Parse custom_data - Paddle sends it as stringified JSON
    const customData = this.parseCustomData(data.custom_data);
    const userId = customData?.user_id as string;
    if (!userId) {
      throw new Error('No user ID found in transaction custom data');
    }

    await this.createOrUpdateTransaction(event.data as Parameters<typeof this.createOrUpdateTransaction>[0], userId);
  }

  // Handle successful payment
  private async handleTransactionPaid(event: PaddleWebhookEventType): Promise<void> {
    const data = event.data as {
      custom_data?: string | { user_id?: string };
      subscription_id?: string;
      price_id: string;
      id: string;
    };
    
    // Parse custom_data - Paddle sends it as stringified JSON
    const customData = this.parseCustomData(data.custom_data);
    const userId = customData?.user_id as string;
    if (!userId) {
      throw new Error('No user ID found in transaction custom data');
    }

    await this.createOrUpdateTransaction(event.data as Parameters<typeof this.createOrUpdateTransaction>[0], userId);
    
    // If this is a one-time purchase (not subscription), allocate credits immediately
    if (!data.subscription_id) {
      const product = getProductByPaddlePriceId(data.price_id);
      if (product?.credits) {
        await this.allocateCreditsToUser(userId, product.credits, 'purchase', data.id);
      }
    }
  }

  // Handle customer events
  private async handleCustomerEvent(event: PaddleWebhookEventType): Promise<void> {
    const data = event.data as {
      custom_data?: string | { user_id?: string };
      id: string;
      email: string;
      name?: string;
      marketing_consent: boolean;
      status: string;
    };
    
    // Parse custom_data - Paddle sends it as stringified JSON
    const customData = this.parseCustomData(data.custom_data);
    const userId = customData?.user_id as string;
    if (!userId) {
      throw new Error('No user ID found in customer custom data');
    }

    await this.createOrUpdateCustomer(userId, {
      id: data.id,
      email: data.email,
      name: data.name,
      marketingConsent: data.marketing_consent,
      status: data.status === 'archived' ? 'archived' : 'active',
    });
  }

  // Log webhook processing results
  private async logWebhookResult(result: WebhookProcessingResult): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const webhookLogRef = collection(db, 'webhookLogs');
      await addDoc(webhookLogRef, {
        ...result,
        processedAt: Timestamp.fromDate(result.processedAt),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging webhook result:', error);
    }
  }

  // Get user's active subscription
  async getUserSubscription(userId: string): Promise<PaddleSubscription | null> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const subscriptionsRef = collection(db, 'paddleSubscriptions');
      const q = query(
        subscriptionsRef,
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const subscriptionDoc = snapshot.docs[0];
      return subscriptionDoc.data() as PaddleSubscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  // Get user's transaction history
  async getUserTransactions(userId: string, limit: number = 10): Promise<PaddleTransaction[]> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      const transactionsRef = collection(db, 'paddleTransactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('status', '==', 'paid')
      );
      
      const snapshot = await getDocs(q);
      const transactions: PaddleTransaction[] = [];
      
      snapshot.forEach((doc) => {
        transactions.push(doc.data() as PaddleTransaction);
      });

      // Sort by creation date (newest first) and limit results
      // Handle both native Date objects and Firestore Timestamps
      return transactions
        .sort((a, b) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toDate().getTime() : (a.createdAt as Date).getTime();
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toDate().getTime() : (b.createdAt as Date).getTime();
          return bTime - aTime;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const paddleService = PaddleService.getInstance();
