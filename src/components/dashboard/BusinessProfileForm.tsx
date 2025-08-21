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
    // Essential Parameters
    businessName: '',
    businessType: 'Restaurant',
    businessTags: [],
    mainProductsServices: '',
    country: '',
    stateProvince: '',
    language: 'English',
    responseTone: 'Professional',
    
    // Useful Secondary Parameters
    responseLength: 'Standard',
    greetings: '',
    signatures: '',
    positiveReviewCTA: '',
    negativeReviewEscalation: '',
    
    // Advanced Options
    brandVoiceNotes: '',
    contactPreferences: {
      includePhone: false,
      includeEmail: false,
      includeWebsite: false,
      includeSocialMedia: false,
    },
    specialSituations: '',
  });

  const [errors, setErrors] = useState<Partial<BusinessProfileFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Initialize form with existing data if editing
  useEffect(() => {
    if (businessProfile) {
      setFormData({
        businessName: businessProfile.businessName || '',
        businessType: businessProfile.businessType || 'Restaurant',
        businessTags: businessProfile.businessTags || [],
        mainProductsServices: businessProfile.mainProductsServices || '',
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
        contactPreferences: businessProfile.contactPreferences || {
          includePhone: false,
          includeEmail: false,
          includeWebsite: false,
          includeSocialMedia: false,
        },
        specialSituations: businessProfile.specialSituations || '',
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
      newErrors.mainProductsServices = 'Main products or services is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.stateProvince.trim()) {
      newErrors.stateProvince = 'State/Province is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        await updateBusinessProfile(businessProfile.uid, formData);
      } else {
        await createBusinessProfile(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof BusinessProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle contact preferences changes
  const handleContactPreferenceChange = (preference: keyof typeof formData.contactPreferences, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      contactPreferences: {
        ...prev.contactPreferences,
        [preference]: checked,
      }
    }));
  };

  // Handle tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.businessTags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        businessTags: [...prev.businessTags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      businessTags: prev.businessTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isFormDisabled = isSubmitting || loading;
  const isCreating = !businessProfile;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Essential Parameters Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Essential Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="md:col-span-2">
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

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                Business Type *
              </label>
              <select
                id="businessType"
                required
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language *
              </label>
              <select
                id="language"
                required
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country *
              </label>
              <input
                id="country"
                type="text"
                required
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.country ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., United States"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            {/* State/Province */}
            <div>
              <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700">
                State/Province *
              </label>
              <input
                id="stateProvince"
                type="text"
                required
                value={formData.stateProvince}
                onChange={(e) => handleInputChange('stateProvince', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.stateProvince ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., California"
              />
              {errors.stateProvince && (
                <p className="mt-1 text-sm text-red-600">{errors.stateProvince}</p>
              )}
            </div>

            {/* Response Tone */}
            <div>
              <label htmlFor="responseTone" className="block text-sm font-medium text-gray-700">
                Response Tone *
              </label>
              <select
                id="responseTone"
                required
                value={formData.responseTone}
                onChange={(e) => handleInputChange('responseTone', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
              </select>
            </div>

            {/* Business Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.businessTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Main Products or Services */}
            <div className="md:col-span-2">
              <label htmlFor="mainProductsServices" className="block text-sm font-medium text-gray-700">
                Main Products or Services You Sell *
              </label>
              <textarea
                id="mainProductsServices"
                rows={3}
                required
                value={formData.mainProductsServices}
                onChange={(e) => handleInputChange('mainProductsServices', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mainProductsServices ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your main products or services..."
              />
              {errors.mainProductsServices && (
                <p className="mt-1 text-sm text-red-600">{errors.mainProductsServices}</p>
              )}
            </div>
          </div>
        </div>

        {/* Useful Secondary Parameters Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Useful Secondary Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Response Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Length
              </label>
              <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                {(['Brief', 'Standard', 'Detailed'] as const).map((length, index) => (
                  <button
                    key={length}
                    type="button"
                    onClick={() => handleInputChange('responseLength', length)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      formData.responseLength === length
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    } ${
                      index === 0 ? 'rounded-l-md' : ''
                    } ${
                      index === 2 ? 'rounded-r-md' : ''
                    } ${
                      index !== 0 && index !== 2 ? 'border-l border-gray-300' : ''
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            {/* Greetings */}
            <div>
              <label htmlFor="greetings" className="block text-sm font-medium text-gray-700">
                Greetings
              </label>
              <input
                id="greetings"
                type="text"
                value={formData.greetings}
                onChange={(e) => handleInputChange('greetings', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Thank you for your review"
              />
            </div>

            {/* Signatures */}
            <div>
              <label htmlFor="signatures" className="block text-sm font-medium text-gray-700">
                Signatures
              </label>
              <input
                id="signatures"
                type="text"
                value={formData.signatures}
                onChange={(e) => handleInputChange('signatures', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Best regards, [Business Name]"
              />
            </div>

            {/* Positive Review CTA */}
            <div className="md:col-span-2">
              <label htmlFor="positiveReviewCTA" className="block text-sm font-medium text-gray-700">
                Positive Review Call to Action
              </label>
              <textarea
                id="positiveReviewCTA"
                rows={2}
                value={formData.positiveReviewCTA}
                onChange={(e) => handleInputChange('positiveReviewCTA', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Invite customers back, follow on social media, test new products..."
              />
            </div>

            {/* Negative Review Escalation */}
            <div className="md:col-span-2">
              <label htmlFor="negativeReviewEscalation" className="block text-sm font-medium text-gray-700">
                Negative Review Escalation Procedure
              </label>
              <textarea
                id="negativeReviewEscalation"
                rows={2}
                value={formData.negativeReviewEscalation}
                onChange={(e) => handleInputChange('negativeReviewEscalation', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., How to handle complaints, mention of competitors, etc."
              />
            </div>
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-6">
              {/* Brand Voice Notes */}
              <div>
                <label htmlFor="brandVoiceNotes" className="block text-sm font-medium text-gray-700">
                  Brand Voice Notes
                </label>
                <textarea
                  id="brandVoiceNotes"
                  rows={3}
                  value={formData.brandVoiceNotes}
                  onChange={(e) => handleInputChange('brandVoiceNotes', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specific phrases, policies, or approaches the business wants to maintain..."
                />
              </div>

              {/* Contact Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Preferences
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(['includePhone', 'includeEmail', 'includeWebsite', 'includeSocialMedia'] as const).map((preference) => (
                    <label key={preference} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.contactPreferences[preference]}
                        onChange={(e) => handleContactPreferenceChange(preference, e.target.checked)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      {preference.replace('include', '').replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Situations */}
              <div>
                <label htmlFor="specialSituations" className="block text-sm font-medium text-gray-700">
                  Special Situations
                </label>
                <textarea
                  id="specialSituations"
                  rows={3}
                  value={formData.specialSituations}
                  onChange={(e) => handleInputChange('specialSituations', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How to handle complaints, mention of competitors, etc."
                />
              </div>
            </div>
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
