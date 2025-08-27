'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabaseBusinessProfile } from '@/lib/hooks/useSupabaseBusinessProfile';
import { BusinessProfileForm } from './BusinessProfileForm';

export function BusinessProfile() {
  const { user } = useSupabaseAuth();
  const {
    data: businessProfile,
    loading,
    error,
    createBusinessProfile,
    updateBusinessProfile,
    clearError,
  } = useSupabaseBusinessProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debug: Log every render to see if component is re-rendering
  console.log('BusinessProfile render:', { 
    businessProfile: businessProfile ? { businessName: businessProfile.business_name, uid: businessProfile.id } : null, 
    isEditing, 
    isCreating, 
    loading,
    timestamp: Date.now()
  });



  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Please log in to view your business profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Loading business profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Business Profile</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show edit form if editing
  if (isEditing) {
    return (
      <BusinessProfileForm 
        businessProfile={businessProfile}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  // Show create form if creating
  if (isCreating) {
    return (
      <BusinessProfileForm 
        businessProfile={null}
        onCancel={() => setIsCreating(false)}
        onSuccess={() => setIsCreating(false)}
      />
    );
  }

  // Show create form if no profile exists
  if (!businessProfile && !isCreating) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">No Business Profile Found</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You haven&apos;t set up your business profile yet. Create one to get started!</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Business Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show business profile data
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <p className="mt-1 text-sm text-gray-900">{businessProfile?.business_name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Products/Services</label>
          <p className="mt-1 text-sm text-gray-900">{businessProfile?.main_products_services}</p>
        </div>

        {businessProfile?.brief_description && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{businessProfile.brief_description}</p>
          </div>
        )}

        {businessProfile?.business_main_category && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <p className="mt-1 text-sm text-gray-900">{businessProfile.business_main_category}</p>
          </div>
        )}

        {businessProfile?.country && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-sm text-gray-900">{businessProfile.country}, {businessProfile.state_province}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Created</label>
          <p className="mt-1 text-sm text-gray-900">
            {businessProfile?.created_at ? new Date(businessProfile.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Updated</label>
          <p className="mt-1 text-sm text-gray-900">
            {businessProfile?.updated_at ? new Date(businessProfile.updated_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
