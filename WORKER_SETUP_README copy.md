# Background Worker Setup Guide

## 🎯 **What This Worker Does**

The background worker is a standalone Node.js process that:

1. **Polls the jobs table** every 5 seconds for pending jobs
2. **Atomically locks jobs** to prevent multiple workers from processing the same job
3. **Calls OpenAI API** to process AI generation tasks
4. **Updates job status** to completed/failed with results
5. **Provides real-time logging** of all operations

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js API   │    │  Background     │    │   OpenAI API    │
│                 │    │    Worker       │    │                 │
│ POST /api/jobs  │───▶│  (job-processor)│───▶│  gpt-5-nano  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Supabase      │    │   AI Response   │
│   (jobs table)  │    │   (job status   │    │   (stored in    │
│   (pending)     │    │    updates)     │    │    result)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 **Prerequisites**

### **1. Environment Variables**
Add these to your `.env.local` file:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Apply Database Migration**
Run this SQL in your Supabase SQL Editor:

```sql
-- File: src/lib/migrations/003_create_credit_consuming_job_function.sql
-- This creates the atomic credit consumption function
```

## 🚀 **How to Run the Worker**

### **Option 1: Development Mode (Recommended for Testing)**
```bash
npm run worker:dev
```

### **Option 2: Production Mode**
```bash
# Build the worker
npm run worker:build

# Start the built worker
npm run worker:start
```

### **Option 3: Manual Build and Run**
```bash
# Build manually
node src/workers/build-worker.js

# Run manually
cd dist/workers
npm start
```

## 🧪 **Testing the Complete System**

### **Step 1: Start the Worker**
```bash
npm run worker:dev
```

You should see:
```
🚀 Starting Job Processor Worker v1.0.0
📊 Configuration: Polling every 5000ms, Max retries: 3
🔗 Connected to Supabase: https://your-project.supabase.co
⏰ Started at: 2024-01-01T00:00:00.000Z
────────────────────────────────────────────────────────────
⏳ No pending jobs found, waiting...
```

### **Step 2: Create a Job via API**
1. **Start your Next.js app**: `npm run dev`
2. **Go to**: `/api-test`
3. **Create a job** with type `ai_generation`
4. **Watch the worker** pick it up automatically

### **Step 3: Monitor Job Processing**
The worker will show:
```
🔒 Locked job abc123 (ai_generation) for processing
📝 Payload: {"review_text": "Great service!", "tone": "friendly"}
🔄 Processing job abc123 (ai_generation)...
🤖 Generating AI response for review: "Great service!..."
💾 Job abc123 status updated to: completed
✅ Job abc123 completed successfully in 2500ms
📊 Total processed: 1, Failed: 0
```

## 🔧 **Worker Configuration**

### **Environment Variables**
| Variable | Description | Default |
|----------|-------------|---------|
| `POLLING_INTERVAL` | How often to check for jobs (ms) | 5000 |
| `MAX_RETRIES` | Maximum retry attempts for failed jobs | 3 |

### **Job Types Supported**
1. **`ai_generation`** - Generate AI responses to reviews
2. **`review_processing`** - Analyze and process reviews
3. **`prompt_analysis`** - Optimize AI prompts
4. **`sentiment_analysis`** - Analyze text sentiment

## 📊 **Monitoring and Logs**

### **Real-time Logs**
The worker provides comprehensive logging:
- 🚀 **Startup information**
- 🔒 **Job locking and processing**
- 🤖 **AI API calls and responses**
- 💾 **Database updates**
- 📊 **Statistics and performance metrics**

### **Job Status Tracking**
Monitor jobs in Supabase:
```sql
-- Check job statuses
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time
FROM jobs 
GROUP BY status;
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "OpenAI API error"**
- **Check**: `OPENAI_API_KEY` in `.env.local`
- **Verify**: API key has sufficient credits
- **Test**: API key works in OpenAI playground

#### **2. "Supabase connection failed"**
- **Check**: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- **Verify**: Service role key has proper permissions
- **Test**: Connection in Supabase dashboard

#### **3. "No jobs found"**
- **Check**: Jobs exist in database with `pending` status
- **Verify**: RLS policies allow service role access
- **Test**: Create a test job via API

#### **4. "Worker not processing jobs"**
- **Check**: Worker is running and connected
- **Verify**: Database migration applied correctly
- **Test**: Check worker logs for errors

### **Debug Mode**
Enable verbose logging by modifying the worker:
```typescript
// In job-processor.ts, add more console.log statements
console.log('🔍 Debug: Checking for pending jobs...');
```

## 🔒 **Security Considerations**

### **Service Role Key**
- **Never expose** in client-side code
- **Use only** for server-side operations
- **Restrict access** to necessary database operations

### **OpenAI API Key**
- **Keep secret** and secure
- **Monitor usage** to prevent abuse
- **Set rate limits** if needed

### **Database Access**
- **RLS policies** still apply
- **Worker bypasses RLS** only for necessary operations
- **User data isolation** maintained

## 📈 **Scaling Considerations**

### **Multiple Workers**
To run multiple workers:
1. **Copy the worker script** to different directories
2. **Run each** with different environment variables
3. **Monitor** for job conflicts (shouldn't happen with atomic locking)

### **Load Balancing**
- **Worker processes** can run on different machines
- **Database handles** concurrent access safely
- **Jobs are processed** in FIFO order

### **Performance Monitoring**
Track these metrics:
- **Jobs processed per minute**
- **Average processing time**
- **Error rates**
- **OpenAI API response times**

## 🎯 **Next Steps**

After the worker is running successfully:

1. **Test with real data** - Create various job types
2. **Monitor performance** - Check processing times and error rates
3. **Scale up** - Run multiple workers if needed
4. **Integrate with Chrome extension** - Replace direct Supabase calls
5. **Add monitoring** - Dashboard for worker statistics

## 📚 **File Structure**

```
src/
├── workers/
│   ├── job-processor.ts      # Main worker script
│   └── build-worker.js       # Build script
├── lib/
│   └── migrations/
│       └── 003_create_credit_consuming_job_function.sql
└── package.json              # Updated with worker scripts
```

Your background worker is now ready to process jobs asynchronously! 🎉
