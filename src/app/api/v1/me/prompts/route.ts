import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api/auth-middleware';
import { createClient } from '@supabase/supabase-js';

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

async function getPromptsHandler(request: AuthenticatedRequest) {
  try {
    // User is already authenticated at this point
    const { user } = request;
    
    console.log('Fetching prompts for user:', user.id);

    // Get the rating query parameter if provided
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');

    // Fetch prompts for the current user
    let query = supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id);

    // If rating is provided, filter by rating
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum <= 2) {
        // For 1-2 stars, get negative review prompts
        query = query.filter('content', 'ilike', '%negative review%');
      } else if (ratingNum === 3) {
        // For 3 stars, get neutral review prompts
        query = query.filter('content', 'ilike', '%neutral review%');
      } else {
        // For 4-5 stars, get positive review prompts
        query = query.filter('content', 'ilike', '%positive review%');
      }
    }

    const { data: prompts, error: fetchError } = await query.order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Supabase error fetching prompts:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch prompts',
          details: fetchError.message,
          code: fetchError.code
        },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    console.log('Prompts retrieved successfully:', prompts?.length || 0);

    // Return the prompts
    return NextResponse.json({
      success: true,
      prompts: prompts || [],
      user_id: user.id,
      total: prompts?.length || 0
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('API error in getPromptsHandler:', error);
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
export const GET = withAuth(getPromptsHandler);
