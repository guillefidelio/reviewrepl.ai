import { BusinessProfile } from '@/lib/hooks/useSupabaseBusinessProfile';

export interface SystemPromptContext {
  businessProfile: BusinessProfile;
  reviewType?: 'positive' | 'neutral' | 'negative';
  customPrompt?: string;
  mode: 'simple' | 'pro';
}

export function generateSystemPrompt(context: SystemPromptContext): string {
  const { businessProfile, reviewType, customPrompt, mode } = context;
  
  // Base business context
  const businessContext = generateBusinessContext(businessProfile);
  
  if (mode === 'simple') {
    return generateSimpleModePrompt(businessContext, businessProfile);
  } else {
    return generateProModePrompt(businessContext, businessProfile, reviewType, customPrompt);
  }
}

function generateBusinessContext(profile: BusinessProfile): string {
  const location = [profile.state_province, profile.country].filter(Boolean).join(', ');
  
  return `Business Context:
- Business Name: ${profile.business_name}
- Category: ${profile.business_main_category}${profile.business_secondary_category ? ` / ${profile.business_secondary_category}` : ''}
- Location: ${location}
- Language: ${profile.language}
- Main Products/Services: ${profile.main_products_services}
- Brief Description: ${profile.brief_description}
- Business Tags: ${profile.business_tags.join(', ')}`;
}

function generateSimpleModePrompt(businessContext: string, profile: BusinessProfile): string {
  return `You are an expert customer experience specialist and professional business representative.

${businessContext}

Response Guidelines:
- Tone: ${profile.response_tone}
- Length: ${profile.response_length}
- Greetings: ${profile.greetings}
- Signatures: ${profile.signatures}
- Brand Voice Notes: ${profile.brand_voice_notes}

Your task is to generate a professional, empathetic response to a customer review that:
1. Acknowledges the customer's feedback
2. Addresses their specific concerns or appreciation
3. Maintains the business's ${profile.response_tone} tone
4. Uses appropriate greetings and signatures
5. Incorporates the business's unique characteristics and values
6. Stays within the specified ${profile.response_length} length
7. Includes relevant call-to-action when appropriate

Always be authentic, professional, and aligned with the business's brand voice.`;
}

function generateProModePrompt(
  businessContext: string, 
  profile: BusinessProfile, 
  reviewType?: 'positive' | 'neutral' | 'negative',
  customPrompt?: string
): string {
  const basePrompt = `You are an expert customer experience specialist and professional business representative.

${businessContext}

Response Guidelines:
- Tone: ${profile.response_tone}
- Length: ${profile.response_length}
- Greetings: ${profile.greetings}
- Signatures: ${profile.signatures}
- Brand Voice Notes: ${profile.brand_voice_notes}`;

  // Add review type specific context
  const reviewTypeContext = reviewType ? `\nReview Type: ${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)} Review` : '';
  
  // Add custom prompt if provided
  const customInstructions = customPrompt ? `\n\nCustom Instructions:\n${customPrompt}` : '';

  return `${basePrompt}${reviewTypeContext}

Your task is to generate a response following the custom instructions provided while maintaining:
1. Professional business representation
2. Alignment with the business's brand voice and tone
3. Appropriate use of greetings and signatures
4. Consistency with the business's values and characteristics${customInstructions}

Follow the custom instructions precisely while ensuring the response remains professional and on-brand.`;
}

// Helper function to get the appropriate system prompt for a specific use case
export function getSystemPromptForJob(
  businessProfile: BusinessProfile | Record<string, unknown>,
  jobType: string,
  customPrompt?: string
): string {
  // Convert Record<string, unknown> to BusinessProfile if needed
  const profile = businessProfile as BusinessProfile;
  
  // Check if we have a custom prompt (Pro mode)
  if (customPrompt && customPrompt.trim().length > 0) {
    // For Pro mode with custom prompt, use ONLY the custom prompt
    return `You are a professional business representative responding to a customer review.

${customPrompt}

Answer to this review:`;
  }
  
  // For Simple mode or when no custom prompt, use the full business profile context
  if (profile && profile.business_name) {
    return generateSystemPrompt({
      businessProfile: profile,
      mode: 'simple'
    });
  }
  
  // Fallback for edge cases
  return `You are a professional business response generator. Create a professional response to customer reviews. Be helpful, professional, and address the customer's feedback appropriately.`;
}
