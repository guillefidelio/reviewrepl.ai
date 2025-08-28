import { CreateJobRequest, JOB_TYPES } from '@/lib/types/jobs';

export interface JobCreationOptions {
  reviewText: string;
  customPrompt?: string;
  tone?: string;
  maxLength?: number;
  userPreferences?: Record<string, unknown>;
}

export interface JobWithBusinessProfile extends CreateJobRequest {
  business_profile?: Record<string, unknown>;
}

/**
 * Creates a job request with business profile data
 * This is typically used by the extension to create AI generation jobs
 */
export async function createJobWithBusinessProfile(
  options: JobCreationOptions,
  businessProfile?: Record<string, unknown>
): Promise<JobWithBusinessProfile> {
  const { reviewText, customPrompt, tone, maxLength, userPreferences } = options;

  const jobRequest: JobWithBusinessProfile = {
    job_type: JOB_TYPES.AI_GENERATION,
    payload: {
      review_text: reviewText,
      tone: tone || 'professional',
      max_length: maxLength || 150,
      user_preferences: userPreferences || {},
      ...(businessProfile && { business_profile: businessProfile }),
      ...(customPrompt && { custom_prompt: customPrompt })
    }
  };

  return jobRequest;
}

/**
 * Fetches business profile data for the current user
 * This can be called by the extension before creating a job
 */
export async function fetchBusinessProfile(accessToken: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch('/api/v1/me/business-profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // No business profile found
        return null;
      }
      throw new Error(`Failed to fetch business profile: ${response.status}`);
    }

    const data = await response.json();
    return data.business_profile || null;
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return null;
  }
}

/**
 * Fetches custom prompt based on review rating for Pro mode
 */
export async function fetchCustomPrompt(accessToken: string, rating: number): Promise<string | null> {
  try {
    console.log('🔍 DEBUG: fetchCustomPrompt called with rating:', rating);
    
    // First, get the current user's ID from the access token
    // We need to decode the JWT or make a call to get user info
    const userResponse = await fetch('/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!userResponse.ok) {
      console.log('🔍 DEBUG: fetchCustomPrompt user response not ok:', userResponse.status);
      return null;
    }

    const userData = await userResponse.json();
    const userId = userData.user?.id;
    
    if (!userId) {
      console.log('🔍 DEBUG: No user ID found in response:', userData);
      return null;
    }

    console.log('🔍 DEBUG: User ID:', userId);
    
    // Now fetch the custom prompt from the prompts table
    const promptResponse = await fetch(`/api/v1/me/prompts?rating=${rating}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!promptResponse.ok) {
      console.log('🔍 DEBUG: fetchCustomPrompt prompt response not ok:', promptResponse.status);
      return null;
    }

    const promptData = await promptResponse.json();
    console.log('🔍 DEBUG: Prompt response data:', promptData);
    
    // Find the prompt that matches the rating
    let promptField: string | null = null;
    
    if (rating <= 2) {
      // For 1-2 stars, look for negative review prompt
      const negativePrompt = promptData.prompts?.find((p: any) => 
        p.content.toLowerCase().includes('negative review') || p.content.toLowerCase().includes('bad review')
      );
      promptField = negativePrompt?.content || null;
      console.log('🔍 DEBUG: Using negative review prompt:', promptField ? 'Found' : 'Not found');
    } else if (rating === 3) {
      // For 3 stars, look for neutral review prompt
      const neutralPrompt = promptData.prompts?.find((p: any) => 
        p.content.toLowerCase().includes('neutral review') || p.content.toLowerCase().includes('3 star')
      );
      promptField = neutralPrompt?.content || null;
      console.log('🔍 DEBUG: Using neutral review prompt:', promptField ? 'Found' : 'Not found');
    } else {
      // For 4-5 stars, look for positive review prompt
      const positivePrompt = promptData.prompts?.find((p: any) => 
        p.content.toLowerCase().includes('positive review') || p.content.toLowerCase().includes('good review')
      );
      promptField = positivePrompt?.content || null;
      console.log('🔍 DEBUG: Using positive review prompt:', promptField ? 'Found' : 'Not found');
    }

    return promptField;
  } catch (error) {
    console.error('Error fetching custom prompt:', error);
    return null;
  }
}

/**
 * Creates a complete AI generation job with business profile context
 * This is the main function the extension should use
 */
export async function createAIGenerationJob(
  reviewText: string,
  accessToken: string,
  options: {
    customPrompt?: string;
    tone?: string;
    maxLength?: number;
    userPreferences?: Record<string, unknown>;
  } = {}
): Promise<Response> {
  try {
    const { userPreferences } = options;
    const mode = userPreferences?.mode as 'simple' | 'pro';
    const rating = userPreferences?.reviewRating as number;
    
    console.log('🔍 DEBUG: createAIGenerationJob called with:', { mode, rating, userPreferences });
    
    let businessProfile: Record<string, unknown> | null = null;
    let customPrompt: string | undefined = undefined;

    if (mode === 'simple') {
      // For Simple mode: fetch business profile and use it
      console.log('🔍 DEBUG: Simple mode - fetching business profile');
      businessProfile = await fetchBusinessProfile(accessToken);
      console.log('🔍 DEBUG: Business profile fetched:', businessProfile ? 'Yes' : 'No');
    } else if (mode === 'pro') {
      // For Pro mode: fetch the actual custom prompt from prompts table
      console.log('🔍 DEBUG: Pro mode - fetching custom prompt for rating:', rating);
      if (rating) {
        customPrompt = await fetchCustomPrompt(accessToken, rating) || undefined;
        console.log('🔍 DEBUG: Custom prompt fetched:', customPrompt ? `"${customPrompt.substring(0, 50)}..."` : 'No');
        
        if (!customPrompt) {
          console.log('🔍 DEBUG: WARNING: No custom prompt found for Pro mode! This will fall back to generic prompt.');
        }
      } else {
        console.log('🔍 DEBUG: No rating provided for Pro mode');
      }
      // Don't include business profile for Pro mode
    }
    
    console.log('🔍 DEBUG: Final values - businessProfile:', businessProfile ? 'Yes' : 'No', 'customPrompt:', customPrompt ? 'Yes' : 'No');
    
    // Create the job request
    const jobRequest = await createJobWithBusinessProfile(
      {
        reviewText,
        ...options,
        customPrompt
      },
      businessProfile || undefined
    );

    console.log('🔍 DEBUG: Job request payload:', JSON.stringify(jobRequest.payload, null, 2));

    // Submit the job with authorization header
    const response = await fetch('/api/v1/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobRequest),
    });

    return response;
  } catch (error) {
    console.error('Error creating AI generation job:', error);
    throw error;
  }
}

/**
 * Helper function to determine if a custom prompt indicates pro mode
 */
export function isProMode(customPrompt?: string): boolean {
  return Boolean(customPrompt && customPrompt.trim().length > 0);
}

/**
 * Helper function to get the appropriate prompt type based on content
 */
export function getPromptType(customPrompt?: string): 'positive' | 'neutral' | 'negative' | 'general' {
  if (!customPrompt) return 'general';
  
  const lowerPrompt = customPrompt.toLowerCase();
  
  if (lowerPrompt.includes('negative review') || lowerPrompt.includes('bad review')) {
    return 'negative';
  } else if (lowerPrompt.includes('positive review') || lowerPrompt.includes('good review')) {
    return 'positive';
  } else if (lowerPrompt.includes('neutral review')) {
    return 'neutral';
  }
  
  return 'general';
}
