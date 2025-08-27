'use client';

import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabaseAnsweringMode } from '@/lib/hooks/useSupabaseAnsweringMode';
import { PromptsManager } from '@/components/dashboard/PromptsManager';


export default function PromptsPage() {
  const { user } = useSupabaseAuth();
  const { selectedMode, updateMode, loading, error, clearError } = useSupabaseAnsweringMode();

  if (!user) {
    return null; // Will be handled by layout
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-card-foreground">Answering Mode</h1>
        <p className="text-muted-foreground">
          Choose how you want to respond to reviews - let our AI handle it automatically or customize your own templates.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error updating answering mode</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Simple Mode Card */}
        <div 
          className={`
            transition-all duration-200 rounded-xl border-2 p-6
            ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${selectedMode === 'simple' 
              ? 'border-primary bg-primary/5 shadow-lg scale-105' 
              : 'border-border bg-card hover:border-muted-foreground/30 hover:scale-[1.02]'
            }
          `}
          onClick={() => !loading && updateMode('simple')}
        >
          <div className="text-center">
            <div className={`
              mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4
              ${selectedMode === 'simple' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${selectedMode === 'simple' ? 'text-primary' : 'text-card-foreground'}`}>
              Simple Mode
            </h3>
            <p className="text-muted-foreground mb-4">
              Let our AI automatically generate appropriate responses based on review sentiment. Perfect for getting started quickly.
            </p>
            {selectedMode === 'simple' && (
              <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                ✓ Currently Active
              </div>
            )}
          </div>
        </div>

        {/* Pro Mode Card */}
        <div 
          className={`
            transition-all duration-200 rounded-xl border-2 p-6
            ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${selectedMode === 'pro' 
              ? 'border-primary bg-primary/5 shadow-lg scale-105' 
              : 'border-border bg-card hover:border-muted-foreground/30 hover:scale-[1.02]'
            }
          `}
          onClick={() => !loading && updateMode('pro')}
        >
          <div className="text-center">
            <div className={`
              mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4
              ${selectedMode === 'pro' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${selectedMode === 'pro' ? 'text-primary' : 'text-card-foreground'}`}>
              Pro Mode
            </h3>
            <p className="text-muted-foreground mb-4">
              Customize your own response templates and control exactly how your AI responds to different types of reviews.
            </p>
            {selectedMode === 'pro' && (
              <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                ✓ Currently Active
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Content */}
      {selectedMode === 'simple' ? (
        <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              You are using Simple Mode
            </h3>
                           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                 Our AI will automatically generate appropriate responses based on your business profile and review sentiment. 
                 You don&apos;t need to configure anything else - just let our system handle the responses for you.
               </p>
            <div className="mt-6 p-4 bg-muted rounded-lg max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                <strong>What this means:</strong> When you are using simple mode and press &quot;answer with AI&quot; button our AI will analyze the sentiment 
                and automatically generate a professional, appropriate response without any manual configuration needed.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <PromptsManager />
      )}
    </div>
  );
}
