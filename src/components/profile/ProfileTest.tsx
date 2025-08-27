'use client';

import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabaseUserProfile } from '@/lib/hooks/useSupabaseUserProfile';
import { useState } from 'react';

export function ProfileTest() {
  const { 
    user, 
    loading, 
    error, 
    clearError
  } = useSupabaseAuth();
  
  const { 
    data: userProfile, 
    loading: profileLoading, 
    error: profileError, 
    clearError: clearProfileError, 
    fetchUserProfile 
  } = useSupabaseUserProfile();
  
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runProfileTests = async () => {
    setTestResults([]);
    addResult('🚀 Starting profile functionality tests...');

    // Test 1: Authentication state
    if (user) {
      addResult('✅ User is authenticated');
      addResult(`📧 User email: ${user.email}`);
      addResult(`🆔 User UID: ${user.id}`);
    } else {
      addResult('❌ User is not authenticated');
      return;
    }

    // Test 2: Loading states
    if (loading) {
      addResult('⏳ Authentication is still loading');
    } else {
      addResult('✅ Authentication loading completed');
    }

    if (profileLoading) {
      addResult('⏳ Profile data is still loading');
    } else {
      addResult('✅ Profile loading completed');
    }

    // Test 3: Profile data
    if (userProfile) {
      addResult('✅ User profile data loaded successfully');
      addResult(`👤 Display name: ${userProfile.first_name || 'Not set'}`);
      addResult(`📱 Phone: ${userProfile.phone || 'Not provided'}`);
      addResult(`📅 Created: ${userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}`);
      addResult(`🔄 Updated: ${userProfile.updated_at ? new Date(userProfile.updated_at).toLocaleDateString() : 'N/A'}`);
    } else {
      addResult('⚠️ User profile data not available');
    }

    // Test 4: Error states
    if (error) {
      addResult(`⚠️ Authentication error: ${error}`);
    } else {
      addResult('✅ No authentication errors');
    }

    if (profileError) {
      addResult(`⚠️ Profile error: ${profileError}`);
    } else {
      addResult('✅ No profile errors');
    }

    // Test 5: Profile refresh functionality
    addResult('🔄 Testing profile refresh functionality...');
    try {
      await fetchUserProfile();
      addResult('✅ Profile refresh function executed successfully');
    } catch (err) {
      addResult(`❌ Profile refresh failed: ${err}`);
    }

    addResult('🎉 Profile functionality tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };



  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Please log in to test profile functionality</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Functionality Test</h3>
      
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Current State</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium">Auth Loading:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {loading ? 'Loading' : 'Complete'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Profile Loading:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${profileLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {profileLoading ? 'Loading' : 'Complete'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Profile Data:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${userProfile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {userProfile ? 'Available' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Errors:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${error || profileError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {error || profileError ? 'Present' : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
            <div className="space-y-2">
              <button
                onClick={runProfileTests}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Run Profile Tests
              </button>
              <button
                onClick={fetchUserProfile}
                className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Refresh Profile
              </button>
              <button
                onClick={clearResults}
                className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Results
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">Auth Error: {error}</span>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">Profile Error: {profileError}</span>
              <button
                onClick={clearProfileError}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
        <h4 className="font-medium text-gray-900 mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Click &quot;Run Profile Tests&quot; to begin.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>What this tests:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Authentication state and loading</li>
          <li>Profile data loading and availability</li>
          <li>Error handling and recovery</li>
          <li>Profile refresh functionality</li>
          <li>State management consistency</li>
        </ul>
      </div>
    </div>
  );
}
