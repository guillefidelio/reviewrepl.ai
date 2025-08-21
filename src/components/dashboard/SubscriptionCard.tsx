'use client';

import { useState } from 'react';
import { usePaddle } from '@/lib/hooks/usePaddle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  Star, 
  Zap, 
  Settings, 
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react';

export function SubscriptionCard() {
  const { 
    subscription, 
    transactions, 
    loading, 
    error, 
    cancelSubscription,
    getCurrentPlan,
    getNextBillingDate,
    getRemainingCredits,
    isSubscriptionActive,
    clearError 
  } = usePaddle();
  
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setIsCanceling(true);
      const success = await cancelSubscription();
      if (success) {
        setShowCancelConfirm(false);
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
    } finally {
      setIsCanceling(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Zap className="h-5 w-5 text-green-500" />;
      case 'enthusiast':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'pro':
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'trialing':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 mb-3">{error}</p>
            <Button onClick={clearError} variant="outline" size="sm">
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {subscription ? (
          <>
            {/* Current Plan */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPlanIcon(subscription.planType)}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getCurrentPlan() || subscription.planType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {subscription.monthlyCredits} credits per month
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(subscription.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(subscription.status)}
                  {subscription.status.replace('_', ' ')}
                </span>
              </Badge>
            </div>

            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Next Billing</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(getNextBillingDate())}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Monthly Cost</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ${subscription.unitPrice.toFixed(2)}/{subscription.billingCycle.interval}
                </p>
              </div>
            </div>

            {/* Credits Usage */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Monthly Credits</span>
                <span className="text-sm text-gray-600">
                  {getRemainingCredits()} / {subscription.monthlyCredits}
                </span>
              </div>
              <Progress 
                value={(getRemainingCredits() / subscription.monthlyCredits) * 100} 
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                Credits reset on {formatDate(getNextBillingDate())}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
              
              {subscription.status === 'active' && (
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCanceling}
                >
                  {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md mx-4">
                  <h3 className="text-lg font-semibold mb-4">Cancel Subscription?</h3>
                  <p className="text-gray-600 mb-6">
                    Your subscription will remain active until the end of your current billing period. 
                    You can reactivate at any time.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1"
                    >
                      Keep Subscription
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      className="flex-1"
                    >
                      {isCanceling ? 'Canceling...' : 'Yes, Cancel'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Active Subscription */
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-600 mb-6">
              You&apos;re currently on the free plan. Upgrade to get more credits and features.
            </p>
            <Button className="w-full">
              View Plans
            </Button>
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.transactionType === 'subscription' 
                        ? 'Subscription Payment' 
                        : 'Credit Purchase'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(transaction.paidAt || null)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${transaction.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      +{transaction.creditsAllocated} credits
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {transactions.length > 3 && (
              <Button variant="outline" className="w-full mt-3">
                View All Transactions
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
