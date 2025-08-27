import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side auth validation
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
}

export async function authenticateRequest(request: NextRequest): Promise<NextResponse | AuthenticatedRequest> {
  try {
    // Extract the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Validate the JWT token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token validation error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Token is valid, attach user to request and return modified request
    const authenticatedRequest = request as AuthenticatedRequest;
    
    // Ensure required user properties exist
    if (!user.email || !user.created_at) {
      return NextResponse.json(
        { error: 'User profile incomplete' },
        { status: 400 }
      );
    }
    
    authenticatedRequest.user = {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    };

    return authenticatedRequest;

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to create a protected API handler
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      // Authentication failed, return the error response
      return authResult;
    }
    
    // Authentication succeeded, call the handler with authenticated request
    return handler(authResult);
  };
}
