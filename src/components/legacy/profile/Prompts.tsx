'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { PromptForm } from './PromptForm';

export function Prompts() {
  const { user } = useAuth();
  const {
    data: prompts,
    loading,
    error,
    isEditing,
    editingPromptId,
    toggleEditMode,
    clearError,
  } = usePrompts(user?.uid || '');

  // Debug: Log every render to see if component is re-rendering
  console.log('Prompts render:', { 
    promptsCount: prompts?.length || 0, 
    isEditing, 
    loading,
    editingPromptId,
    timestamp: Date.now()
  });

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Please log in to view your prompts</p>
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
          <p className="text-sm text-gray-500">Loading prompts...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Prompts</h3>
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
  if (isEditing && editingPromptId) {
    const editingPrompt = prompts?.find(p => p.id === editingPromptId);
    if (editingPrompt) {
      return (
        <PromptForm 
          prompt={editingPrompt}
          onCancel={() => toggleEditMode()}
        />
      );
    }
  }



  // Show prompts list
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pro Mode Prompts</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode:</span>
            <select 
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="pro"
              aria-label="Select prompt mode"
            >
              <option value="simple">Simple</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>
      </div>
      
      {!prompts || prompts.length === 0 ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">No Pro Mode Prompts Found</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Pro mode prompts will be available here. These are pre-configured prompts that you can customize but cannot delete.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Prompt {prompt.id}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      v{prompt.version}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ★ {prompt.rating.toFixed(1)}
                    </span>
                    {prompt.hasText && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Has Text
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="whitespace-pre-wrap line-clamp-3">{prompt.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {prompt.createdAt.toLocaleDateString()}</span>
                    <span>Updated: {prompt.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleEditMode(prompt.id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
