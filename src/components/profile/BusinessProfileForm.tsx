'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBusinessProfile } from '@/lib/hooks/useBusinessProfile';
import { BusinessProfile, BusinessProfileFormData } from '@/lib/types';

interface BusinessProfileFormProps {
  businessProfile?: BusinessProfile | null;
  onCancel: () => void;
}

export function BusinessProfileForm({ businessProfile, onCancel }: BusinessProfileFormProps) {
  const { user } = useAuth();
  const { createBusinessProfile, updateBusinessProfile, isCreating, loading } = useBusinessProfile(user?.uid || '');
  
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    businessName: '',
    businessMainCategory: 'Restaurant',
    businessSecondaryCategory: '',
    businessTags: [],
    mainProductsServices: '',
    briefDescription: '',
    country: '',
    stateProvince: '',
    language: 'English',
    responseTone: 'Professional',
    responseLength: 'Standard',
    greetings: '',
    signatures: '',
    positiveReviewCTA: '',
    negativeReviewEscalation: '',
    brandVoiceNotes: '',
    otherConsiderations: '',
  });

  const [errors, setErrors] = useState<Partial<BusinessProfileFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (businessProfile) {
      setFormData({
        businessName: businessProfile.businessName,
        businessMainCategory: businessProfile.businessMainCategory,
        businessSecondaryCategory: businessProfile.businessSecondaryCategory || '',
        businessTags: businessProfile.businessTags || [],
        mainProductsServices: businessProfile.mainProductsServices || '',
        briefDescription: businessProfile.briefDescription || '',
        country: businessProfile.country || '',
        stateProvince: businessProfile.stateProvince || '',
        language: businessProfile.language || 'English',
        responseTone: businessProfile.responseTone || 'Professional',
        responseLength: businessProfile.responseLength || 'Standard',
        greetings: businessProfile.greetings || '',
        signatures: businessProfile.signatures || '',
        positiveReviewCTA: businessProfile.positiveReviewCTA || '',
        negativeReviewEscalation: businessProfile.negativeReviewEscalation || '',
        brandVoiceNotes: businessProfile.brandVoiceNotes || '',
        otherConsiderations: businessProfile.otherConsiderations || '',
      });
    }
  }, [businessProfile]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessProfileFormData> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.mainProductsServices.trim()) {
      newErrors.mainProductsServices = 'Products/services description is required';
    }

    if (!formData.briefDescription.trim()) {
      newErrors.briefDescription = 'Business description is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simple URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (businessProfile) {
        // Update existing profile
        await updateBusinessProfile(businessProfile.uid, formData);
        // The real-time subscription will automatically update the state
        // No need to manually update state here
        onCancel(); // Close the form after successful update
      } else {
        // Create new profile
        await createBusinessProfile(formData);
        // The real-time subscription will automatically update the state
        onCancel(); // Close the form after successful creation
      }
    } catch (error) {
      console.error('Error saving business profile:', error);
      // Error is handled by the hook and displayed in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof BusinessProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormDisabled = isSubmitting || loading || isCreating;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {businessProfile ? 'Edit Business Profile' : 'Create Business Profile'}
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
        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.businessName ? 'border-red-300' : ''
            }`}
            placeholder="Enter your business name"
            disabled={isFormDisabled}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
          )}
        </div>

        {/* Main Products/Services */}
        <div>
          <label htmlFor="mainProductsServices" className="block text-sm font-medium text-gray-700">
            Main Products/Services <span className="text-red-500">*</span>
          </label>
          <textarea
            id="mainProductsServices"
            value={formData.mainProductsServices}
            onChange={(e) => handleInputChange('mainProductsServices', e.target.value)}
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.mainProductsServices ? 'border-red-300' : ''
            }`}
            placeholder="Describe what products or services you offer"
            disabled={isFormDisabled}
          />
          {errors.mainProductsServices && (
            <p className="mt-1 text-sm text-red-600">{errors.mainProductsServices}</p>
          )}
        </div>

        {/* Business Description */}
        <div>
          <label htmlFor="briefDescription" className="block text-sm font-medium text-gray-700">
            Business Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="briefDescription"
            value={formData.briefDescription}
            onChange={(e) => handleInputChange('briefDescription', e.target.value)}
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.briefDescription ? 'border-red-300' : ''
            }`}
            placeholder="Additional details about your business"
            disabled={isFormDisabled}
          />
          {errors.briefDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.briefDescription}</p>
          )}
        </div>

        {/* Business Category */}
        <div>
          <label htmlFor="businessMainCategory" className="block text-sm font-medium text-gray-700">
            Business Category
          </label>
          <select
            id="businessMainCategory"
            value={formData.businessMainCategory}
            onChange={(e) => handleInputChange('businessMainCategory', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isFormDisabled}
          >
            <option value="Restaurant">Restaurant</option>
            <option value="Retail Store">Retail Store</option>
            <option value="Medical/Healthcare">Medical/Healthcare</option>
            <option value="Auto Service">Auto Service</option>
            <option value="Beauty/Salon">Beauty/Salon</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Hotel/Lodging">Hotel/Lodging</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.country ? 'border-red-300' : ''
            }`}
            placeholder="Your country"
            disabled={isFormDisabled}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        {/* State/Province */}
        <div>
          <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700">
            State/Province
          </label>
          <input
            type="text"
            id="stateProvince"
            value={formData.stateProvince}
            onChange={(e) => handleInputChange('stateProvince', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Your state or province"
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
                Saving...
              </div>
            ) : businessProfile ? (
              'Update Profile'
            ) : (
              'Create Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
