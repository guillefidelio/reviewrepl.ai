# Jobs Table Migration Guide

## 🎯 **What This Migration Creates**

This migration creates the foundational `jobs` table that will power your entire asynchronous job system. This table replaces the need for Firebase Cloud Functions by providing a robust, scalable way to queue and track background operations.

## 🏗️ **Table Schema Overview**

| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | Primary key | `gen_random_uuid()` |
| `user_id` | `uuid` | Foreign key to auth.users | Required |
| `status` | `job_status` | Job state enum | `'pending'` |
| `job_type` | `text` | Job type identifier | Required |
| `payload` | `jsonb` | Input data for job | Required |
| `result` | `jsonb` | Output data from job | `null` |
| `error` | `text` | Error message if failed | `null` |
| `retry_count` | `integer` | Retry attempts | `0` |
| `created_at` | `timestamptz` | Creation timestamp | `now()` |
| `updated_at` | `timestamptz` | Last update timestamp | `now()` |

## 🔒 **Security Features**

- **Row Level Security (RLS)**: Enabled by default
- **User Isolation**: Users can only access their own jobs
- **Policy 1**: SELECT - Users can only read their own jobs
- **Policy 2**: INSERT - Users can only create jobs for themselves
- **Policy 3**: UPDATE - Users can only update their own jobs

## 📁 **Files Created**

1. **`001_create_jobs_table.sql`** - Main migration file
2. **`test_jobs_table.sql`** - Verification script
3. **`src/lib/types/jobs.ts`** - TypeScript types
4. **Updated `src/lib/supabase.ts`** - Database types

## 🚀 **How to Apply the Migration**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to your Supabase project**: https://aailoyciqgopysfowtso.supabase.co
2. **Navigate to**: SQL Editor
3. **Create a new query** and paste the contents of `001_create_jobs_table.sql`
4. **Run the query** - this will create the table and all policies
5. **Verify the migration** by running the test script

### **Option 2: Supabase CLI (Advanced)**

```bash
# If you have Supabase CLI installed
supabase db push
```

## ✅ **Verification Steps**

After running the migration, verify everything is working:

### **1. Check Table Structure**
Run this in the SQL Editor:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;
```

### **2. Verify RLS is Enabled**
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'jobs';
```

### **3. Check RLS Policies**
```sql
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'jobs';
```

### **4. Test the Enum Type**
```sql
SELECT 
    typname,
    enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'job_status'
ORDER BY e.enumsortorder;
```

## 🧪 **Testing the Migration**

### **Test 1: Create a Test Job**
```sql
-- This should work for authenticated users
INSERT INTO jobs (user_id, job_type, payload) 
VALUES (
    'your-user-id-here', 
    'test_job', 
    '{"test": "data", "timestamp": "2024-01-01"}'::jsonb
);
```

### **Test 2: Verify User Isolation**
```sql
-- This should only return jobs for the current user
SELECT * FROM jobs WHERE user_id = auth.uid();
```

## 🔧 **Troubleshooting**

### **Common Issues:**

**"Table already exists"**
- The table was already created in a previous run
- This is safe to ignore

**"Policy already exists"**
- Policies were already created
- This is safe to ignore

**"Type job_status already exists"**
- The enum type was already created
- This is safe to ignore

**"Permission denied"**
- Make sure you're running as a superuser or have the right permissions
- Check that you're in the correct database

## 📊 **Performance Considerations**

- **Indexes**: Created on `user_id`, `status`, `created_at`, and `job_type`
- **JSONB**: Efficient storage and querying of payload and result data
- **Cascade Delete**: Jobs are automatically deleted when users are deleted
- **Auto-timestamps**: `updated_at` is automatically maintained

## 🚀 **Next Steps**

After this migration is complete, you can:

1. **Create Job Management API Endpoints** using the `withAuth()` middleware
2. **Build the Background Worker** to process pending jobs
3. **Implement Job Status Updates** for real-time progress tracking
4. **Add Retry Logic** for failed jobs
5. **Create Job Monitoring Dashboard** for users

## 📚 **How It Works**

1. **User creates a job** → INSERT into jobs table with status 'pending'
2. **Background worker picks up job** → Updates status to 'processing'
3. **Worker processes job** → Updates status to 'completed' with result
4. **User retrieves result** → SELECT from jobs table for their user_id
5. **Error handling** → Failed jobs get status 'failed' with error message

---

*Your jobs table is now ready to power the asynchronous processing system! This foundation will enable you to build scalable, reliable background job processing for your Chrome extension.*
