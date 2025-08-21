'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBusinessProfile } from '@/lib/hooks/useBusinessProfile';
import { BusinessProfile, BusinessProfileFormData } from '@/lib/types';

interface BusinessProfileFormProps {
  businessProfile?: BusinessProfile | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function BusinessProfileForm({ businessProfile, onCancel, onSuccess }: BusinessProfileFormProps) {
  const { user } = useAuth();
  const { createBusinessProfile, updateBusinessProfile, loading } = useBusinessProfile(user?.uid || '');
  
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    businessName: '',
    productService: '',
    description: '',
    industry: '',
    website: '',
    location: '',
  });

  const [errors, setErrors] = useState<Partial<BusinessProfileFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (businessProfile) {
      setFormData({
        businessName: businessProfile.businessName || '',
        productService: businessProfile.productService || '',
        description: businessProfile.description || '',
        industry: businessProfile.industry || '',
        website: businessProfile.website || '',
        location: businessProfile.location || '',
      });
    }
  }, [businessProfile]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessProfileFormData> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.productService.trim()) {
      newErrors.productService = 'Product/Service description is required';
    }

    // Validate website URL if provided
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
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
        // Update existing business profile
        await updateBusinessProfile(businessProfile.uid, formData);
      } else {
        // Create new business profile
        await createBusinessProfile(formData);
      }
      // The real-time subscription will automatically update the state
      onSuccess(); // Call success callback after successful create/update
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

  const isFormDisabled = isSubmitting || loading;
  const isCreating = !businessProfile;

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name *
          </label>
          <input
            id="businessName"
            type="text"
            required
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.businessName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your business name"
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
          )}
        </div>

        {/* Product/Service */}
        <div>
          <label htmlFor="productService" className="block text-sm font-medium text-gray-700">
            Product/Service *
          </label>
          <input
            id="productService"
            type="text"
            required
            value={formData.productService}
            onChange={(e) => handleInputChange('productService', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.productService ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="What does your business do?"
          />
          {errors.productService && (
            <p className="mt-1 text-sm text-red-600">{errors.productService}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Business Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your business, mission, and what makes you unique"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Technology, Healthcare, Retail"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="City, State or Remote"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.website ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://yourbusiness.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isFormDisabled}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isCreating ? 'Create Business Profile' : 'Update Business Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
