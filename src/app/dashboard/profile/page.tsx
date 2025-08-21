'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useBusinessProfile } from '@/lib/hooks/useBusinessProfile';
import { useState } from 'react';
import { UserProfileForm } from '@/components/dashboard/UserProfileForm';
import { BusinessProfileForm } from '@/components/dashboard/BusinessProfileForm';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { data: businessProfile, loading: businessLoading } = useBusinessProfile(user?.uid || '');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) {
    return null; // Will be handled by layout
  }

  const handlePersonalProfileUpdate = () => {
    setSuccessMessage('Personal profile updated successfully!');
    setShowSuccess(true);
    setIsEditingPersonal(false);
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleBusinessProfileUpdate = () => {
    setSuccessMessage('Business profile updated successfully!');
    setShowSuccess(true);
    setIsEditingBusiness(false);
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal and business information
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
              <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Personal Profile Section */}
      <div>
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Personal Information</h2>
        
        {isEditingPersonal ? (
          <UserProfileForm
            userProfile={userProfile}
            onCancel={() => setIsEditingPersonal(false)}
            onSuccess={handlePersonalProfileUpdate}
          />
        ) : (
          <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-card-foreground">Personal Details</h3>
                <button
                  onClick={() => setIsEditingPersonal(true)}
                  className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  Edit Profile
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
                  <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                    {userProfile?.firstName || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
                  <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                    {userProfile?.lastName || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                  <p className="text-sm text-card-foreground text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                    {user.email} (cannot be changed)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                  <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                    {userProfile?.phone || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Company</label>
                  <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                    {userProfile?.company || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Position</label>
                  <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                    {userProfile?.position || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Business Profile Section */}
      <div>
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Business Profile</h2>
        
        {isEditingBusiness ? (
          <BusinessProfileForm
            businessProfile={businessProfile}
            onCancel={() => setIsEditingBusiness(false)}
            onSuccess={handleBusinessProfileUpdate}
          />
        ) : (
          <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-card-foreground">Business Details</h3>
                <button
                  onClick={() => setIsEditingBusiness(true)}
                  className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  {businessProfile ? 'Edit Business Profile' : 'Create Business Profile'}
                </button>
              </div>
              
              {businessLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : businessProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Business Name</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.businessName || 'Not set'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Product/Service</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.productService || 'Not set'}
                    </p>
                  </div>
                  {businessProfile.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Industry</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.industry || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.location || 'Not set'}
                    </p>
                  </div>
                  {businessProfile.website && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Website</label>
                      <a
                        href={businessProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-500 bg-muted/50 px-3 py-2 rounded-md block"
                      >
                        {businessProfile.website}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No business profile</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your business profile.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsEditingBusiness(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Business Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
