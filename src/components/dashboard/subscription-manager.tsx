'use client';

import { useState } from 'react';
import { usePaddleSubscription } from '@/lib/hooks/usePaddleSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CreditCard, Calendar, Zap } from 'lucide-react';

export function SubscriptionManager() {
  const {
    subscriptions,
    activeSubscription,
    billingSummary,
    loading,
    error,
    cancelSubscription,
    reactivateSubscription,
    hasActiveSubscription,
    currentTierName,
    daysUntilRenewal,
    refreshSubscriptions,
    clearError
  } = usePaddleSubscription();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const success = await cancelSubscription(subscriptionId);
      if (success) {
        await refreshSubscriptions();
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    setIsProcessing(true);
    try {
      const success = await reactivateSubscription(subscriptionId);
      if (success) {
        await refreshSubscriptions();
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading your subscription details...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Subscription Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={clearError} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            {hasActiveSubscription ? 'Manage your active subscription' : 'No active subscription'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription && activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentTierName}</h3>
                  <p className="text-sm text-gray-600">
                    {activeSubscription.creditsAllocated} credits per month
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              {daysUntilRenewal !== null && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {daysUntilRenewal > 0
                    ? `${daysUntilRenewal} days until renewal`
                    : 'Renews today'
                  }
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Zap className="mr-2 h-4 w-4" />
                Credits remaining: {billingSummary?.creditsRemaining || 0}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active subscription</h3>
              <p className="mt-1 text-sm text-gray-500">
                Subscribe to unlock premium features and additional credits.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <a href="/pricing">View Plans</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Actions */}
      {hasActiveSubscription && activeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Update your plan or cancel your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upgrade Options */}
              <div>
                <h4 className="font-medium mb-2">Change Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['starter', 'pro', 'advanced'].map((tier) => (
                    <Button
                      key={tier}
                      variant={currentTierName?.toLowerCase() === tier ? "secondary" : "outline"}
                      className="justify-start"
                      onClick={() => {
                        // TODO: Implement upgrade flow
                        console.log(`Upgrade to ${tier}`);
                      }}
                      disabled={currentTierName?.toLowerCase() === tier}
                    >
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                    </Button>
                  ))}
                </div>
              </div>

              {/* Cancellation */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {activeSubscription.cancel_at_period_end
                    ? "Your subscription will end at the current billing period."
                    : "Cancel your subscription. You'll retain access until the end of your billing period."
                  }
                </p>

                {activeSubscription.cancel_at_period_end ? (
                  <Button
                    onClick={() => handleReactivateSubscription(activeSubscription.subscription_id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Processing...' : 'Reactivate Subscription'}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelSubscription(activeSubscription.subscription_id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {billingSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Your billing and payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Plan</p>
                <p className="text-lg font-semibold">{billingSummary.currentPlan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Credits Available</p>
                <p className="text-lg font-semibold">{billingSummary.creditsRemaining}</p>
              </div>
              {billingSummary.nextBillingDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(billingSummary.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Billing Cycle</p>
                <p className="text-lg font-semibold">
                  {billingSummary.isYearlyBilling ? 'Annual' : 'Monthly'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>Your past and current subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.subscription_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{subscription.tierName}</p>
                    <p className="text-sm text-gray-600">
                      Status: <Badge variant={subscription.subscription_status === 'active' ? 'secondary' : 'outline'}>
                        {subscription.subscription_status}
                      </Badge>
                    </p>
                    {subscription.nextBillingDate && (
                      <p className="text-sm text-gray-600">
                        Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">ID: {subscription.subscription_id.slice(-8)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
