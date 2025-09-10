#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobProcessorWorker = void 0;
process.env = { ...process.env };
// Load environment variables from .env files
// Note: dotenv is not available, so we'll rely on environment variables being set externally
// Debug: Check if environment variables are loaded
console.log("🔍 DEBUG: Environment variables check");
console.log("OPENAI_API_KEY (from env):", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
console.log("OPENAI_PROJECT_ID (from env):", process.env.OPENAI_PROJECT_ID ? "SET" : "NOT SET");
console.log("NEXT_PUBLIC_SUPABASE_URL (from env):", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
console.log("SUPABASE_SERVICE_ROLE_KEY (from env):", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
console.log("─".repeat(60));
// Test database connection immediately
console.log("🔍 DEBUG: Testing database connection...");
import { createClient } from "@supabase/supabase-js";
const testSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
    try {
        const result = await testSupabase.from('jobs').select('count').limit(1);
        console.log("🔍 DEBUG: Database connection test result:", result.error ? "FAILED" : "SUCCESS");
        if (result.error) {
            console.error("🔍 DEBUG: Database error:", result.error);
        }
    }
    catch (error) {
        console.error("🔍 DEBUG: Database connection exception:", error);
    }
})();
// Inline the necessary types and functions to avoid module dependencies
const JOB_TYPES = {
    AI_GENERATION: 'ai_generation',
    REVIEW_PROCESSING: 'review_processing',
    PROMPT_ANALYSIS: 'prompt_analysis',
    SENTIMENT_ANALYSIS: 'sentiment_analysis',
};

// Simple system prompt generator inline
function getSystemPromptForJob(businessProfile, jobType, customPrompt, reviewRating) {
    if (customPrompt && customPrompt.trim().length > 0) {
        if (businessProfile && businessProfile.business_name) {
            return `You are a professional business representative responding to a customer review.

Business Context:
- Business Name: ${businessProfile.business_name}
- Category: ${businessProfile.business_main_category}${businessProfile.business_secondary_category ? ` / ${businessProfile.business_secondary_category}` : ''}
- Main Products/Services: ${businessProfile.main_products_services || 'Not specified'}
- Brief Description: ${businessProfile.brief_description || 'Not specified'}
- Business Tags: ${Array.isArray(businessProfile.business_tags) ? businessProfile.business_tags.join(', ') : 'Not specified'}

Custom Instructions:
${customPrompt}

Follow the custom instructions while maintaining business context.`;
        }
        return `You are a professional business representative responding to a customer review.\n\n${customPrompt}`;
    }

    if (businessProfile && businessProfile.business_name) {
        const ratingContext = reviewRating && typeof reviewRating === 'number' ?
            (reviewRating >= 4 ? ' (positive review)' : reviewRating <= 3 ? ' (negative/neutral review)' : '') : '';

        return `You are the official voice of ${businessProfile.business_name}, a ${businessProfile.business_main_category}${businessProfile.business_secondary_category ? `/${businessProfile.business_secondary_category}` : ''} in ${businessProfile.state_province || 'Unknown'}, ${businessProfile.country || 'Unknown'}.
Reply to customer reviews in ${businessProfile.language || 'English'}.
Tone: ${businessProfile.response_tone || 'professional'}.
Follow our brand voice: ${businessProfile.brand_voice_notes || 'professional and authentic'}.
Consider our context: ${businessProfile.brief_description || 'quality service provider'}.
We mostly sell${businessProfile.main_products_services || 'various products/services'}, tags: ${Array.isArray(businessProfile.business_tags) ? businessProfile.business_tags.join(', ') : 'customer service'}.
Other considerations: ${businessProfile.other_considerations || 'customer satisfaction'}.${businessProfile.greetings ? ` Use one of the greetings provided: ${businessProfile.greetings}` : ''}${businessProfile.signatures ? ` and one of the sign-offs provided: ${businessProfile.signatures}` : ''}.

Structure:
Greeting: Professional greeting in ${businessProfile.language || 'English'}.
Body: Acknowledge the review and provide a helpful response.
Close: ${businessProfile.signatures || 'professional sign-off'}.

Rating-based behavior${ratingContext}:
If rating >= 4: Thank them warmly and invite them back.
If rating <= 3: Offer an apology and solution.
If rating is missing: Default to friendly response.

Return only the final customer reply text.`;
    }

    return `You are a professional business response generator. Create a professional response to customer reviews. Be helpful, professional, and address the customer's feedback appropriately.`;
}
// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;
const POLLING_INTERVAL = 200;
const MAX_RETRIES = 3;
// Validate required environment variables
if (!SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
    process.exit(1);
}
if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
    process.exit(1);
}
if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is required');
    process.exit(1);
}
if (!OPENAI_PROJECT_ID) {
    console.error('❌ OPENAI_PROJECT_ID is required');
    process.exit(1);
}
// Initialize Supabase client with service role key for admin access
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const WORKER_CONFIG = {
    name: 'Job Processor Worker',
    version: '2.0.0',
    pollingInterval: POLLING_INTERVAL,
    maxRetries: MAX_RETRIES
};
// Helper function to extract response text from OpenAI Chat Completions API response
function extractResponseText(response) {
    try {
        console.log('🔍 ExtractResponseText Debug: Starting extraction...');
        // Check if we have valid choices
        if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
            console.error('❌ ExtractResponseText: No choices found in response');
            return null;
        }
        // Get the first choice
        const firstChoice = response.choices[0];
        if (!firstChoice || !firstChoice.message) {
            console.error('❌ ExtractResponseText: No message found in first choice');
            return null;
        }
        // Extract content from the message
        const content = firstChoice.message.content;
        if (!content || typeof content !== 'string') {
            console.error('❌ ExtractResponseText: No valid content found in message');
            return null;
        }
        const trimmedContent = content.trim();
        console.log('🔍 ExtractResponseText: Extracted content length:', trimmedContent.length);
        if (trimmedContent.length === 0) {
            console.error('❌ ExtractResponseText: Extracted content is empty');
            return null;
        }
        console.log('🔍 ExtractResponseText: Successfully extracted response text');
        return trimmedContent;
    }
    catch (error) {
        console.error('❌ ExtractResponseText: Error extracting response text:', error);
        return null;
    }
}
// Main worker class
class JobProcessorWorker {
    constructor() {
        this.isRunning = false;
        this.processedJobs = 0;
        this.failedJobs = 0;
        this.startTime = Date.now();
        this.setupGracefulShutdown();
    }
    // Setup graceful shutdown handlers
    setupGracefulShutdown() {
        process.on('SIGINT', () => {
            console.log('\n🛑 Received SIGINT, shutting down gracefully...');
            this.shutdown();
        });
        process.on('SIGTERM', () => {
            console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
            this.shutdown();
        });
    }
    // Start the worker
    async start() {
        console.log(`🚀 Starting ${WORKER_CONFIG.name} v${WORKER_CONFIG.version}`);
        console.log(`📊 Configuration: Polling every ${WORKER_CONFIG.pollingInterval}ms, Max retries: ${WORKER_CONFIG.maxRetries}`);
        console.log(`🔗 Connected to Supabase: ${SUPABASE_URL}`);
        console.log(`🤖 OpenAI API Key: ${OPENAI_API_KEY.substring(0, 8)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);
        console.log(`📁 OpenAI Project ID: ${OPENAI_PROJECT_ID}`);
        console.log(`⏰ Started at: ${new Date().toISOString()}`);
        console.log('─'.repeat(60));
        this.isRunning = true;
        await this.mainLoop();
    }
    // Main processing loop
    async mainLoop() {
        console.log('🔄 Starting main processing loop...');
        while (this.isRunning) {
            try {
                await this.processNextJob();
                await this.sleep(WORKER_CONFIG.pollingInterval);
            }
            catch (error) {
                console.error('❌ Error in main loop:', error);
                // Log additional context for debugging
                console.error('🔍 Error details:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    timestamp: new Date().toISOString()
                });
                // If it's a critical error, we might want to pause longer
                const isCriticalError = error instanceof Error &&
                    (error.message.includes('connection') ||
                        error.message.includes('network') ||
                        error.message.includes('timeout'));
                const delay = isCriticalError ? WORKER_CONFIG.pollingInterval * 2 : WORKER_CONFIG.pollingInterval;
                console.log(`⏳ Waiting ${delay / 1000}s before next attempt due to error...`);
                await this.sleep(delay);
            }
        }
        console.log('🛑 Main processing loop stopped');
    }
    // Process the next available job
    async processNextJob() {
        try {
            // First, let's debug what's in the database
            console.log('🔍 Debug: Checking for pending jobs in database...');
            const { data: allJobs, error: debugError } = await supabase
                .from('jobs')
                .select('*')
                .limit(5);
            if (debugError) {
                console.error('❌ Debug error:', debugError);
            }
            else {
                console.log(`🔍 Debug: Found ${allJobs?.length || 0} total jobs in database`);
                if (allJobs && allJobs.length > 0) {
                    allJobs.forEach(job => {
                        console.log(`🔍 Debug: Job ${job.id} - Status: ${job.status}, Type: ${job.job_type}, Created: ${job.created_at}`);
                    });
                }
            }
            // Atomically fetch and lock a pending job
            const job = await this.fetchAndLockJob();
            if (!job) {
                console.log('⏳ No pending jobs found, waiting...');
                return;
            }
            console.log(`🔒 Locked job ${job.id} (${job.job_type}) for processing`);
            console.log(`📝 Payload: ${JSON.stringify(job.payload)}`);
            // Process the job
            const result = await this.processJob(job);
            // Update job status based on result
            try {
                await this.updateJobStatus(job.id, result);
            }
            catch (updateError) {
                console.error(`❌ Failed to update job status for ${job.id}:`, updateError);
                // Don't fail the job if we can't update the status, but log it
            }
            // Log results
            if (result.success) {
                this.processedJobs++;
                console.log(`✅ Job ${job.id} completed successfully in ${result.processingTimeMs}ms`);
                if (result.result && typeof result.result === 'object' && 'tokens_used' in result.result) {
                    console.log(`🔢 Tokens used: ${result.result.tokens_used || 0}`);
                }
                console.log(`📊 Total processed: ${this.processedJobs}, Failed: ${this.failedJobs}`);
            }
            else {
                this.failedJobs++;
                console.log(`❌ Job ${job.id} failed after ${result.processingTimeMs}ms: ${result.error}`);
                console.log(`📊 Total processed: ${this.processedJobs}, Failed: ${this.failedJobs}`);
                // Log additional context for debugging
                if (job.payload && typeof job.payload === 'object') {
                    const payload = job.payload;
                    console.log(`📋 Job payload: review_text length: ${payload.review_text?.length || 0} chars`);
                    console.log(`⭐ Review rating: ${payload.review_rating || 'not set'}`);
                }
            }
        }
        catch (error) {
            console.error('❌ Error processing job:', error);
        }
    }
    // Atomically fetch and lock a pending job
    async fetchAndLockJob() {
        try {
            // Use a single atomic UPDATE query to find and lock a job
            const { data: jobs, error } = await supabase
                .from('jobs')
                .update({
                status: 'processing',
                updated_at: new Date().toISOString()
            })
                .eq('status', 'pending')
                .order('created_at', { ascending: true })
                .limit(1)
                .select()
                .returns();
            if (error) {
                console.error('❌ Error fetching job:', error);
                return null;
            }
            return jobs && jobs.length > 0 ? jobs[0] : null;
        }
        catch (error) {
            console.error('❌ Error in fetchAndLockJob:', error);
            return null;
        }
    }
    // Process a specific job
    async processJob(job) {
        const startTime = Date.now();
        try {
            console.log(`🔄 Processing job ${job.id} (${job.job_type})...`);
            console.log(`🔍 Debug: Job payload keys: ${Object.keys(job.payload || {})}`);
            let result;
            switch (job.job_type) {
                case 'ai_generation':
                    result = await this.processAIGeneration(job.payload);
                    break;
                case 'review_processing':
                    result = await this.processReviewProcessing(job.payload);
                    break;
                case 'prompt_analysis':
                    result = await this.processPromptAnalysis(job.payload);
                    break;
                case 'sentiment_analysis':
                    result = await this.processSentimentAnalysis(job.payload);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.job_type}`);
            }
            const processingTime = Date.now() - startTime;
            return {
                success: true,
                result,
                processingTimeMs: processingTime
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Job ${job.id} failed with error:`, errorMessage);
            console.error(`❌ Full error details:`, error);
            return {
                success: false,
                error: errorMessage,
                processingTimeMs: processingTime
            };
        }
    }
    // Process AI generation job
    async processAIGeneration(payload) {
        console.log(`🔍 Debug: Starting AI generation with payload keys: ${Object.keys(payload)}`);
        const { review_text, business_profile, custom_prompt, review_rating } = payload;
        console.log(`🔍 Debug: review_text type: ${typeof review_text}, length: ${review_text?.length || 0}`);
        console.log(`🔍 Debug: business_profile type: ${typeof business_profile}`);
        console.log(`🔍 Debug: custom_prompt type: ${typeof custom_prompt}`);
        console.log(`🔍 Debug: review_rating type: ${typeof review_rating}, value: ${review_rating}`);
        if (!review_text || typeof review_text !== 'string') {
            console.error(`❌ Debug: Invalid review_text: ${review_text}`);
            throw new Error('review_text is required and must be a string');
        }
        // Note: tone and length are now handled by business profile settings
        console.log(`🤖 Generating AI response for review: "${review_text.substring(0, 50)}..."`);
        console.log(`⭐ Review Rating: ${review_rating || 'NOT SET'}`);
        // Determine review sentiment for logging
        let reviewSentiment = 'Unknown';
        if (review_rating && typeof review_rating === 'number') {
            if (review_rating >= 4)
                reviewSentiment = 'Positive (4-5 stars)';
            else if (review_rating === 3)
                reviewSentiment = 'Neutral (3 stars)';
            else if (review_rating <= 2)
                reviewSentiment = 'Negative (1-2 stars)';
        }
        console.log(`📊 Review Sentiment: ${reviewSentiment}`);
        // Generate the appropriate system prompt
        let systemPrompt;
        if (custom_prompt && typeof custom_prompt === 'string' && custom_prompt.trim().length > 0) {
            // For Pro mode with custom prompt, still include business profile context
            if (business_profile && typeof business_profile === 'object') {
                systemPrompt = getSystemPromptForJob(business_profile, 'ai_generation', custom_prompt, review_rating);
            }
            else {
                // Fallback for Pro mode without business profile
                systemPrompt = getSystemPromptForJob({}, 'ai_generation', custom_prompt, review_rating);
            }
        }
        else if (business_profile && typeof business_profile === 'object') {
            // Use business profile to generate contextual system prompt for Simple mode
            systemPrompt = getSystemPromptForJob(business_profile, 'ai_generation', undefined, // no custom prompt
            review_rating);
        }
        else {
            // Fallback to basic prompt when no business profile or custom prompt is available
            systemPrompt = `You are a professional business response generator. Create a professional response to customer reviews. Be helpful, professional, and address the customer's feedback appropriately.`;
        }
        console.log(`📝 Using system prompt: ${systemPrompt.substring(0, 100)}...`);
        // Debug: Log business profile parameters being used
        if (business_profile && typeof business_profile === 'object') {
            const bp = business_profile;
            const isProMode = custom_prompt && typeof custom_prompt === 'string' && custom_prompt.trim().length > 0;
            if (isProMode) {
                console.log(`🏢 Pro Mode - Minimal Business Context:`);
                console.log(`   Business Name: "${bp.business_name || 'NOT SET'}"`);
                console.log(`   Main Category: "${bp.business_main_category || 'NOT SET'}"`);
                console.log(`   Secondary Category: "${bp.business_secondary_category || 'NOT SET'}"`);
                console.log(`   Main Products/Services: "${bp.main_products_services || 'NOT SET'}"`);
                console.log(`   Brief Description: "${bp.brief_description || 'NOT SET'}"`);
                console.log(`   Business Tags: "${Array.isArray(bp.business_tags) ? bp.business_tags.join(', ') : 'NOT SET'}"`);
                console.log(`   Custom Prompt: "${custom_prompt.substring(0, 100)}..."`);
            }
            else {
                console.log(`🏢 Simple Mode - Full Business Profile:`);
                console.log(`   Business Name: "${bp.business_name || 'NOT SET'}"`);
                console.log(`   Main Category: "${bp.business_main_category || 'NOT SET'}"`);
                console.log(`   Secondary Category: "${bp.business_secondary_category || 'NOT SET'}"`);
                console.log(`   Business Tags: "${Array.isArray(bp.business_tags) ? bp.business_tags.join(', ') : 'NOT SET'}"`);
                console.log(`   Main Products/Services: "${bp.main_products_services || 'NOT SET'}"`);
                console.log(`   Brief Description: "${bp.brief_description || 'NOT SET'}"`);
                console.log(`   Country: "${bp.country || 'NOT SET'}"`);
                console.log(`   State/Province: "${bp.state_province || 'NOT SET'}"`);
                console.log(`   Language: "${bp.language || 'NOT SET'}"`);
                console.log(`   Response Tone: "${bp.response_tone || 'NOT SET'}"`);
                console.log(`   Response Length: "${bp.response_length || 'NOT SET'}"`);
                console.log(`   Greetings: "${bp.greetings || 'NOT SET'}"`);
                console.log(`   Signatures: "${bp.signatures || 'NOT SET'}"`);
                console.log(`   Brand Voice Notes: "${bp.brand_voice_notes || 'NOT SET'}"`);
                console.log(`   Other Considerations: "${bp.other_considerations || 'NOT SET'}"`);
                // Show which CTA/escalation will be used based on review rating
                if (review_rating && typeof review_rating === 'number') {
                    if (review_rating >= 4) {
                        console.log(`   🎯 Will use POSITIVE CTA: "${bp.positive_review_cta || 'NOT SET'}"`);
                        console.log(`   ❌ Will NOT use escalation procedure (positive review)`);
                    }
                    else if (review_rating <= 3) {
                        console.log(`   ❌ Will NOT use positive CTA (negative/neutral review)`);
                        console.log(`   🎯 Will use ESCALATION: "${bp.negative_review_escalation || 'NOT SET'}"`);
                    }
                }
                else {
                    console.log(`   ⚠️ Review rating unknown - will use fallback CTA/escalation logic`);
                }
            }
        }
        // Add reviewer name context for personalization
        const userPrefs = payload.user_preferences;
        if (userPrefs && userPrefs.reviewerName && typeof userPrefs.reviewerName === 'string') {
            const reviewerName = userPrefs.reviewerName.trim();
            if (reviewerName) {
                // Extract first name only for proper personalization
                const firstName = reviewerName.split(' ')[0];
                // Replace _firstName_ placeholder with actual first name
                systemPrompt = systemPrompt.replace(/_firstName_/g, firstName);
                // Add explicit instruction about using the reviewer's FIRST name only
                systemPrompt += `\n\nIMPORTANT: Use ONLY the customer's first name "${firstName}" in your greeting. Do NOT use their full name. Generate the response directly without extensive reasoning.`;
                console.log(`👤 Reviewer name found: "${reviewerName}" (using first name: "${firstName}")`);
            }
        }
        else {
            console.log(`⚠️ No reviewer name found in payload`);
        }
        // Call OpenAI API with Chat Completions format
        const response = await this.callOpenAI({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Review: "${review_text}"\nRating: ${review_rating || 'Not provided'}\nReviewer Name: ${userPrefs?.reviewerName || 'Not provided'}`
                }
            ],
            max_tokens: 1000, // Use reasonable default since length is now handled by business profile
            temperature: 1
        });
        // Debug: Log the response structure
        console.log('🔍 OpenAI Response ID:', response.id);
        console.log('🔍 Response Model:', response.model);
        console.log('🔍 Response Choices Count:', response.choices?.length || 0);
        // Extract the generated content using the helper function
        const generatedContent = extractResponseText(response);
        console.log('🔍 Extracted content:', generatedContent ? 'SUCCESS' : 'FAILED');
        console.log('🔍 Generated content length:', generatedContent?.length || 0);
        if (!generatedContent || generatedContent.trim().length === 0) {
            throw new Error('No content generated by OpenAI API');
        }
        return {
            generated_response: generatedContent,
            confidence_score: 0.95,
            processing_time_ms: Date.now(),
            tokens_used: response.usage?.total_tokens || 0,
            prompt_tokens: response.usage?.prompt_tokens || 0,
            completion_tokens: response.usage?.completion_tokens || 0,
            model_used: 'gpt-4o-mini',
            tone_used: 'From Business Profile', // Tone now comes from business profile
            max_length_requested: 'From Business Profile', // Length now comes from business profile
            system_prompt_used: systemPrompt // Store the system prompt used
        };
    }
    // Process review processing job
    async processReviewProcessing(payload) {
        const { review_text, business_category = 'general' } = payload;
        if (!review_text || typeof review_text !== 'string') {
            throw new Error('review_text is required and must be a string');
        }
        console.log(`📊 Processing review for business category: ${business_category}`);
        // Call OpenAI API for review analysis using Chat Completions API
        const response = await this.callOpenAI({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Analyze this customer review and provide insights. Business category: ${business_category}`
                },
                {
                    role: 'user',
                    content: `Analyze this review: "${review_text}"`
                }
            ],
            max_tokens: 200,
            temperature: 1
        });
        // Extract the suggested response using the helper function
        const suggestedResponse = extractResponseText(response);
        if (!suggestedResponse || suggestedResponse.trim().length === 0) {
            throw new Error('No content generated for review analysis');
        }
        return {
            sentiment: 'positive', // This would be determined by AI analysis
            key_topics: ['service quality', 'customer satisfaction'],
            suggested_response: suggestedResponse,
            response_rating: 4.5,
            business_category,
            analysis_timestamp: new Date().toISOString()
        };
    }
    // Process prompt analysis job
    async processPromptAnalysis(payload) {
        const { prompt_text, optimization_goals = 'clarity' } = payload;
        if (!prompt_text || typeof prompt_text !== 'string') {
            throw new Error('prompt_text is required and must be a string');
        }
        console.log(`🔍 Analyzing prompt for optimization: ${optimization_goals}`);
        // Call OpenAI API for prompt optimization using Chat Completions API
        const response = await this.callOpenAI({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Optimize this prompt for ${optimization_goals}. Provide specific improvements and an optimized version.`
                },
                {
                    role: 'user',
                    content: `Optimize this prompt: "${prompt_text}"`
                }
            ],
            max_tokens: 300,
            temperature: 1
        });
        // Extract the optimized prompt using the helper function
        const optimizedPrompt = extractResponseText(response);
        if (!optimizedPrompt || optimizedPrompt.trim().length === 0) {
            throw new Error('No content generated for prompt optimization');
        }
        return {
            original_prompt: prompt_text,
            optimized_prompt: optimizedPrompt,
            optimization_goals,
            improvements_suggested: ['clarity', 'specificity', 'context'],
            optimization_score: 8.5,
            analysis_timestamp: new Date().toISOString()
        };
    }
    // Process sentiment analysis job
    async processSentimentAnalysis(payload) {
        const { text_content, analysis_depth = 'basic' } = payload;
        if (!text_content || typeof text_content !== 'string') {
            throw new Error('text_content is required and must be a string');
        }
        console.log(`😊 Analyzing sentiment with depth: ${analysis_depth}`);
        // Call OpenAI API for sentiment analysis using Chat Completions API
        const response = await this.callOpenAI({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Perform ${analysis_depth} sentiment analysis on this text. Provide sentiment score, key emotions, and insights.`
                },
                {
                    role: 'user',
                    content: `Analyze sentiment: "${text_content}"`
                }
            ],
            max_tokens: 250,
            temperature: 1
        });
        // Extract the insights using the helper function
        const insights = extractResponseText(response);
        if (!insights || insights.trim().length === 0) {
            throw new Error('No content generated for sentiment analysis');
        }
        return {
            text_analyzed: text_content.substring(0, 100) + '...',
            sentiment_score: 0.75,
            primary_emotion: 'satisfaction',
            secondary_emotions: ['appreciation', 'contentment'],
            analysis_depth,
            insights: insights,
            analysis_timestamp: new Date().toISOString()
        };
    }
    // Call OpenAI API using Chat Completions API
    async callOpenAI(requestBody) {
        try {
            console.log('🔄 Calling OpenAI API...');
            console.log('🔑 Using API Key:', OPENAI_API_KEY.substring(0, 8) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4));
            console.log('📁 Project ID:', OPENAI_PROJECT_ID);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Project': OPENAI_PROJECT_ID,
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                let errorMessage = `OpenAI API error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.error?.message || 'Unknown error'}`;
                    // Handle specific OpenAI error codes
                    if (errorData.error?.type === 'insufficient_quota') {
                        errorMessage = 'OpenAI quota exceeded. Please check your billing settings.';
                    }
                    else if (errorData.error?.type === 'invalid_request_error') {
                        errorMessage = `Invalid request to OpenAI: ${errorData.error.message}`;
                    }
                }
                catch {
                    // If we can't parse the error response, use a generic message
                    errorMessage += ' - Unable to parse error response';
                }
                throw new Error(errorMessage);
            }
            const result = await response.json();
            console.log('✅ OpenAI API call successful');
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('OpenAI API request timed out after 60 seconds');
            }
            console.error('❌ OpenAI API call failed:', error);
            throw error;
        }
    }
    // Update job status in database
    async updateJobStatus(jobId, result) {
        try {
            // Validate inputs
            if (!jobId || typeof jobId !== 'string') {
                throw new Error('Invalid job ID provided to updateJobStatus');
            }
            if (!result || typeof result !== 'object') {
                throw new Error('Invalid result object provided to updateJobStatus');
            }
            const updateData = {
                status: result.success ? 'completed' : 'failed',
                result: result.success ? result.result : null,
                error: result.success ? null : (result.error || 'Unknown processing error'),
                updated_at: new Date().toISOString()
            };
            // Add retry logic for database updates
            let retries = 3;
            let lastError = null;
            while (retries > 0) {
                try {
                    const { error } = await supabase
                        .from('jobs')
                        .update(updateData)
                        .eq('id', jobId);
                    if (error) {
                        throw error;
                    }
                    console.log(`💾 Job ${jobId} status updated to: ${updateData.status}`);
                    return; // Success, exit the function
                }
                catch (error) {
                    lastError = error;
                    retries--;
                    if (retries > 0) {
                        console.warn(`⚠️ Job status update failed, retrying... (${retries} attempts left)`);
                        await this.sleep(1000); // Wait 1 second before retry
                    }
                }
            }
            // If we get here, all retries failed
            console.error(`❌ Failed to update job status after 3 attempts:`, lastError);
            throw lastError;
        }
        catch (error) {
            console.error('❌ Error in updateJobStatus:', error);
            // Don't re-throw here to prevent infinite loops, but log the error
        }
    }
    // Utility function to sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Shutdown the worker gracefully
    async shutdown() {
        console.log('\n🔄 Shutting down worker...');
        this.isRunning = false;
        console.log(`📊 Final Statistics:`);
        console.log(`   Total jobs processed: ${this.processedJobs}`);
        console.log(`   Total jobs failed: ${this.failedJobs}`);
        console.log(`   Uptime: ${Math.floor((Date.now() - this.startTime) / 1000)} seconds`);
        console.log('👋 Worker shutdown complete');
        process.exit(0);
    }
}
exports.JobProcessorWorker = JobProcessorWorker;
// Start the worker if this file is run directly
if (require.main === module) {
    const worker = new JobProcessorWorker();
    worker.start().catch(error => {
        console.error('❌ Failed to start worker:', error);
        process.exit(1);
    });
}
