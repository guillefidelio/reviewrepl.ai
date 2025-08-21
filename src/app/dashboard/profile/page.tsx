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
        
        {/* Business Profile Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Business Information Required</h3>
              <p className="mt-1 text-sm text-blue-700">
                This information is needed to answer reviews using simple mode. Please fill it out and tweak it as much as needed until you&apos;re satisfied with the answers our AI model provides.
              </p>
            </div>
          </div>
        </div>
        
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
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Business Main Category</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.businessMainCategory || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Business Secondary Category</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.businessSecondaryCategory || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.language || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Country</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.country || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">State/Province</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.stateProvince || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Response Tone</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.responseTone || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Response Length</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.responseLength || 'Not set'}
                    </p>
                  </div>
                  
                  {businessProfile.businessTags && businessProfile.businessTags.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Business Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {businessProfile.businessTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Main Products or Services</label>
                    <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                      {businessProfile.mainProductsServices || 'Not set'}
                    </p>
                  </div>
                  
                  {businessProfile.briefDescription && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Brief Description</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.briefDescription}
                      </p>
                    </div>
                  )}
                  
                  {businessProfile.greetings && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Greetings</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.greetings}
                      </p>
                    </div>
                  )}
                  
                  {businessProfile.signatures && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Signatures</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.signatures}
                      </p>
                    </div>
                  )}
                  
                  {businessProfile.positiveReviewCTA && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Positive Review Call to Action</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.positiveReviewCTA}
                      </p>
                    </div>
                  )}
                  
                  {businessProfile.negativeReviewEscalation && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Negative Review Escalation</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.negativeReviewEscalation}
                      </p>
                    </div>
                  )}
                  
                  {businessProfile.brandVoiceNotes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Brand Voice Notes</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.brandVoiceNotes}
                      </p>
                    </div>
                  )}
                  
                  {businessProfile.otherConsiderations && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Other Considerations</label>
                      <p className="text-sm text-card-foreground bg-muted/50 px-3 py-2 rounded-md">
                        {businessProfile.otherConsiderations}
                      </p>
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
