-- Migration: Create jobs table with Row Level Security
-- This table will store and track all asynchronous operations

-- Create the job status enum type
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create the jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status job_status NOT NULL DEFAULT 'pending',
    job_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    result JSONB,
    error TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only read their own jobs
CREATE POLICY "Users can view own jobs" ON jobs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can only create jobs for themselves
CREATE POLICY "Users can create own jobs" ON jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own jobs (for status updates)
CREATE POLICY "Users can update own jobs" ON jobs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE jobs IS 'Stores asynchronous job operations for AI processing and other background tasks';
COMMENT ON COLUMN jobs.status IS 'Current status of the job: pending, processing, completed, or failed';
COMMENT ON COLUMN jobs.job_type IS 'Type of job (e.g., ai_generation, review_processing)';
COMMENT ON COLUMN jobs.payload IS 'Input data required for job execution';
COMMENT ON COLUMN jobs.result IS 'Output data from completed job execution';
COMMENT ON COLUMN jobs.retry_count IS 'Number of retry attempts for failed jobs';
