-- Migration: Create credit-consuming job creation function
-- This function atomically checks credits, consumes them, and creates a job

-- Function to create a job with credit consumption in a single transaction
CREATE OR REPLACE FUNCTION create_job_with_credit_consumption(
    p_user_id UUID,
    p_job_type TEXT,
    p_payload JSONB,
    p_credits_required INTEGER DEFAULT 1
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    job_id UUID,
    credits_remaining INTEGER,
    error_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_credits INTEGER;
    v_job_record RECORD;
    v_error_message TEXT;
BEGIN
    -- Start transaction
    BEGIN
        -- Lock the user's credit record for update to prevent race conditions
        SELECT credits_available INTO v_current_credits
        FROM users
        WHERE id = p_user_id
        FOR UPDATE;
        
        -- Check if user exists
        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, 'User not found', NULL::UUID, 0, 'USER_NOT_FOUND';
            RETURN;
        END IF;
        
        -- Check if user has enough credits
        IF v_current_credits < p_credits_required THEN
            RETURN QUERY SELECT FALSE, 'Insufficient credits', NULL::UUID, v_current_credits, 'INSUFFICIENT_CREDITS';
            RETURN;
        END IF;
        
        -- Consume credits
        UPDATE users 
        SET 
            credits_available = credits_available - p_credits_required,
            credits_last_updated = now(),
            updated_at = now()
        WHERE id = p_user_id;
        
        -- Create the job
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
        RETURNING * INTO v_job_record;
        
        -- Get updated credit balance
        SELECT credits_available INTO v_current_credits
        FROM users
        WHERE id = p_user_id;
        
        -- Return success with job details and remaining credits
        RETURN QUERY SELECT TRUE, 'Job created successfully', v_job_record.id, v_current_credits, NULL;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback will happen automatically
            GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
            RETURN QUERY SELECT FALSE, 'Database error: ' || v_error_message, NULL::UUID, 0, 'DATABASE_ERROR';
    END;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_job_with_credit_consumption(UUID, TEXT, JSONB, INTEGER) TO authenticated;

-- Add comment
COMMENT ON FUNCTION create_job_with_credit_consumption IS 'Atomically checks credits, consumes them, and creates a job in a single transaction. Prevents race conditions and ensures data consistency.';
