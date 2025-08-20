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
  
  const [formData, setFormData] = useState<{ content: string }>({
    content: '',
  });

  const [errors, setErrors] = useState<{ content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    setFormData({
      content: prompt.content,
    });
  }, [prompt]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: { content?: string } = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required';
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
      // Only update the content field, preserve other fields
      await updatePrompt(prompt.id, {
        content: formData.content,
        hasText: prompt.hasText,
        rating: prompt.rating,
        version: prompt.version,
      });
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
  const handleInputChange = (field: 'content', value: string) => {
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
          Edit Prompt Content
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
