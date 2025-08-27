'use client';

import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import Link from 'next/link';

export default function SupabaseTestPage() {
  const { user, session, loading, error } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Supabase Connection Test
          </h1>
          <p className="text-lg text-gray-600">
            Testing the Supabase authentication and database connection
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Authentication Status
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <span className="font-medium text-gray-700">Loading State:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'Loading' : 'Ready'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <span className="font-medium text-gray-700">Session Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                session ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {session ? 'Active' : 'No Session'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <span className="font-medium text-gray-700">User Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              User Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">User ID:</span>
                <span className="text-sm text-gray-600 font-mono">{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Email Verified:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.email_confirmed_at ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Created At:</span>
                <span className="text-sm text-gray-600">
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Next Steps
          </h2>
          <div className="space-y-4">
            {!user ? (
              <div className="space-y-3">
                <p className="text-gray-600">
                  To test the authentication system:
                </p>
                <div className="space-y-2">
                  <Link 
                    href="/supabase-login"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go to Login/Signup Page
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Great! You&apos;re authenticated. Now you can:
                </p>
                <div className="space-y-2">
                  <Link 
                    href="/dashboard"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
