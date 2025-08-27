'use client';

import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabaseCredits } from '@/lib/hooks/useSupabaseCredits';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChromeExtensionCard } from '@/components/dashboard/ChromeExtensionCard';
import { AccountSettingsCard } from '@/components/dashboard/AccountSettingsCard';

export default function DashboardPage() {
  const { user } = useSupabaseAuth();
  const { balance, loading: creditsLoading } = useSupabaseCredits();

  if (!user) {
    return null; // Will be handled by layout
  }

  const displayName = user?.user_metadata?.first_name && user?.user_metadata?.last_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
    : user?.email?.split('@')[0] || 'User';
  
  // Calculate credit usage percentage
  const creditUsage = balance.total > 0 ? ((balance.total - balance.available) / balance.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Welcome back, {displayName}!
          </h2>
          <p className="text-muted-foreground">
            Manage your AI-powered review replies and track your usage.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Available Credits"
          value={creditsLoading ? "..." : balance.available.toString()}
          subtitle={`${balance.total - balance.available} used of ${balance.total} total`}
          icon="💳"
          progress={creditUsage}
        />
        <StatsCard
          title="Reviews Responded"
          value="0"
          subtitle="This month"
          icon="📊"
        />
        <StatsCard
          title="You are using"
          value="SIMPLE"
          subtitle="mode"
          icon="📈"
        />
        <StatsCard
          title="Current Plan"
          value={creditsLoading ? "..." : (balance.total >= 100 ? "Professional" : balance.total >= 50 ? "Starter" : "Free")}
          subtitle=""
          icon="🕐"
        />
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChromeExtensionCard />
        <AccountSettingsCard />
      </div>
    </div>
  );
}
