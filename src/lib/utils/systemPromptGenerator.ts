import { BusinessProfile } from '@/lib/hooks/useSupabaseBusinessProfile';

export interface SystemPromptContext {
  businessProfile: BusinessProfile;
  reviewType?: 'positive' | 'neutral' | 'negative';
  reviewRating?: number; // Add review rating for conditional CTA/escalation
  customPrompt?: string;
  mode: 'simple' | 'pro';
}

export function generateSystemPrompt(context: SystemPromptContext): string {
  const { businessProfile, reviewType, reviewRating, customPrompt, mode } = context;
  
  // Base business context
  const businessContext = generateBusinessContext(businessProfile);
  
  if (mode === 'simple') {
    return generateSimpleModePrompt(businessContext, businessProfile, reviewRating);
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
- Business Tags: ${profile.business_tags.join(', ')}
- Other Considerations: ${profile.other_considerations || 'None specified'}`;
}

// Minimal business context for Pro mode - only core identity fields
function generateMinimalBusinessContext(profile: BusinessProfile): string {
  return `Business Context:
- Business Name: ${profile.business_name}
- Category: ${profile.business_main_category}${profile.business_secondary_category ? ` / ${profile.business_secondary_category}` : ''}
- Main Products/Services: ${profile.main_products_services}
- Brief Description: ${profile.brief_description}
- Business Tags: ${profile.business_tags.join(', ')}`;
}

function generateSimpleModePrompt(businessContext: string, profile: BusinessProfile, reviewRating?: number): string {
  // Determine which CTA/escalation to include based on review rating
  const isPositiveReview = reviewRating && reviewRating >= 4;
  const isNegativeReview = reviewRating && reviewRating <= 3;
  
  let ctaInstructions = '';
  let responseGuidelines = '';
  
  if (isPositiveReview) {
    // For 4-5 star reviews: include positive CTA, NO escalation
    ctaInstructions = `7. Includes the specific call-to-action in a natural way: ${profile.positive_review_cta || 'Thank the customer and invite them back'}`;
    responseGuidelines = `- Positive Review CTA: ${profile.positive_review_cta || 'Thank the customer and invite them back'}`;
  } else if (isNegativeReview) {
    // For 1-3 star reviews: include escalation procedure, NO positive CTA
    ctaInstructions = `7. Follows the specific escalation procedure: ${profile.negative_review_escalation || 'Address concerns professionally and offer solutions'}`;
    responseGuidelines = `- Negative Review Escalation: ${profile.negative_review_escalation || 'Address concerns professionally and offer solutions'}`;
  } else {
    // Fallback when no review rating is provided
    ctaInstructions = `7. Includes appropriate call-to-action or escalation based on review sentiment`;
    responseGuidelines = `- Positive Review CTA: ${profile.positive_review_cta || 'Thank the customer and invite them back'}
- Negative Review Escalation: ${profile.negative_review_escalation || 'Address concerns professionally and offer solutions'}`;
  }

  // Convert business profile length setting to specific token limits
  const getLengthGuidance = (length: string) => {
    switch (length?.toLowerCase()) {
      case 'brief':
        return 'Keep response concise (max ~2500 tokens, approximately 200-300 words)';
      case 'standard':
        return 'Use standard length (max ~3500 tokens, approximately 300-450 words)';
      case 'detailed':
        return 'Provide detailed response (max ~4500 tokens, approximately 450-600 words)';
      default:
        return 'Use appropriate length for the situation';
    }
  };

  return `You are an expert customer experience specialist and professional business representative.

Business Context:
${businessContext}

Response Guidelines:
- Tone: ${profile.response_tone}
- Length: ${profile.response_length} - ${getLengthGuidance(profile.response_length)}
- Greetings: ${profile.greetings}
- Signatures: ${profile.signatures}
- Brand Voice Notes: ${profile.brand_voice_notes}
${responseGuidelines}

Your task is to generate a professional, empathetic response to a customer review that:
1. Acknowledges the customer's feedback
2. Addresses their specific concerns or appreciation
3. Maintains the business's ${profile.response_tone} tone
4. Uses appropriate greetings and signatures
5. Incorporates the business's unique characteristics and values
6. Stays within the specified ${profile.response_length} length guidelines
${ctaInstructions}
8. Incorporates brand voice notes: ${profile.brand_voice_notes || 'Maintain professional and authentic communication'}
9. Considers additional business context: ${profile.other_considerations || 'Focus on customer satisfaction and business values'}

IMPORTANT: ${isNegativeReview ? 'This appears to be a negative or neutral review. Use ONLY the specific escalation procedure provided above. Do NOT offer discounts, free items, or other compensation unless explicitly stated in the escalation procedure.' : ''}

Always be authentic, professional, and aligned with the business's brand voice.`;
}

function generateProModePrompt(
  businessContext: string, 
  profile: BusinessProfile, 
  reviewType?: 'positive' | 'neutral' | 'negative',
  customPrompt?: string
): string {
  // For Pro mode, use minimal business context and focus on custom prompt
  const minimalContext = generateMinimalBusinessContext(profile);
  
  const basePrompt = `You are a professional business representative responding to a customer review.

${minimalContext}

Custom Instructions:
${customPrompt || 'Follow the custom instructions provided while maintaining professional business representation.'}`;

  // Add review type specific context if provided
  const reviewTypeContext = reviewType ? `\nReview Type: ${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)} Review` : '';

  return `${basePrompt}${reviewTypeContext}

Your task is to generate a response following the custom instructions provided while maintaining:
1. Professional business representation
2. Alignment with the business's core identity and values
3. Consistency with the custom instructions provided

Follow the custom instructions precisely while ensuring the response remains professional and on-brand.`;
}

// Helper function to get the appropriate system prompt for a specific use case
export function getSystemPromptForJob(
  businessProfile: BusinessProfile | Record<string, unknown>,
  jobType: string,
  customPrompt?: string,
  reviewRating?: number // Add review rating parameter
): string {
  // Convert Record<string, unknown> to BusinessProfile if needed
  const profile = businessProfile as BusinessProfile;
  
  // Check if we have a custom prompt (Pro mode)
  if (customPrompt && customPrompt.trim().length > 0) {
    // For Pro mode with custom prompt, use minimal business context + custom prompt
    if (profile && profile.business_name) {
      const minimalContext = generateMinimalBusinessContext(profile);
      return `You are a professional business representative responding to a customer review.

${minimalContext}

Custom Instructions:
${customPrompt}

Answer to this review while following the custom instructions and maintaining business context:`;
    }
    
    // Fallback for Pro mode without business profile
    return `You are a professional business representative responding to a customer review.

${customPrompt}

Answer to this review:`;
  }
  
  // For Simple mode or when no custom prompt, use the full business profile context
  if (profile && profile.business_name) {
    return generateSystemPrompt({
      businessProfile: profile,
      mode: 'simple',
      reviewRating: reviewRating // Pass the review rating
    });
  }
  
  // Fallback for edge cases
  return `You are a professional business response generator. Create a professional response to customer reviews. Be helpful, professional, and address the customer's feedback appropriately.`;
}
