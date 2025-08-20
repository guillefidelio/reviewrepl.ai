'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

export function AccountSettingsCard() {
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-medium text-card-foreground">
            Account Settings
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Manage your profile and subscription
        </p>

        <div className="bg-muted rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-card-foreground">Current Plan</div>
              <div className="text-sm text-muted-foreground">Free Plan</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>

        <Link 
          href="/dashboard/profile"
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Account
        </Link>

        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <div>• Update billing information</div>
          <div>• Change subscription plan</div>
        </div>
      </div>
    </div>
  );
}
