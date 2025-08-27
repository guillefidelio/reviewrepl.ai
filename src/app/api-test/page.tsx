'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { JOB_TYPES } from '@/lib/types/jobs';

export default function ApiTestPage() {
  const { user, session } = useSupabaseAuth();
  const [apiResponse, setApiResponse] = useState<{
    status: string;
    data: Record<string, unknown>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobType, setJobType] = useState<typeof JOB_TYPES[keyof typeof JOB_TYPES]>(JOB_TYPES.AI_GENERATION);
  const [jobPayload, setJobPayload] = useState('{"review_text": "Great service!", "tone": "friendly"}');

  const testApi = async () => {
    if (!session?.access_token) {
      setError('No access token available. Please log in first.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch('/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
      } else {
        setError(`API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testUnauthorized = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch('/api/v1/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        setApiResponse({ status: 'Unauthorized (Expected)', data });
      } else {
        setError(`Expected 401 but got ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async () => {
    if (!session?.access_token) {
      setError('No access token available. Please log in first.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      let payload;
      try {
        payload = JSON.parse(jobPayload);
      } catch {
        setError('Invalid JSON in payload field');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_type: jobType,
          payload: payload
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse({ status: 'Job Created Successfully', data });
      } else {
        setError(`Job Creation Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const listJobs = async () => {
    if (!session?.access_token) {
      setError('No access token available. Please log in first.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch('/api/v1/jobs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse({ status: 'Jobs Retrieved Successfully', data });
      } else {
        setError(`Jobs Retrieval Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
          <p className="text-muted-foreground">Please log in to test the API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">API Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Has Access Token:</strong> {session?.access_token ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testApi}
                disabled={loading || !session?.access_token}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : 'Test Authenticated Request'}
              </button>
              
              <button
                onClick={testUnauthorized}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : 'Test Unauthorized Request'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {apiResponse && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-medium">API Response:</p>
                <pre className="text-green-700 text-sm overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Job Management</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as typeof JOB_TYPES[keyof typeof JOB_TYPES])}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  aria-label="Select job type"
                >
                  <option value={JOB_TYPES.AI_GENERATION}>AI Generation</option>
                  <option value={JOB_TYPES.REVIEW_PROCESSING}>Review Processing</option>
                  <option value={JOB_TYPES.PROMPT_ANALYSIS}>Prompt Analysis</option>
                  <option value={JOB_TYPES.SENTIMENT_ANALYSIS}>Sentiment Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Payload (JSON)
                </label>
                <textarea
                  value={jobPayload}
                  onChange={(e) => setJobPayload(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder='{"key": "value"}'
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={createJob}
                disabled={loading || !session?.access_token}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Test Job'}
              </button>
              
              <button
                onClick={listJobs}
                disabled={loading || !session?.access_token}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'List My Jobs'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What This Tests:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>✅ JWT token extraction from Authorization header</li>
            <li>✅ Token validation using Supabase service role key</li>
            <li>✅ Protected endpoint access with valid tokens</li>
            <li>✅ Proper error handling for invalid/missing tokens</li>
            <li>✅ User information returned for authenticated requests</li>
            <li>✅ Job creation with proper user isolation (RLS)</li>
            <li>✅ Job retrieval with user-specific filtering</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
