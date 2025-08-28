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
 * Creates a complete AI generation job with business profile context
 * This is the main function the extension should use
 */
export async function createAIGenerationJob(
  reviewText: string,
  accessToken: string, // Add access token parameter
  options: {
    customPrompt?: string;
    tone?: string;
    maxLength?: number;
    userPreferences?: Record<string, unknown>;
  } = {}
): Promise<Response> {
  try {
    // First, try to fetch business profile
    const businessProfile = await fetchBusinessProfile(accessToken);
    
    // Create the job request
    const jobRequest = await createJobWithBusinessProfile(
      {
        reviewText,
        ...options
      },
      businessProfile || undefined
    );

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
