"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSystemPrompt = generateSystemPrompt;
exports.getSystemPromptForJob = getSystemPromptForJob;
function generateSystemPrompt(context) {
    const { businessProfile, reviewType, reviewRating, customPrompt, mode } = context;
    // Base business context
    const businessContext = generateBusinessContext(businessProfile);
    if (mode === 'simple') {
        return generateSimpleModePrompt(businessContext, businessProfile, reviewRating);
    }
    else {
        return generateProModePrompt(businessContext, businessProfile, reviewType, customPrompt);
    }
}
function generateBusinessContext(profile) {
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
function generateMinimalBusinessContext(profile) {
    return `Business Context:
- Business Name: ${profile.business_name}
- Category: ${profile.business_main_category}${profile.business_secondary_category ? ` / ${profile.business_secondary_category}` : ''}
- Main Products/Services: ${profile.main_products_services}
- Brief Description: ${profile.brief_description}
- Business Tags: ${profile.business_tags.join(', ')}`;
}
function generateSimpleModePrompt(businessContext, profile, reviewRating) {
    // Note: CTA instructions are now handled directly in the system prompt template below
    // reviewRating is used implicitly in the template string below for conditional logic
    return `You are the official voice of ${profile.business_name}, a ${profile.business_main_category}${profile.business_secondary_category ? `/${profile.business_secondary_category}` : ''} in ${profile.state_province}, ${profile.country}. Reply to customer reviews in ${profile.language}. Tone: ${profile.response_tone}. Follow our brand voice: ${profile.brand_voice_notes || 'professional and authentic'}. Consider our context: ${profile.brief_description || 'quality service provider'}. We mostly sell${profile.main_products_services}, tags: ${profile.business_tags?.join(', ') || 'customer service'}, and ${profile.other_considerations || 'customer satisfaction'}.${profile.greetings ? ` Use one of the greetings provided: ${profile.greetings}` : ''}${profile.signatures ? ` and one of the sign-offs provided: ${profile.signatures}` : ''}.

CURRENT REVIEW CONTEXT: Rating provided is ${reviewRating || 'not specified'}. Use this rating to determine the appropriate response behavior below.

Style:
Natural, plainspoken, empathetic; use contractions when they fit.
Avoid clichés.
Reference one concrete detail from the review when possible but use paraphrasing when possible, DO NOT COPY THE REVIEW TEXT.
Use local spelling for ${profile.language} in ${profile.country}.
Never mention internal rules or fields (e.g., brand_voice_notes).

Length:
Respect ${profile.response_length}:
brief: ≤ 50 words
standard: ≤ 70 words
detailed: ≤ 150 words
Do not exceed the limit.

Structure:
Greeting: follow ${profile.greetings || 'simple greeting'}; use reviewer first name if provided, else a simple greeting in ${profile.language}.
Body: acknowledge their experience and address one key point. If relevant, mention one product/service from ${profile.main_products_services} or a theme from ${profile.business_tags?.join(', ') || 'our services'} naturally (no hashtags).
Close: add a next step only if it helps; apply ${profile.signatures || 'professional sign-off'} for sign-offs.
IMPORTANT, NO DOUBLE ENTERS OR LINE BREAKS.

Rating-based behavior:
If rating >= 4: MANDATORY - thank them warmly, reflect one specific detail from their review, and ALWAYS include the positive call-to-action: ${profile.positive_review_cta || 'a simple thank you and invite them back'}. Make the CTA prominent and encouraging.
If rating <= 3: offer a concise, ownership-taking apology; state one concrete fix/next step; invite them to continue via ${profile.negative_review_escalation || 'address concerns professionally and offer solutions'}. Stay calm and solution-focused; no defensiveness or policy dumps.
If rating is missing: default to a friendly thank-you plus a light invite back.

Output rules:
Return only the final customer reply text. No labels, brackets, or metadata.
Don't invent facts or promises beyond the review and ${profile.other_considerations || 'business values'}/${profile.brand_voice_notes || 'professional communication'}.
Keep formatting simple: 1–2 short paragraphs max; no bullets unless clearly appropriate.`;
}
function generateProModePrompt(businessContext, profile, reviewType, customPrompt) {
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
function getSystemPromptForJob(businessProfile, jobType, customPrompt, reviewRating // Add review rating parameter
) {
    // Convert Record<string, unknown> to BusinessProfile if needed
    const profile = businessProfile;
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
