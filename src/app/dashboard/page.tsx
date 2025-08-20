'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChromeExtensionCard } from '@/components/dashboard/ChromeExtensionCard';
import { AccountSettingsCard } from '@/components/dashboard/AccountSettingsCard';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();

  if (!user) {
    return null; // Will be handled by layout
  }

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'User';

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
          value="0"
          subtitle="0 used of 0 total"
          icon="💳"
          progress={0}
        />
        <StatsCard
          title="Reviews Responded"
          value="0"
          subtitle="This month"
          icon="📊"
        />
        <StatsCard
          title="You are using"
          value={userProfile?.answeringMode?.selectedMode?.toUpperCase() || "SIMPLE"}
          subtitle="mode"
          icon="📈"
        />
        <StatsCard
          title="Current Plan"
          value="Pro"
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
