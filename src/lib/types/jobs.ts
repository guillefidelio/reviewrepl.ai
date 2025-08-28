// Job status enum matching the database
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Base job interface
export interface Job {
  id: string;
  user_id: string;
  status: JobStatus;
  job_type: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown> | null;
  error?: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

// Job creation interface (for INSERT operations)
export interface CreateJobRequest {
  job_type: string;
  payload: Record<string, unknown>;
}

// Job update interface (for UPDATE operations)
export interface UpdateJobRequest {
  status?: JobStatus;
  result?: Record<string, unknown> | null;
  error?: string | null;
  retry_count?: number;
}

// Job response interface (what the API returns)
export interface JobResponse {
  success: boolean;
  job: Job;
}

// Jobs list response interface
export interface JobsListResponse {
  success: boolean;
  jobs: Job[];
  total: number;
}

// Common job types
export const JOB_TYPES = {
  AI_GENERATION: 'ai_generation',
  REVIEW_PROCESSING: 'review_processing',
  PROMPT_ANALYSIS: 'prompt_analysis',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
} as const;

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

// Job payload examples for different job types
export interface AIGenerationPayload {
  review_text: string;
  business_profile?: Record<string, unknown>;
  custom_prompt?: string; // For pro mode custom prompts
  user_preferences?: Record<string, unknown>;
  max_length?: number;
  tone?: string;
}

export interface ReviewProcessingPayload {
  review_text: string;
  business_category: string;
  response_style: string;
  include_questions?: boolean;
}

// Job result examples
export interface AIGenerationResult {
  generated_response: string;
  confidence_score: number;
  processing_time_ms: number;
  tokens_used: number;
}

export interface ReviewProcessingResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  key_topics: string[];
  suggested_response: string;
  response_rating: number;
}
