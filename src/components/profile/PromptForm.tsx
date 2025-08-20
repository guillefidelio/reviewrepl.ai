'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { Prompt, PromptFormData } from '@/lib/types';

interface PromptFormProps {
  prompt: Prompt; // Required since we only allow editing
  onCancel: () => void;
}

export function PromptForm({ prompt, onCancel }: PromptFormProps) {
  const { user } = useAuth();
  const { updatePrompt, loading } = usePrompts(user?.uid || '');
  
  const [formData, setFormData] = useState<PromptFormData>({
    content: '',
    hasText: false,
    rating: 0,
    version: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PromptFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    setFormData({
      content: prompt.content,
      hasText: prompt.hasText,
      rating: prompt.rating,
      version: prompt.version,
    });
  }, [prompt]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PromptFormData, string>> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required';
    }

    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Rating must be between 0 and 10';
    }

    if (formData.version < 1) {
      newErrors.version = 'Version must be at least 1';
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
      await updatePrompt(prompt.id, formData);
      // The real-time subscription will automatically update the state
      onCancel(); // Close the form after successful update
    } catch (error) {
      console.error('Error saving prompt:', error);
      // Error is handled by the hook and displayed in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof PromptFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormDisabled = isSubmitting || loading;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit Pro Mode Prompt
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
        {/* Prompt Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Prompt Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={8}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.content ? 'border-red-300' : ''
            }`}
            placeholder="Enter your prompt content here..."
            disabled={isFormDisabled}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This is the actual prompt content that will be used by your AI system.
          </p>
        </div>

        {/* Has Text Checkbox */}
        <div>
          <div className="flex items-center">
            <input
              id="hasText"
              type="checkbox"
              checked={formData.hasText}
              onChange={(e) => handleInputChange('hasText', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isFormDisabled}
            />
            <label htmlFor="hasText" className="ml-2 block text-sm text-gray-700">
              Has Text Content
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Check this if the prompt contains text content.
          </p>
        </div>

        {/* Rating */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
            Rating (0-10)
          </label>
          <input
            type="number"
            id="rating"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.rating ? 'border-red-300' : ''
            }`}
            placeholder="0.0"
            disabled={isFormDisabled}
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Rate this prompt from 0 to 10 based on its effectiveness.
          </p>
        </div>

        {/* Version */}
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="number"
            id="version"
            min="1"
            step="1"
            value={formData.version}
            onChange={(e) => handleInputChange('version', parseInt(e.target.value) || 1)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.version ? 'border-red-300' : ''
            }`}
            placeholder="1"
            disabled={isFormDisabled}
          />
          {errors.version && (
            <p className="mt-1 text-sm text-red-600">{errors.version}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Version number for this prompt (starts at 1).
          </p>
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
            ) : (
              'Update Prompt'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
