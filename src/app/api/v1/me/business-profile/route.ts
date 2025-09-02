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

async function getBusinessProfileHandler(request: AuthenticatedRequest) {
  try {
    // User is already authenticated at this point
    const { user } = request;
    
    console.log('Fetching business profile for user:', user.id);

    // Get business profile for the authenticated user
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { 
            success: false,
            error: 'Business profile not found',
            code: 'PROFILE_NOT_FOUND'
          },
          { 
            status: 404,
            headers: corsHeaders
          }
        );
      }
      
      console.error('Supabase error fetching business profile:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch business profile',
          details: error.message,
          code: error.code
        },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    console.log('Business profile retrieved successfully');

    // Return the business profile
    return NextResponse.json({
      success: true,
      business_profile: profile
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('API error in getBusinessProfileHandler:', error);
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
export const GET = withAuth(getBusinessProfileHandler);

