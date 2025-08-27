-- Test script to verify the jobs table creation and RLS policies
-- Run this after applying the main migration

-- 1. Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- 2. Verify indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'jobs';

-- 3. Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'jobs';

-- 4. Verify RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'jobs';

-- 5. Verify enum type
SELECT 
    typname,
    enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'job_status'
ORDER BY e.enumsortorder;

-- 6. Test insert (this should work for authenticated users)
-- Note: This will only work when run by an authenticated user
-- INSERT INTO jobs (user_id, job_type, payload) 
-- VALUES (auth.uid(), 'test_job', '{"test": "data"}'::jsonb);

-- 7. Test select (this should only return user's own jobs)
-- SELECT * FROM jobs WHERE user_id = auth.uid();
