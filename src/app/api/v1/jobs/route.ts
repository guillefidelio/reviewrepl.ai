import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api/auth-middleware';
import { createClient } from '@supabase/supabase-js';
import { CreateJobRequest, JobResponse, JobsListResponse } from '@/lib/types/jobs';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createJobHandler(request: AuthenticatedRequest) {
  try {
    // User is already authenticated at this point
    const { user } = request;
    
    // Parse the request body
    const body: CreateJobRequest = await request.json();
    
    // Validate required fields
    if (!body.job_type || !body.payload) {
      return NextResponse.json(
        { error: 'job_type and payload are required' },
        { status: 400 }
      );
    }

    console.log('Creating job for user:', user.id);
    console.log('Job type:', body.job_type);
    console.log('Payload:', body.payload);

    // Determine credits required based on job type
    const creditsRequired = getCreditsRequired(body.job_type);

    // Create the job with credit consumption in a single atomic transaction
    const { data: result, error } = await supabase
      .rpc('create_job_with_credit_consumption', {
        p_user_id: user.id,
        p_job_type: body.job_type,
        p_payload: body.payload,
        p_credits_required: creditsRequired
      });

    if (error) {
      console.error('Supabase error creating job:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create job',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Check the result from our function
    if (result && result.length > 0) {
      const jobResult = result[0];
      
      if (!jobResult.success) {
        // Handle specific error cases
        if (jobResult.error_code === 'INSUFFICIENT_CREDITS') {
          return NextResponse.json(
            { 
              error: 'Insufficient credits',
              details: `You have ${jobResult.credits_remaining} credits, but ${creditsRequired} are required`,
              credits_remaining: jobResult.credits_remaining,
              credits_required: creditsRequired
            },
            { status: 402 } // Payment Required
          );
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to create job',
            details: jobResult.message,
            code: jobResult.error_code
          },
          { status: 400 }
        );
      }

      // Job created successfully
      console.log('Job created successfully with credit consumption');
      console.log('Credits remaining:', jobResult.credits_remaining);

      // Return success response with job details
      const response: JobResponse = {
        success: true,
        job: {
          id: jobResult.job_id,
          user_id: user.id,
          status: 'pending',
          job_type: body.job_type,
          payload: body.payload,
          result: null,
          error: null,
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      return NextResponse.json(response, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Unexpected response format' },
      { status: 500 }
    );

  } catch (error) {
    console.error('API error in createJobHandler:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function listJobsHandler(request: AuthenticatedRequest) {
  try {
    // User is already authenticated at this point
    const { user } = request;
    
    console.log('Listing jobs for user:', user.id);

    // Get jobs for the authenticated user
    // We temporarily disable RLS since we're using service role key and have already validated the user
    const { data: jobs, error } = await supabase
      .rpc('list_jobs_with_rls_bypass', {
        p_user_id: user.id
      });

    if (error) {
      console.error('Supabase error listing jobs:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch jobs',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('Jobs retrieved successfully:', jobs?.length || 0, 'jobs');

    // Return the jobs list
    const response: JobsListResponse = {
      success: true,
      jobs: jobs || [],
      total: jobs?.length || 0
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error in listJobsHandler:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
// Helper function to determine credits required for different job types
function getCreditsRequired(jobType: string): number {
  switch (jobType) {
    case 'ai_generation':
      return 1; // Basic AI generation
    case 'review_processing':
      return 1; // Review analysis
    case 'prompt_analysis':
      return 1; // Prompt optimization
    case 'sentiment_analysis':
      return 1; // Sentiment analysis
    default:
      return 1; // Default credit cost
  }
}

// Export the protected handlers
export const POST = withAuth(createJobHandler);
export const GET = withAuth(listJobsHandler);

