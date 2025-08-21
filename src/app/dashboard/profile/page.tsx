'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useBusinessProfile } from '@/lib/hooks/useBusinessProfile';
import { useState } from 'react';
import { UserProfileForm } from '@/components/dashboard/UserProfileForm';
import { BusinessProfileForm } from '@/components/dashboard/BusinessProfileForm';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { data: businessProfile, loading: businessLoading } = useBusinessProfile(user?.uid || '');
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
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
    <div className="space-y-6">
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'business'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Business Profile
          </button>
        </nav>
      </div>

      {/* Personal Profile Tab */}
      {activeTab === 'personal' && (
        <div>
          {isEditingPersonal ? (
            <UserProfileForm
              userProfile={userProfile}
              onCancel={() => setIsEditingPersonal(false)}
              onSuccess={handlePersonalProfileUpdate}
            />
          ) : (
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-card-foreground">Personal Information</h3>
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">First Name</label>
                    <p className="mt-1 text-sm text-card-foreground">
                      {userProfile?.firstName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Last Name</label>
                    <p className="mt-1 text-sm text-card-foreground">
                      {userProfile?.lastName || 'Not set'}
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground">Company</label>
                    <p className="mt-1 text-sm text-card-foreground">
                      {userProfile?.company || 'Not set'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground">Position</label>
                    <p className="mt-1 text-sm text-card-foreground">
                      {userProfile?.position || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Business Profile Tab */}
      {activeTab === 'business' && (
        <div>
          {isEditingBusiness ? (
            <BusinessProfileForm
              businessProfile={businessProfile}
              onCancel={() => setIsEditingBusiness(false)}
              onSuccess={handleBusinessProfileUpdate}
            />
          ) : (
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-card-foreground">Business Profile</h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground">Business Name</label>
                      <p className="mt-1 text-sm text-card-foreground">
                        {businessProfile.businessName || 'Not set'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground">Product/Service</label>
                      <p className="mt-1 text-sm text-card-foreground">
                        {businessProfile.productService || 'Not set'}
                      </p>
                    </div>
                    {businessProfile.description && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Description</label>
                        <p className="mt-1 text-sm text-card-foreground">
                          {businessProfile.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">Industry</label>
                      <p className="mt-1 text-sm text-card-foreground">
                        {businessProfile.industry || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">Location</label>
                      <p className="mt-1 text-sm text-card-foreground">
                        {businessProfile.location || 'Not set'}
                      </p>
                    </div>
                    {businessProfile.website && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Website</label>
                        <a
                          href={businessProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-500"
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
      )}
    </div>
  );
}
