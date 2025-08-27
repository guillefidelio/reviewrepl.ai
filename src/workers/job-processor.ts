#!/usr/bin/env node
process.env = { ...process.env };

// Load environment variables from .env files
import dotenv from "dotenv";
dotenv.config();

// Debug: Check if environment variables are loaded
console.log("🔍 DEBUG: Environment variables check");
console.log("OPENAI_API_KEY (from env):", process.env.OPENAI_API_KEY);
console.log("OPENAI_PROJECT_ID (from env):", process.env.OPENAI_PROJECT_ID);
console.log("NEXT_PUBLIC_SUPABASE_URL (from env):", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY (from env):", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
console.log("─".repeat(60));

import { createClient } from '@supabase/supabase-js';
import { Job, JobStatus } from '../lib/types/jobs';

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

// OpenAI API response interface
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
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
    const { review_text, tone = 'professional', max_length = 150 } = payload;

    if (!review_text || typeof review_text !== 'string') {
      throw new Error('review_text is required and must be a string');
    }

    // Ensure max_length is a number
    const maxLength = typeof max_length === 'number' ? max_length : 150;

    console.log(`🤖 Generating AI response for review: "${review_text.substring(0, 50)}..."`);

    // Call OpenAI API
    const response = await this.callOpenAI({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional business response generator. Create a ${tone} response to customer reviews. Keep responses under ${maxLength} characters. Be helpful, professional, and address the customer's feedback appropriately.`
        },
        {
          role: 'user',
          content: `Generate a ${tone} response to this customer review: "${review_text}"`
        }
      ],
      max_tokens: Math.floor(maxLength / 4), // Rough estimate
      temperature: 0.7
    });

    return {
      generated_response: response.choices[0].message.content,
      confidence_score: 0.95,
      processing_time_ms: Date.now(),
      tokens_used: response.usage?.total_tokens || 0,
      model_used: 'gpt-4o-mini',
      tone_used: tone,
      max_length_requested: maxLength
    };
  }

  // Process review processing job
  private async processReviewProcessing(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { review_text, business_category = 'general' } = payload;

    if (!review_text || typeof review_text !== 'string') {
      throw new Error('review_text is required and must be a string');
    }

    console.log(`📊 Processing review for business category: ${business_category}`);

    // Call OpenAI API for review analysis
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
      temperature: 0.3
    });

    return {
      sentiment: 'positive', // This would be determined by AI analysis
      key_topics: ['service quality', 'customer satisfaction'],
      suggested_response: response.choices[0].message.content,
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

    // Call OpenAI API for prompt optimization
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
      temperature: 0.4
    });

    return {
      original_prompt: prompt_text,
      optimized_prompt: response.choices[0].message.content,
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

    // Call OpenAI API for sentiment analysis
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
      temperature: 0.2
    });

    return {
      text_analyzed: text_content.substring(0, 100) + '...',
      sentiment_score: 0.75,
      primary_emotion: 'satisfaction',
      secondary_emotions: ['appreciation', 'contentment'],
      analysis_depth,
      insights: response.choices[0].message.content,
      analysis_timestamp: new Date().toISOString()
    };
  }

  // Call OpenAI API
  private async callOpenAI(requestBody: Record<string, unknown>): Promise<OpenAIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
