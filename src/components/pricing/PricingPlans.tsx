'use client';

import { useState } from 'react';
import { usePaddle, usePaddlePlans } from '@/lib/hooks/usePaddle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';

export function PricingPlans() {
  const { createSubscription, subscription, loading, error } = usePaddle();
  const { getPlanInfo, plans } = usePaddlePlans();
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscriptionSelect = async (planName: keyof typeof plans) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setSelectedPlan(planName);
      
      const checkout = await createSubscription(planName);
      if (checkout?.status === 'pending') {
        // Paddle checkout opens in a new tab/window (redirect mode)
        // The user will be redirected to Paddle's secure checkout page
        console.log('Checkout initiated successfully - redirecting to Paddle');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
    } finally {
      setIsProcessing(false);
    }
  };



  const isCurrentPlan = (planName: keyof typeof plans) => {
    return subscription?.planType === planName && subscription?.status === 'active';
  };

  const getPlanIcon = (planName: keyof typeof plans) => {
    switch (planName) {
      case 'free':
        return <Zap className="h-6 w-6 text-green-500" />;
      case 'enthusiast':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />;
      default:
        return <Zap className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPlanFeatures = (planName: keyof typeof plans) => {
    const baseFeatures = [
      'AI-powered review responses',
      'Business profile management',
      'Response customization',
      'Email support',
    ];

    switch (planName) {
      case 'free':
        return [
          ...baseFeatures,
          '10 credits per month',
          'Basic response templates',
          'Standard response time',
          'Community support',
        ];
      case 'enthusiast':
        return [
          ...baseFeatures,
          '50 credits per month',
          'Advanced response templates',
          'Priority response time',
          'Analytics dashboard',
          'Custom branding',
          'Priority support',
        ];
      case 'pro':
        return [
          ...baseFeatures,
          '150 credits per month',
          'Premium response templates',
          'Instant response time',
          'Advanced analytics',
          'Custom branding',
          'Dedicated support',
          'API access',
          'White-label options',
        ];
      default:
        return baseFeatures;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get the perfect plan for your business needs. Start with our free tier or upgrade to unlock more features and credits.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Subscription Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(plans).map(([planName, plan]) => {
            const planInfo = getPlanInfo(planName as keyof typeof plans);
            if (!planInfo) return null;

            const isCurrent = isCurrentPlan(planName as keyof typeof plans);
            const isPopular = planName === 'enthusiast';

            return (
              <Card 
                key={planName} 
                className={`relative ${isPopular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${
                  isCurrent ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                    Current Plan
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(planName as keyof typeof plans)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{planInfo.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    Perfect for {planName === 'free' ? 'individuals and small businesses' : 
                               planName === 'enthusiast' ? 'growing businesses and teams' : 'enterprises and agencies'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{planInfo.formattedPrice}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      {planInfo.credits} credits per month
                    </p>
                    <p className="text-xs text-gray-500">
                      {planInfo.formattedPricePerCredit} per credit
                    </p>
                  </div>

                  <ul className="space-y-3 text-left">
                    {getPlanFeatures(planName as keyof typeof plans).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button
                    onClick={() => handleSubscriptionSelect(planName as keyof typeof plans)}
                    disabled={isProcessing || isCurrent}
                    className={`w-full ${
                      isCurrent 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {isCurrent 
                      ? 'Current Plan' 
                      : isProcessing && selectedPlan === planName 
                      ? 'Processing...' 
                      : 'Get Started'
                    }
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>




      {/* FAQ Section */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan at any time?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your subscription plan at any time. Changes will take effect at the next billing cycle.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What happens to unused credits?
            </h3>
            <p className="text-gray-600">
              Credits from subscriptions reset monthly. Unused credits from the previous month are replaced with your new monthly allocation.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600">
              Yes! All new users get 10 free credits to try out our service. No credit card required to start.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I cancel my subscription?
            </h3>
            <p className="text-gray-600">
              You can cancel your subscription at any time from your dashboard. You&apos;ll continue to have access until the end of your current billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
