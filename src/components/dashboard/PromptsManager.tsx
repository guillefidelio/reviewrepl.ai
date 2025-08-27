'use client';

import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabasePrompts } from '@/lib/hooks/useSupabasePrompts';

import { PromptForm } from './PromptForm';

export function PromptsManager() {
  const { user } = useSupabaseAuth();
  const { data: prompts, loading, error, isEditing, editingPromptId, toggleEditMode, clearError } = useSupabasePrompts();

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
        <div className="space-y-6">
          {/* Pro Mode Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Pro Mode Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You are in pro mode. You are about to edit a System prompt that will be sent to our AI model along with the review data. This means the model will follow whatever instruction you give (eg: Tone, voice, catch phrases, etc.)</p>
                </div>
              </div>
            </div>
          </div>

          <PromptForm 
            prompt={editingPrompt}
            onCancel={() => toggleEditMode()}
          />
        </div>
      );
    }
  }



  // Show prompts list
  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Pro Mode Prompts</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800 leading-relaxed">
                In this mode, you are the one telling our AI model how to act and respond to reviews. 
                This includes setting the tone, explaining what your business is about, ways to greet, etc.{' '}
                <span className="font-medium">If you need help, visit our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline font-semibold">prompting guide</a>
                {' '}or our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline font-semibold">prompt generator</a>.</span>
              </p>
            </div>
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
            <div key={prompt.id} className={`border border-gray-200 rounded-lg p-4 ${
              prompt.content.includes('negative review') ? 'bg-red-50/30' :
              prompt.content.includes('neutral review') ? 'bg-gray-50/30' :
              prompt.content.includes('positive review') ? 'bg-green-50/30' :
              'bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`text-sm font-medium ${
                      prompt.content.includes('negative review') ? 'text-red-600' :
                      prompt.content.includes('neutral review') ? 'text-gray-700' :
                      prompt.content.includes('positive review') ? 'text-green-600' :
                      'text-gray-900'
                    }`}>
                      {prompt.content.includes('negative review') ? '👎 Bad Reviews Answering Prompt' :
                       prompt.content.includes('neutral review') ? '😐 Neutral Reviews Answering Prompt' :
                       prompt.content.includes('positive review') ? '👍 Good Reviews Answering Prompt' :
                       `Prompt ${prompt.id}`}
                    </h4>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="whitespace-pre-wrap line-clamp-3">{prompt.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {new Date(prompt.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
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
