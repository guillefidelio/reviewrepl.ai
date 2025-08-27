-- Migration: Create RLS bypass functions for service role operations
-- These functions allow the service role to perform operations while maintaining security

-- Drop existing functions if they exist (to handle type changes)
DROP FUNCTION IF EXISTS create_job_with_rls_bypass(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS list_jobs_with_rls_bypass(UUID);

-- Function to create a job with RLS bypass (for service role operations)
CREATE OR REPLACE FUNCTION create_job_with_rls_bypass(
    p_user_id UUID,
    p_job_type TEXT,
    p_payload JSONB
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    status job_status,
    job_type TEXT,
    payload JSONB,
    result JSONB,
    error TEXT,
    retry_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert the job with RLS temporarily disabled
    RETURN QUERY
    INSERT INTO jobs (
        user_id,
        job_type,
        payload,
        status,
        retry_count
    )
    VALUES (
        p_user_id,
        p_job_type,
        p_payload,
        'pending'::job_status,
        0
    )
    RETURNING *;
END;
$$;

-- Function to list jobs with RLS bypass (for service role operations)
CREATE OR REPLACE FUNCTION list_jobs_with_rls_bypass(
    p_user_id UUID
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    status job_status,
    job_type TEXT,
    payload JSONB,
    result JSONB,
    error TEXT,
    retry_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return jobs for the specified user with RLS temporarily disabled
    RETURN QUERY
    SELECT *
    FROM jobs
    WHERE user_id = p_user_id
    ORDER BY created_at DESC;
END;
$$;

-- Grant execute permissions on these functions
GRANT EXECUTE ON FUNCTION create_job_with_rls_bypass(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION list_jobs_with_rls_bypass(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION create_job_with_rls_bypass IS 'Creates a job while bypassing RLS for service role operations. Only callable by authenticated users.';
COMMENT ON FUNCTION list_jobs_with_rls_bypass IS 'Lists jobs for a specific user while bypassing RLS for service role operations. Only callable by authenticated users.';
