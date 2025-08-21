'use client';

import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { UserProfileForm } from './UserProfileForm';

export function UserProfile() {
  const { user } = useAuth();
  const { data: userProfile, loading, error, isEditing, toggleEditMode, clearError } = useUserProfile(user?.uid || '');

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={toggleEditMode}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={clearError}
                    className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return <UserProfileForm userProfile={userProfile} onCancel={toggleEditMode} />;
  }

  if (!userProfile) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No profile found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your profile.</p>
          <div className="mt-6">
            <button
              onClick={toggleEditMode}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
        <button
          onClick={toggleEditMode}
          className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Profile
        </button>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <p className="mt-1 text-sm text-gray-900">{userProfile.firstName || 'Not provided'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <p className="mt-1 text-sm text-gray-900">{userProfile.lastName || 'Not provided'}</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{userProfile.email || 'Not provided'}</p>
        </div>

        {/* Phone */}
        {userProfile.phone && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{userProfile.phone}</p>
          </div>
        )}

        {/* Position */}
        {userProfile.position && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <p className="mt-1 text-sm text-gray-900">{userProfile.position}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {userProfile.createdAt.toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {userProfile.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
