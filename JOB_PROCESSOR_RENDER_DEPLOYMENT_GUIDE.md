# 🚀 Job Processor Deployment Guide for Render

This guide will help you deploy your ReviewRepl.ai background job processor to Render and integrate it with your Vercel-hosted main application.

## 📋 Prerequisites

Before starting, ensure you have:

1. **GitHub Repository**: Your project should be hosted on GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Vercel Account**: Your main app should be deployed on Vercel
4. **Environment Variables**: From your Supabase and OpenAI accounts

## 🏗️ Project Structure Setup

Your worker files are located in `src/workers/` and include:

```
src/workers/
├── Dockerfile              # Container configuration
├── package.json           # Worker dependencies
├── job-processor.js       # Compiled worker (generated)
├── job-processor.ts       # Source TypeScript file
└── lib/                   # Compiled utility files
    ├── types/
    │   └── jobs.js
    └── utils/
        └── systemPromptGenerator.js
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes** to your main branch:
   ```bash
   git add .
   git commit -m "Prepare job processor for Render deployment"
   git push origin main
   ```

2. **Ensure all worker files are committed**:
   - `src/workers/` directory with all files
   - `render.yaml` configuration file
   - Updated `package.json` dependencies

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Connect your GitHub repository**:
   - Go to [render.com](https://render.com) and sign in
   - Click "New" → "Background Worker"
   - Connect your GitHub account
   - Select your repository (`reviewrepl.ai`)

2. **Configure the service**:
   - **Name**: `reviewrepl-worker`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Working Directory**: `src/workers`

#### Option B: Using render.yaml (Blueprint)

1. **Push the render.yaml file** to your repository
2. **Go to Render Dashboard** → "Blueprints" → "Connect" your repository
3. **Render will automatically** create the worker service based on the configuration

### Step 3: Configure Environment Variables

In your Render service dashboard, add these environment variables:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # From Supabase
OPENAI_API_KEY=sk-proj-...                                          # From OpenAI
OPENAI_PROJECT_ID=proj_...                                         # From OpenAI
```

#### Optional Variables:
```
NODE_ENV=production
WORKER_POLLING_INTERVAL=200    # Polling interval in milliseconds
WORKER_MAX_RETRIES=3           # Max retry attempts for failed jobs
```

### Step 4: Deploy and Monitor

1. **Trigger deployment** by pushing changes or clicking "Deploy" in Render
2. **Monitor logs** in the Render dashboard to see worker activity
3. **Check worker health** - you should see logs like:
   ```
   🚀 Starting ReviewRepl.ai Worker v2.0.0
   📊 Configuration: Polling every 200ms, Max retries: 3
   🔗 Connected to Supabase: https://...
   🤖 OpenAI API Key: sk-proj-...***
   ⏰ Started at: 2024-01-XX...
   ```

## 🔗 Integration with Vercel

### Step 1: Update Vercel Environment Variables

Your Vercel app needs to know about the worker. Add these environment variables to your Vercel project:

```
# Worker Configuration (Optional - for monitoring)
WORKER_URL=https://reviewrepl-worker.onrender.com
WORKER_STATUS_ENDPOINT=/health  # If you add a health check endpoint
```

### Step 2: Database Configuration

Ensure your Vercel app and Render worker share the same Supabase database:

1. **Use the same Supabase project** for both services
2. **Same service role key** for admin operations
3. **RLS policies** are configured to allow worker access

### Step 3: Job Creation Flow

Your Vercel app creates jobs that the Render worker processes:

```typescript
// In your Vercel API route (e.g., src/app/api/jobs/route.ts)
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { jobType, payload } = await request.json();

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      job_type: jobType,
      payload: payload,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, job: data });
}
```

## 📊 Monitoring and Maintenance

### Health Checks

Add a simple health check endpoint to your worker:

```typescript
// Add to job-processor.ts
if (require.main === module) {
  // Health check endpoint
  const http = require('http');
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(3000, () => {
    console.log('Health check server running on port 3000');
  });

  // Start the worker
  const worker = new JobProcessorWorker();
  worker.start().catch(error => {
    console.error('Failed to start worker:', error);
    process.exit(1);
  });
}
```

### Monitoring Logs

1. **Render Dashboard**: View real-time logs
2. **Log Queries**: Use Render's log search functionality
3. **Alerting**: Set up email alerts for deployment failures

### Scaling Considerations

- **Free Tier**: 750 hours/month, suitable for development
- **Paid Plans**: Start at $7/month for more resources
- **Horizontal Scaling**: Multiple worker instances if needed

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Missing**:
   - Check Render dashboard for correct variable names
   - Ensure no extra spaces or quotes

2. **Database Connection Failed**:
   - Verify Supabase URL and service role key
   - Check Supabase project status

3. **OpenAI API Errors**:
   - Confirm API key and project ID
   - Check OpenAI billing status

4. **Build Failures**:
   - Ensure all dependencies are in `src/workers/package.json`
   - Check Node.js version compatibility

### Debug Commands

```bash
# Check worker status
curl https://your-worker-url.onrender.com/health

# View recent logs
render logs --service reviewrepl-worker

# Restart worker
render restart --service reviewrepl-worker
```

## 🎯 Best Practices

1. **Environment Separation**: Use different Supabase projects for staging/production
2. **Secret Management**: Never commit secrets to version control
3. **Error Handling**: Implement proper error handling and retries
4. **Logging**: Use structured logging for better debugging
5. **Health Monitoring**: Set up monitoring and alerts

## 📞 Support

- **Render Support**: [render.com/docs](https://render.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **OpenAI Platform**: [platform.openai.com/docs](https://platform.openai.com/docs)

## 🚀 Next Steps

1. Test your deployment with a sample job
2. Monitor performance and adjust polling intervals
3. Set up proper error handling and notifications
4. Consider implementing job queues for high-volume scenarios

---

**Happy deploying!** 🎉 Your job processor is now ready to handle background tasks for your ReviewRepl.ai application.
