# System Prompt Implementation

## Overview

This implementation provides intelligent system prompt generation that combines business profile data with specific prompt context for both simple and pro modes. The system automatically generates contextual prompts that include business information, response guidelines, and custom instructions.

## How It Works

### 1. **Simple Mode System Prompts**
For simple mode, the system generates comprehensive prompts that include:
- Business context (name, category, location, description)
- Response guidelines (tone, length, greetings, signatures)
- Business-specific instructions for professional responses

### 2. **Pro Mode System Prompts**
For pro mode, the system:
- Starts with the business profile context
- Layers on the user's custom prompt
- Ensures consistency across all responses
- Maintains brand voice and tone

## Key Components

### `systemPromptGenerator.ts`
Core utility for generating intelligent system prompts:

```typescript
import { generateSystemPrompt, getSystemPromptForJob } from '@/lib/utils/systemPromptGenerator';

// Generate a system prompt with full context
const systemPrompt = generateSystemPrompt({
  businessProfile,
  mode: 'simple', // or 'pro'
  customPrompt: 'optional custom instructions',
  reviewType: 'positive' // for pro mode
});

// Or use the helper function
const systemPrompt = getSystemPromptForJob(
  businessProfile,
  'ai_generation',
  customPrompt
);
```

### `jobUtils.ts`
Helper functions for job creation with business profile context:

```typescript
import { createAIGenerationJob } from '@/lib/utils/jobUtils';

// Create a job with automatic business profile fetching
const response = await createAIGenerationJob(reviewText, {
  customPrompt: 'optional custom prompt',
  tone: 'professional',
  maxLength: 150
});
```

## API Endpoints

### `GET /api/v1/me/business-profile`
Fetches the current user's business profile data for use in job creation.

**Response:**
```json
{
  "success": true,
  "business_profile": {
    "business_name": "Example Business",
    "business_main_category": "Restaurant",
    "response_tone": "friendly",
    "response_length": "medium",
    // ... other profile fields
  }
}
```

### `POST /api/v1/jobs`
Creates AI generation jobs with enhanced payload support:

**Enhanced Payload:**
```json
{
  "job_type": "ai_generation",
  "payload": {
    "review_text": "Customer review text",
    "business_profile": {
      // Business profile data (optional, auto-fetched if not provided)
    },
    "custom_prompt": "Custom instructions for pro mode",
    "tone": "professional",
    "max_length": 150
  }
}
```

## Usage in Extension

### 1. **Fetch Business Profile**
```typescript
// Get business profile data
const response = await fetch('/api/v1/me/business-profile');
const { business_profile } = await response.json();
```

### 2. **Create Job with Context**
```typescript
// Create job with business profile context
const jobResponse = await fetch('/api/v1/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    job_type: 'ai_generation',
    payload: {
      review_text: reviewText,
      business_profile: business_profile,
      custom_prompt: customPrompt, // for pro mode
      tone: 'professional',
      max_length: 150
    }
  })
});
```

### 3. **Use Utility Functions**
```typescript
import { createAIGenerationJob } from '@/lib/utils/jobUtils';

// Simple job creation
const response = await createAIGenerationJob(reviewText);

// Pro mode job creation
const response = await createAIGenerationJob(reviewText, {
  customPrompt: 'Always include a question to encourage engagement',
  tone: 'friendly',
  maxLength: 200
});
```

## Business Profile Fields Used

The system prompt generator uses these key business profile fields:

- **Business Identity**: `business_name`, `business_main_category`, `business_secondary_category`
- **Location**: `state_province`, `country`, `language`
- **Services**: `main_products_services`, `brief_description`, `business_tags`
- **Response Style**: `response_tone`, `response_length`, `greetings`, `signatures`
- **Brand Voice**: `brand_voice_notes`, `positive_review_cta`, `negative_review_escalation`

## Example Generated Prompts

### Simple Mode
```
You are an expert customer experience specialist and professional business representative.

Business Context:
- Business Name: Joe's Pizza
- Category: Restaurant / Italian Food
- Location: New York, USA
- Language: English
- Main Products/Services: Authentic Italian pizza and pasta
- Brief Description: Family-owned pizzeria serving traditional recipes
- Business Tags: pizza, italian, family, authentic

Response Guidelines:
- Tone: friendly
- Length: medium
- Greetings: Hi there! Thanks for your review!
- Signatures: Best regards, Joe's Pizza Team
- Brand Voice Notes: Warm, family-oriented, authentic Italian

Your task is to generate a professional, empathetic response to a customer review that:
1. Acknowledges the customer's feedback
2. Addresses their specific concerns or appreciation
3. Maintains the business's friendly tone
4. Uses appropriate greetings and signatures
5. Incorporates the business's unique characteristics and values
6. Stays within the specified medium length
7. Includes relevant call-to-action when appropriate

Always be authentic, professional, and aligned with the business's brand voice.
```

### Pro Mode
```
You are an expert customer experience specialist and professional business representative.

Business Context:
- Business Name: Joe's Pizza
- Category: Restaurant / Italian Food
- Location: New York, USA
- Language: English
- Main Products/Services: Authentic Italian pizza and pasta
- Brief Description: Family-owned pizzeria serving traditional recipes
- Business Tags: pizza, italian, family, authentic

Response Guidelines:
- Tone: friendly
- Length: medium
- Greetings: Hi there! Thanks for your review!
- Signatures: Best regards, Joe's Pizza Team
- Brand Voice Notes: Warm, family-oriented, authentic Italian

Review Type: Positive Review

Your task is to generate a response following the custom instructions provided while maintaining:
1. Professional business representation
2. Alignment with the business's brand voice and tone
3. Appropriate use of greetings and signatures
4. Consistency with the business's values and characteristics

Custom Instructions:
Always mention our family tradition and use Italian phrases like "Grazie" and "Mamma mia!" to add authenticity.

Follow the custom instructions precisely while ensuring the response remains professional and on-brand.
```

## Testing

Visit `/api-test/system-prompt-demo` to see the system prompt generation in action. This demo page allows you to:

- Switch between simple and pro modes
- Input custom prompts
- See real-time preview of generated system prompts
- View business profile data being used

## Benefits

1. **Contextual Intelligence**: AI responses are tailored to specific business context
2. **Brand Consistency**: All responses maintain consistent brand voice and style
3. **Flexible Modes**: Simple mode gets intelligent defaults, pro mode gets custom control
4. **Automatic Enhancement**: Business profile data is automatically included when available
5. **Extension Ready**: Designed for seamless integration with Chrome extension

## Next Steps

1. **Test the system prompt generation** with different business profiles
2. **Update the extension** to send business profile data with job requests
3. **Verify AI response quality** with the enhanced system prompts
4. **Add business profile validation** to ensure required fields are present
