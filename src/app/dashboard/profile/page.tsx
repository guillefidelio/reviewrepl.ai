'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { UserProfileForm } from '@/components/dashboard/UserProfileForm';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user) {
    return null; // Will be handled by layout
  }

  const handleProfileUpdate = () => {
    setShowSuccess(true);
    setIsEditing(false);
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Profile updated successfully!</h3>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      {isEditing ? (
        <UserProfileForm
          userProfile={userProfile}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleProfileUpdate}
        />
      ) : (
        <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-card-foreground">Personal Information</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">First Name</label>
                <p className="mt-1 text-sm text-card-foreground">
                  {userProfile?.displayName?.split(' ')[0] || 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Last Name</label>
                <p className="mt-1 text-sm text-card-foreground">
                  {userProfile?.displayName?.split(' ').slice(1).join(' ') || 'Not set'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground">Email Address</label>
                <p className="mt-1 text-sm text-card-foreground text-muted-foreground">
                  {user.email} (cannot be changed)
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="mt-1 text-sm text-card-foreground">
                  {userProfile?.phone || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
