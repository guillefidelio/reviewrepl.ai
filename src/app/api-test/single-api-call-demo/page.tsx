'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createAIGenerationJob } from '@/lib/utils/jobUtils';
import { supabase } from '@/lib/supabase';

// Define proper types for the job response
interface JobResponse {
  success: boolean;
  job: {
    id: string;
    status: string;
    job_type: string;
    payload: {
      review_text: string;
      review_rating: number;
      mode: 'simple' | 'pro';
      reviewer_name?: string;
      business_profile?: Record<string, unknown>;
    };
  };
}

interface PayloadPreview {
  review_text: string;
  review_rating: number;
  mode: 'simple' | 'pro';
  reviewer_name?: string;
}

interface JobResults {
  id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  result?: {
    ai_response?: string;
  };
  error?: string;
  processing_time?: number;
}

export default function SingleApiCallDemoPage() {
  const { user, session } = useSupabaseAuth();
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [mode, setMode] = useState<'simple' | 'pro'>('simple');
  const [isLoading, setIsLoading] = useState(false);
  const [jobResponse, setJobResponse] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobResults, setJobResults] = useState<JobResults | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');

  if (!user) {
    return (
      <div className="p-6">
        <p>Please log in to view this demo.</p>
      </div>
    );
  }

  const handleCreateJob = async () => {
    if (!reviewText.trim()) {
      setError('Please enter review text');
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setError('Please select a valid rating (1-5 stars)');
      return;
    }

    if (!session?.access_token) {
      setError('No access token available. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setJobResponse(null);
    setJobResults(null);
    setFetchError(null);
    setPollingStatus('');

    try {
      const response = await createAIGenerationJob(reviewText, session.access_token, {
        userPreferences: {
          mode,
          reviewerName: reviewerName.trim() || undefined,
          reviewRating: reviewRating
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setJobResponse(data);
        setPollingStatus('🔄 Starting automatic polling for results...');
        // Automatically start polling for results
        startPollingForResults(data.job.id);
      } else {
        setError(data.error || 'Failed to create job');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const startPollingForResults = async (jobId: string) => {
    console.log('🔄 Starting automatic polling for job results:', jobId);
    
    // Poll every 2 seconds for up to 2 minutes
    const maxAttempts = 60; // 2 minutes
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      attempts++;
      setPollingStatus(`🔄 Polling for results... (Attempt ${attempts}/${maxAttempts})`);
      
      try {
        // Get the current session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          clearInterval(pollInterval);
          setFetchError('Session expired. Please log in again.');
          setPollingStatus('❌ Session expired');
          return;
        }

        // Fetch the job results directly from the database using Supabase client
        const { data: { user: currentUser } } = await supabase.auth.getUser(session.access_token);
        
        if (!currentUser) {
          clearInterval(pollInterval);
          setFetchError('User not found');
          setPollingStatus('❌ User not found');
          return;
        }

        // Use Supabase client to fetch job
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', currentUser.id)
          .single();

        if (jobError) {
          console.error('Error fetching job:', jobError);
          // Continue polling on individual errors
          return;
        }

        if (job) {
          console.log('📊 Job status update:', job.status);
          
          // Calculate processing time if job is completed
          let processingTime = undefined;
          if (job.completed_at && job.created_at) {
            const created = new Date(job.created_at).getTime();
            const completed = new Date(job.completed_at).getTime();
            processingTime = completed - created;
          }

          // Update the job results
          const jobResult = {
            id: job.id,
            status: job.status,
            created_at: job.created_at,
            completed_at: job.completed_at,
            result: job.result,
            error: job.error,
            processing_time: processingTime
          };

          setJobResults(jobResult);
          
          // If job is completed or failed, stop polling
          if (job.status === 'completed' || job.status === 'failed' || job.error) {
            console.log('✅ Job completed, stopping polling');
            clearInterval(pollInterval);
            setPollingStatus('✅ Results received!');
            
            if (job.status === 'completed' && job.result) {
              console.log('🎯 AI Response received:', job.result);
            }
          }
          
          // Stop polling if we've reached max attempts
          if (attempts >= maxAttempts) {
            console.log('⏰ Max polling attempts reached');
            clearInterval(pollInterval);
            setFetchError('Job is taking longer than expected. Check the worker status.');
            setPollingStatus('⏰ Max attempts reached');
          }
        }
        
      } catch (err) {
        console.error('Error polling for results:', err);
        // Don't stop polling on individual errors, just log them
      }
    }, 200); // Poll every 2 seconds
    
    // Store the interval ID so we can clear it if needed
    return () => clearInterval(pollInterval);
  };

  const getPayloadPreview = (): string => {
    const payload: PayloadPreview = {
      review_text: reviewText || '[Review text will go here]',
      review_rating: reviewRating,
      mode: mode,
    };

    if (reviewerName.trim()) {
      payload.reviewer_name = reviewerName;
    }

    return JSON.stringify(payload, null, 2);
  };

  const getRatingDescription = (rating: number) => {
    if (rating <= 2) return 'Negative (1-2 stars)';
    if (rating === 3) return 'Neutral (3 stars)';
    return 'Positive (4-5 stars)';
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-card-foreground">Mode-Based Prompt Selection Demo</h1>
        <p className="text-muted-foreground">
          Test both modes: Simple (business profile optimized with automatic tone/length) and Pro (rating-based custom prompts)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Job Creation Input</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your mode and the server will automatically handle tone, length, and all business profile settings!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Answering Mode *</label>
              <div className="flex space-x-2">
                <Button
                  variant={mode === 'simple' ? 'default' : 'outline'}
                  onClick={() => setMode('simple')}
                  size="sm"
                >
                  Simple Mode
                </Button>
                <Button
                  variant={mode === 'pro' ? 'default' : 'outline'}
                  onClick={() => setMode('pro')}
                  size="sm"
                >
                  Pro Mode
                </Button>
              </div>
                          <p className="text-xs text-muted-foreground mt-1">
              {mode === 'simple' 
                ? 'Simple Mode: Uses business profile settings (tone, length, greetings, signatures, CTA) to generate optimized system prompts'
                : 'Pro Mode: Uses rating-based custom prompts from prompts table (edited in SAAS website) with minimal business context'
              }
            </p>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review-text" className="text-sm font-medium mb-2 block">Review Text *</label>
              <Textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Enter the customer review text..."
                rows={4}
                aria-label="Customer review text"
              />
            </div>

            {/* Reviewer Name */}
            <div>
              <label htmlFor="reviewer-name" className="text-sm font-medium mb-2 block">Reviewer Name (Optional)</label>
              <input
                id="reviewer-name"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter customer&apos;s name for personal addressing..."
                className="w-full p-2 border rounded-md"
                aria-label="Customer reviewer name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The AI will address the customer by name when appropriate for a more personal response
              </p>
            </div>

            {/* Review Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Review Rating *</label>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl ${
                        star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                      aria-label={`${star} star rating`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className={`font-medium ${getRatingColor(reviewRating)}`}>
                  {getRatingDescription(reviewRating)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === 'simple' 
                  ? 'Rating helps with response tone and approach'
                  : 'Rating determines which custom prompt to use from prompts table (1-2, 3, or 4-5 stars)'
                }
              </p>
            </div>

            <Button 
              onClick={handleCreateJob} 
              disabled={!reviewText.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Job...' : 'Create AI Generation Job'}
            </Button>
          </CardContent>
        </Card>

        {/* Payload Preview */}
        <Card>
          <CardHeader>
            <CardTitle>What the Extension Sends</CardTitle>
            <p className="text-sm text-muted-foreground">
              Now includes mode selection for intelligent prompt handling!
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {getPayloadPreview()}
              </pre>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p><strong>Key Benefits:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>✅ Single API call instead of two</li>
                <li>✅ Mode-based prompt selection</li>
                <li>✅ Simple Mode: Business profile optimized prompts (tone, length, greetings, signatures, CTA)</li>
                <li>✅ Pro Mode: Rating-based custom prompts from prompts table with minimal business context</li>
                <li>✅ Personal addressing with customer names</li>
                <li>✅ Server automatically handles everything</li>
                <li>✅ No more redundant tone/length settings - uses business profile as single source of truth</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Response */}
      {jobResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Job Created Successfully!</CardTitle>
            <p className="text-sm text-muted-foreground">
              The server automatically handled prompt selection based on your mode choice
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Job Details:</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <p><strong>Job ID:</strong> {jobResponse.job.id}</p>
                  <p><strong>Status:</strong> <Badge variant="default">{jobResponse.job.status}</Badge></p>
                  <p><strong>Type:</strong> {jobResponse.job.job_type}</p>
                  <p><strong>Mode:</strong> <Badge variant={jobResponse.job.payload.mode === 'pro' ? 'default' : 'secondary'}>{jobResponse.job.payload.mode}</Badge></p>
                  <p><strong>Review Rating:</strong> {jobResponse.job.payload.review_rating} stars</p>
                  {jobResponse.job.payload.reviewer_name && (
                    <p><strong>Reviewer Name:</strong> {jobResponse.job.payload.reviewer_name}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Enhanced Payload (Server Added Business Profile & Selected Prompt):</h4>
                <div className="bg-muted p-3 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs font-mono">
                    {JSON.stringify(jobResponse.job.payload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p><strong>Notice:</strong> The server automatically:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Added the business_profile field</li>
                  <li>Selected prompt strategy based on your mode choice</li>
                  <li>Created a complete system prompt for the AI</li>
                  <li>Included personal addressing instructions if reviewer name is provided</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response Results - Now Automatic! */}
      {jobResponse && (
        <Card>
          <CardHeader>
            <CardTitle>🤖 AI Response Results (Automatic!)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Results are automatically fetched - no button pressing needed!
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Polling Status */}
              {pollingStatus && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">{pollingStatus}</p>
                </div>
              )}

              {jobResults && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Job Status:</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p><strong>Status:</strong> <Badge variant={jobResults.status === 'completed' ? 'default' : 'secondary'}>{jobResults.status}</Badge></p>
                      <p><strong>Created:</strong> {new Date(jobResults.created_at).toLocaleString()}</p>
                      {jobResults.completed_at && (
                        <p><strong>Completed:</strong> {new Date(jobResults.completed_at).toLocaleString()}</p>
                      )}
                      {jobResults.processing_time && (
                        <p><strong>Processing Time:</strong> {jobResults.processing_time}ms</p>
                      )}
                    </div>
                  </div>

                  {jobResults.result && (
                    <div>
                      <h4 className="font-medium mb-2">🎯 AI Generated Response:</h4>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-800 whitespace-pre-wrap">
                          {jobResults.result.ai_response || 'Response generated but content not available'}
                        </div>
                        
                        {/* Display additional metadata if available */}
                        {jobResults.result && typeof jobResults.result === 'object' && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                              {Object.entries(jobResults.result).map(([key, value]) => (
                                <div key={key}>
                                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {jobResults.error && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">❌ Error:</h4>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-800">{jobResults.error}</p>
                      </div>
                    </div>
                  )}

                  {!jobResults.result && !jobResults.error && jobResults.status === 'completed' && (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>Job completed but no result found. Check the database directly.</p>
                    </div>
                  )}

                  {jobResults.status === 'pending' && (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>Job is still being processed. Results will appear automatically when ready.</p>
                    </div>
                  )}
                </div>
              )}

              {fetchError && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{fetchError}</p>
                </div>
              )}

              {!jobResults && !fetchError && pollingStatus && (
                <div className="text-center p-4 text-muted-foreground">
                  <p>Waiting for job to complete... This usually takes 10-30 seconds.</p>
                  <p className="text-xs mt-1">Make sure your worker is running: <code>npm run worker:dev</code></p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 p-4 rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How the Mode System Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Mode-Based Prompt Selection Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">Simple Mode</div>
                <h4 className="font-medium mb-2 text-blue-800">Business Profile Optimized</h4>
                <p className="text-sm text-blue-700">
                  Uses business profile data to generate intelligent, contextual system prompts
                </p>
                <div className="mt-2 text-xs text-blue-600">
                  <p>• Business context & guidelines</p>
                  <p>• Response tone & style</p>
                  <p>• Brand voice & characteristics</p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-2">Pro Mode</div>
                <h4 className="font-medium mb-2 text-green-800">Rating-Based Custom Prompts</h4>
                <p className="text-sm text-green-700">
                  Uses rating-specific custom prompts from prompts table (edited in SAAS website)
                </p>
                <div className="mt-2 text-xs text-green-600">
                  <p>• 1-2 Stars: Custom prompts for negative reviews</p>
                  <p>• 3 Stars: Custom prompts for neutral reviews</p>
                  <p>• 4-5 Stars: Custom prompts for positive reviews</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">The Magic:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• <strong>Extension sends:</strong> Review text + rating + mode + reviewer name</li>
                <li>• <strong>Server automatically:</strong> Fetches business profile</li>
                <li>• <strong>Server intelligently selects:</strong> Prompt strategy based on mode</li>
                <li>• <strong>Simple Mode:</strong> Business profile optimized prompts</li>
                <li>• <strong>Pro Mode:</strong> Rating-based custom prompts from prompts table</li>
                <li>• <strong>Result:</strong> Perfectly tailored responses for your chosen approach</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Important Note:</h4>
              <p className="text-sm text-yellow-800">
                <strong>Pro Mode Custom Prompts:</strong> These are configured in the SAAS website prompts management interface, 
                not in the Chrome extension. The extension only sends the mode choice and rating - the server automatically 
                fetches the appropriate custom prompt from the prompts table based on the review rating.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
