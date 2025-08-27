'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabaseUserProfile, type UserProfile } from '@/lib/hooks/useSupabaseUserProfile';

interface UserProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
}

interface UserProfileFormProps {
  userProfile?: UserProfile | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function UserProfileForm({ userProfile, onCancel, onSuccess }: UserProfileFormProps) {
  const { user } = useSupabaseAuth();
  const { createUserProfile, updateUserProfile, loading } = useSupabaseUserProfile();
  
  const [formData, setFormData] = useState<UserProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  });

  const [errors, setErrors] = useState<Partial<UserProfileFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        company: userProfile.company || '',
        position: userProfile.position || '',
      });
    } else if (user) {
      // Initialize with user's email when creating new profile
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [userProfile, user]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<UserProfileFormData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simple email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (userProfile) {
        // Update existing profile
        await updateUserProfile(formData);
      } else {
        // Create new profile
        await createUserProfile(formData);
      }
      // The real-time subscription will automatically update the state
      // No need to manually update state here
      onSuccess(); // Close the form after successful create/update
    } catch (error) {
      console.error('Error saving user profile:', error);
      // Error is handled by the hook and displayed in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormDisabled = isSubmitting || loading;
  const isCreating = !userProfile;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isCreating ? 'Create User Profile' : 'Edit User Profile'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={isFormDisabled}
          aria-label="Close form"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.first_name ? 'border-red-300' : ''
            }`}
            placeholder="Enter your first name"
            disabled={isFormDisabled}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.last_name ? 'border-red-300' : ''
            }`}
            placeholder="Enter your last name"
            disabled={isFormDisabled}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.email ? 'border-red-300' : ''
            }`}
            placeholder="Enter your email address"
            disabled={isFormDisabled}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter your phone number"
            disabled={isFormDisabled}
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter your company name"
            disabled={isFormDisabled}
          />
        </div>

        {/* Position */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            id="position"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter your job title"
            disabled={isFormDisabled}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isFormDisabled}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFormDisabled}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCreating ? 'Creating...' : 'Saving...'}
              </div>
            ) : (
              isCreating ? 'Create Profile' : 'Update Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
