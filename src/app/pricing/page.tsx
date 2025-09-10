import { Metadata } from 'next';
import { PricingCards } from '@/components/pricing/pricing-cards';

export const metadata: Metadata = {
  title: 'Pricing | ReviewReplier - AI-Powered Review Management',
  description: 'Choose the perfect plan for your AI-powered review response system. Get started with automated customer review management today.',
  keywords: 'review management, AI reviews, customer service, pricing, subscription',
  openGraph: {
    title: 'Choose Your Plan | ReviewReplier',
    description: 'Transform your customer reviews with AI-powered responses. Choose the plan that fits your business.',
    type: 'website',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PricingCards />
    </div>
  );
}
