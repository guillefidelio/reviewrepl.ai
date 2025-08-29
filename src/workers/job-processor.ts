#!/usr/bin/env node
process.env = { ...process.env };

// Load environment variables from .env files
// Note: dotenv is not available, so we'll rely on environment variables being set externally
// or use a different approach if needed

// Debug: Check if environment variables are loaded
console.log("🔍 DEBUG: Environment variables check");
console.log("OPENAI_API_KEY (from env):", process.env.OPENAI_API_KEY);
console.log("OPENAI_PROJECT_ID (from env):", process.env.OPENAI_PROJECT_ID);
console.log("NEXT_PUBLIC_SUPABASE_URL (from env):", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY (from env):", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
console.log("─".repeat(60));

import { createClient } from '@supabase/supabase-js';
import { Job, JobStatus } from '../lib/types/jobs';
import { getSystemPromptForJob } from '../lib/utils/systemPromptGenerator';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID!;
const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Worker configuration
interface WorkerConfig {
  name: string;
  version: string;
  pollingInterval: number;
  maxRetries: number;
}

const WORKER_CONFIG: WorkerConfig = {
  name: 'Job Processor Worker',
  version: '1.0.0',
  pollingInterval: POLLING_INTERVAL,
  maxRetries: MAX_RETRIES
};

// Job processing result
interface ProcessingResult {
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  processingTimeMs: number;
}

// OpenAI API response interface for the new Responses API
interface OpenAIResponse {
  output: Array<{
    type: string;
    id: string;
    status: string;
    role: string;
    content: Array<{
      type: string;
      text: string;
      annotations?: Array<unknown>;
    }>;
  }>;
  output_text?: string; // Safe convenience property for all text outputs
  usage?: {
    total_tokens: number;
  };
  status?: string; // Response status
  error?: string | null; // Error if any
}

// Main worker class
class JobProcessorWorker {
  private isRunning = false;
  private processedJobs = 0;
  private failedJobs = 0;
  private startTime = Date.now();

  constructor() {
    this.setupGracefulShutdown();
  }

  // Setup graceful shutdown handlers
  private setupGracefulShutdown(): void {
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
  async start(): Promise<void> {
    console.log(`🚀 Starting ${WORKER_CONFIG.name} v${WORKER_CONFIG.version}`);
    console.log(`📊 Configuration: Polling every ${WORKER_CONFIG.pollingInterval}ms, Max retries: ${WORKER_CONFIG.maxRetries}`);
    console.log(`🔗 Connected to Supabase: ${SUPABASE_URL}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('─'.repeat(60));

    this.isRunning = true;
    await this.mainLoop();
  }

  // Main processing loop
  private async mainLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processNextJob();
        await this.sleep(WORKER_CONFIG.pollingInterval);
      } catch (error) {
        console.error('❌ Error in main loop:', error);
        await this.sleep(WORKER_CONFIG.pollingInterval);
      }
    }
  }

  // Process the next available job
  private async processNextJob(): Promise<void> {
    try {
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
      await this.updateJobStatus(job.id, result);

      // Log results
      if (result.success) {
        this.processedJobs++;
        console.log(`✅ Job ${job.id} completed successfully in ${result.processingTimeMs}ms`);
        console.log(`📊 Total processed: ${this.processedJobs}, Failed: ${this.failedJobs}`);
      } else {
        this.failedJobs++;
        console.log(`❌ Job ${job.id} failed: ${result.error}`);
        console.log(`📊 Total processed: ${this.processedJobs}, Failed: ${this.failedJobs}`);
      }

    } catch (error) {
      console.error('❌ Error processing job:', error);
    }
  }

  // Atomically fetch and lock a pending job
  private async fetchAndLockJob(): Promise<Job | null> {
    try {
      // Use a single atomic UPDATE query to find and lock a job
      const { data: jobs, error } = await supabase
        .from('jobs')
        .update({ 
          status: 'processing' as JobStatus,
          updated_at: new Date().toISOString()
        })
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .select()
        .returns<Job[]>();

      if (error) {
        console.error('❌ Error fetching job:', error);
        return null;
      }

      return jobs && jobs.length > 0 ? jobs[0] : null;

    } catch (error) {
      console.error('❌ Error in fetchAndLockJob:', error);
      return null;
    }
  }

  // Process a specific job
  private async processJob(job: Job): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Processing job ${job.id} (${job.job_type})...`);

      let result: Record<string, unknown>;

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

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: errorMessage,
        processingTimeMs: processingTime
      };
    }
  }

  // Process AI generation job
  private async processAIGeneration(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { review_text, business_profile, custom_prompt, review_rating } = payload;

    if (!review_text || typeof review_text !== 'string') {
      throw new Error('review_text is required and must be a string');
    }

    // Note: tone and length are now handled by business profile settings

    console.log(`🤖 Generating AI response for review: "${review_text.substring(0, 50)}..."`);
    console.log(`⭐ Review Rating: ${review_rating || 'NOT SET'}`);
    
    // Determine review sentiment for logging
    let reviewSentiment = 'Unknown';
    if (review_rating && typeof review_rating === 'number') {
      if (review_rating >= 4) reviewSentiment = 'Positive (4-5 stars)';
      else if (review_rating === 3) reviewSentiment = 'Neutral (3 stars)';
      else if (review_rating <= 2) reviewSentiment = 'Negative (1-2 stars)';
    }
    console.log(`📊 Review Sentiment: ${reviewSentiment}`);

    // Generate the appropriate system prompt
    let systemPrompt: string;
    
    if (custom_prompt && typeof custom_prompt === 'string' && custom_prompt.trim().length > 0) {
      // For Pro mode with custom prompt, still include business profile context
      if (business_profile && typeof business_profile === 'object') {
        systemPrompt = getSystemPromptForJob(
          business_profile as Record<string, unknown>,
          'ai_generation',
          custom_prompt,
          review_rating as number
        );
      } else {
        // Fallback for Pro mode without business profile
        systemPrompt = getSystemPromptForJob(
          {},
          'ai_generation',
          custom_prompt,
          review_rating as number
        );
      }
    } else if (business_profile && typeof business_profile === 'object') {
      // Use business profile to generate contextual system prompt for Simple mode
      systemPrompt = getSystemPromptForJob(
        business_profile as Record<string, unknown>,
        'ai_generation',
        undefined, // no custom prompt
        review_rating as number
      );
    } else {
      // Fallback to basic prompt when no business profile or custom prompt is available
      systemPrompt = `You are a professional business response generator. Create a professional response to customer reviews. Be helpful, professional, and address the customer's feedback appropriately.`;
    }

    console.log(`📝 Using system prompt: ${systemPrompt.substring(0, 100)}...`);
    
    // Debug: Log business profile parameters being used
    if (business_profile && typeof business_profile === 'object') {
      const bp = business_profile as Record<string, unknown>;
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
      } else {
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
          } else if (review_rating <= 3) {
            console.log(`   ❌ Will NOT use positive CTA (negative/neutral review)`);
            console.log(`   🎯 Will use ESCALATION: "${bp.negative_review_escalation || 'NOT SET'}"`);
          }
        } else {
          console.log(`   ⚠️ Review rating unknown - will use fallback CTA/escalation logic`);
        }
      }
    }
    
    // Add reviewer name context for personalization
    const userPrefs = payload.user_preferences as Record<string, unknown>;
    if (userPrefs && userPrefs.reviewerName && typeof userPrefs.reviewerName === 'string') {
      const reviewerName = userPrefs.reviewerName.trim();
      if (reviewerName) {
        // Replace _firstName_ placeholder with actual reviewer name
        systemPrompt = systemPrompt.replace(/_firstName_/g, reviewerName);
        
        // Also add explicit instruction about using the reviewer's name and being direct
        systemPrompt += `\n\nIMPORTANT: The customer's name is "${reviewerName}". Use their actual name in your greeting and throughout the response to personalize it. Generate the response directly without extensive reasoning.`;
        
        console.log(`👤 Reviewer name found: "${reviewerName}"`);
      }
    } else {
      console.log(`⚠️ No reviewer name found in payload`);
    }

    // Call OpenAI API with the new Responses API
    const response = await this.callOpenAI({
      model: 'gpt-5-nano',
      input: `Generate a direct, personalized response to this customer review: "${review_text}". Focus on generating the actual response text rather than extensive reasoning.`,
      instructions: systemPrompt,
      max_output_tokens: 3000, // Use reasonable default since length is now handled by business profile
      temperature: 1,
      reasoning: { effort: "low" }, // Minimize reasoning tokens to save costs and focus on output
      text: {
        format: { type: "text" },
        verbosity: "low" // Reduce verbosity to focus on response generation
      }
    });

    // Debug: Log the entire response to see structure
    console.log('🔍 OpenAI Response Structure:', JSON.stringify(response, null, 2));
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response error:', response.error);
    console.log('🔍 Output text:', response.output_text);

    // Use the safe output_text property with fallback
    let generatedContent = response.output_text;
    
    // Fallback: if output_text is not available, aggregate manually
    if (!generatedContent || generatedContent.trim().length === 0) {
      try {
        generatedContent = response.output
          ?.filter(item => item && item.content && Array.isArray(item.content))
          ?.flatMap(item => item.content)
          ?.filter(c => c && c.type === "output_text" && c.text)
          ?.map(c => c.text)
          .join(" ")
          .trim();
      } catch (fallbackError) {
        console.error('❌ Fallback content extraction failed:', fallbackError);
        console.log('🔍 Response structure for debugging:', JSON.stringify(response, null, 2));
      }
    }

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('No content generated by OpenAI API');
    }

    return {
      generated_response: generatedContent,
      confidence_score: 0.95,
      processing_time_ms: Date.now(),
      tokens_used: response.usage?.total_tokens || 0,
      model_used: 'gpt-5-nano',
      tone_used: 'From Business Profile', // Tone now comes from business profile
      max_length_requested: 'From Business Profile', // Length now comes from business profile
      system_prompt_used: systemPrompt // Store the system prompt used
    };
  }

  // Process review processing job
  private async processReviewProcessing(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { review_text, business_category = 'general' } = payload;

    if (!review_text || typeof review_text !== 'string') {
      throw new Error('review_text is required and must be a string');
    }

    console.log(`📊 Processing review for business category: ${business_category}`);

    // Call OpenAI API for review analysis using new Responses API
    const response = await this.callOpenAI({
      model: 'gpt-5-nano',
      input: `Analyze this review: "${review_text}"`,
      instructions: `Analyze this customer review and provide insights. Business category: ${business_category}`,
      max_output_tokens: 200,
      temperature: 1,
      reasoning: { effort: "low" } // Minimize reasoning tokens
    });

    // Use the safe output_text property with fallback
    let suggestedResponse = response.output_text;
    
    // Fallback: if output_text is not available, aggregate manually
    if (!suggestedResponse || suggestedResponse.trim().length === 0) {
      try {
        suggestedResponse = response.output
          ?.filter(item => item && item.content && Array.isArray(item.content))
          ?.flatMap(item => item.content)
          ?.filter(c => c && c.type === "output_text" && c.text)
          ?.map(c => c.text)
          .join(" ")
          .trim();
      } catch (fallbackError) {
        console.error('❌ Fallback content extraction failed:', fallbackError);
        console.log('🔍 Response structure for debugging:', JSON.stringify(response, null, 2));
      }
    }

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
  private async processPromptAnalysis(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { prompt_text, optimization_goals = 'clarity' } = payload;

    if (!prompt_text || typeof prompt_text !== 'string') {
      throw new Error('prompt_text is required and must be a string');
    }

    console.log(`🔍 Analyzing prompt for optimization: ${optimization_goals}`);

    // Call OpenAI API for prompt optimization using new Responses API
    const response = await this.callOpenAI({
      model: 'gpt-5-nano',
      input: `Optimize this prompt: "${prompt_text}"`,
      instructions: `Optimize this prompt for ${optimization_goals}. Provide specific improvements and an optimized version.`,
      max_output_tokens: 300,
      temperature: 1,
      reasoning: { effort: "low" } // Minimize reasoning tokens
    });

    // Use the safe output_text property with fallback
    let optimizedPrompt = response.output_text;
    
    // Fallback: if output_text is not available, aggregate manually
    if (!optimizedPrompt || optimizedPrompt.trim().length === 0) {
      try {
        optimizedPrompt = response.output
          ?.filter(item => item && item.content && Array.isArray(item.content))
          ?.flatMap(item => item.content)
          ?.filter(c => c && c.type === "output_text" && c.text)
          ?.map(c => c.text)
          .join(" ")
          .trim();
      } catch (fallbackError) {
        console.error('❌ Fallback content extraction failed:', fallbackError);
        console.log('🔍 Response structure for debugging:', JSON.stringify(response, null, 2));
      }
    }

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
  private async processSentimentAnalysis(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { text_content, analysis_depth = 'basic' } = payload;

    if (!text_content || typeof text_content !== 'string') {
      throw new Error('text_content is required and must be a string');
    }

    console.log(`😊 Analyzing sentiment with depth: ${analysis_depth}`);

    // Call OpenAI API for sentiment analysis using new Responses API
    const response = await this.callOpenAI({
      model: 'gpt-5-nano',
      input: `Analyze sentiment: "${text_content}"`,
      instructions: `Perform ${analysis_depth} sentiment analysis on this text. Provide sentiment score, key emotions, and insights.`,
      max_output_tokens: 250,
      temperature: 1,
      reasoning: { effort: "low" } // Minimize reasoning tokens
    });

    // Use the safe output_text property with fallback
    let insights = response.output_text;
    
    // Fallback: if output_text is not available, aggregate manually
    if (!insights || insights.trim().length === 0) {
      try {
        insights = response.output
          ?.filter(item => item && item.content && Array.isArray(item.content))
          ?.flatMap(item => item.content)
          ?.filter(c => c && c.type === "output_text" && c.text)
          .map(c => c.text)
          .join(" ")
          .trim();
      } catch (fallbackError) {
        console.error('❌ Fallback content extraction failed:', fallbackError);
        console.log('🔍 Response structure for debugging:', JSON.stringify(response, null, 2));
      }
    }

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

  // Call OpenAI API using the new Responses API
  private async callOpenAI(requestBody: Record<string, unknown>): Promise<OpenAIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Project': OPENAI_PROJECT_ID,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ OpenAI API call failed:', error);
      throw error;
    }
  }

  // Update job status in database
  private async updateJobStatus(jobId: string, result: ProcessingResult): Promise<void> {
    try {
      const updateData: Partial<Job> = {
        status: result.success ? 'completed' : 'failed',
        result: result.success ? result.result : null,
        error: result.success ? null : result.error,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        console.error('❌ Error updating job status:', error);
      } else {
        console.log(`💾 Job ${jobId} status updated to: ${updateData.status}`);
      }

    } catch (error) {
      console.error('❌ Error in updateJobStatus:', error);
    }
  }

  // Utility function to sleep
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Shutdown the worker gracefully
  private async shutdown(): Promise<void> {
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

// Start the worker if this file is run directly
if (require.main === module) {
  const worker = new JobProcessorWorker();
  worker.start().catch(error => {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  });
}

export { JobProcessorWorker };
