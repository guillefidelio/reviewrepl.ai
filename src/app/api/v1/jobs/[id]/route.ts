import { NextResponse } from 'next/server';
import { withAuthForDynamicRoute, AuthenticatedRequest } from '@/lib/api/auth-middleware';
import { createClient } from '@supabase/supabase-js';
import { Job, JobResponse } from '@/lib/types/jobs';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': 'chrome-extension://*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

async function getJobByIdHandler(request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // User is already authenticated at this point
    const { user } = request;

    // Extract job ID from params - Next.js 15 guarantees this is available for dynamic routes
    const { id: jobId } = await context.params;

    console.log('Getting job by ID for user:', user.id, 'Job ID:', jobId);

    // Validate job ID
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Job ID is required' },
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Fetch the job directly (using service role key bypasses RLS)
    // Since we're using service role key, RLS is bypassed automatically
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Supabase error fetching job:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch job',
          details: error.message,
          code: error.code
        },
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Check if job exists and belongs to the user
    if (!job) {
      console.log('Job not found or does not belong to user:', jobId);
      return NextResponse.json(
        { error: 'Job not found' },
        {
          status: 404,
          headers: corsHeaders
        }
      );
    }

    const jobData = job as Job;

    console.log('Job retrieved successfully:', {
      id: jobData.id,
      status: jobData.status,
      job_type: jobData.job_type,
      created_at: jobData.created_at
    });

    // Return the job data
    const response: JobResponse = {
      success: true,
      job: jobData
    };

    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('API error in getJobByIdHandler:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Export the protected handler
export const GET = withAuthForDynamicRoute(getJobByIdHandler);
