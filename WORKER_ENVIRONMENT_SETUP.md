# 🔐 Worker Environment Variables Setup

This guide covers setting up environment variables for your ReviewRepl.ai background job processor on Render.

## 📋 Required Environment Variables

### Supabase Configuration

1. **NEXT_PUBLIC_SUPABASE_URL**
   - **Where to find**: Supabase Dashboard → Settings → API → Project URL
   - **Example**: `https://aailoyciqgopysfowtso.supabase.co`
   - **Required**: Yes

2. **SUPABASE_SERVICE_ROLE_KEY**
   - **Where to find**: Supabase Dashboard → Settings → API → service_role key
   - **Security**: 🔴 Keep this secret! Has admin privileges
   - **Required**: Yes
   - **Note**: Never commit this to version control

### OpenAI Configuration

3. **OPENAI_API_KEY**
   - **Where to find**: [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Security**: 🔴 Keep this secret!
   - **Required**: Yes
   - **Note**: Use a separate API key for production

4. **OPENAI_PROJECT_ID**
   - **Where to find**: OpenAI Platform → Projects → Your Project ID
   - **Required**: Yes

### Worker Configuration (Optional)

5. **WORKER_POLLING_INTERVAL**
   - **Default**: `200` (milliseconds)
   - **Description**: How often the worker checks for new jobs
   - **Optional**: Yes

6. **WORKER_MAX_RETRIES**
   - **Default**: `3`
   - **Description**: Maximum retry attempts for failed jobs
   - **Optional**: Yes

7. **NODE_ENV**
   - **Default**: `production`
   - **Description**: Node.js environment
   - **Optional**: Yes

## 🚀 Setting Up Variables in Render

### Step 1: Access Render Dashboard

1. Go to [render.com](https://render.com)
2. Navigate to your `reviewrepl-worker` service
3. Click on "Environment" in the left sidebar

### Step 2: Add Environment Variables

Click "Add Environment Variable" for each required variable:

#### Format:
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```

#### Security Notes:
- 🔴 **Never** use quotes around values unless they're part of the value
- 🔴 **Never** commit `.env` files with real values to Git
- 🔴 **Always** use the service role key, not the anon key

## 🔍 Verification Steps

### Test Database Connection

After setting up variables, check your worker logs for:

```
🔍 DEBUG: Database connection test result: SUCCESS
✅ NEXT_PUBLIC_SUPABASE_URL: SET
✅ SUPABASE_SERVICE_ROLE_KEY: SET
```

### Test OpenAI Connection

Look for successful API calls in logs:

```
🔄 Calling OpenAI API...
✅ OpenAI API call successful
```

### Test Full Worker Startup

Successful startup should show:

```
🚀 Starting ReviewRepl.ai Worker v2.0.0
📊 Configuration: Polling every 200ms, Max retries: 3
🔗 Connected to Supabase: https://...
🤖 OpenAI API Key: sk-proj-...***
⏰ Started at: 2024-...
✅ Environment check passed! Starting worker...
```

## 🔧 Troubleshooting Environment Issues

### "Environment variable not found" errors

**Symptoms:**
```
❌ NEXT_PUBLIC_SUPABASE_URL is required
❌ SUPABASE_SERVICE_ROLE_KEY is required
```

**Solutions:**
1. Check variable names for typos
2. Ensure no extra spaces in variable names
3. Redeploy the service after adding variables
4. Check Render dashboard for variable values

### Database Connection Failed

**Symptoms:**
```
🔍 DEBUG: Database connection test result: FAILED
```

**Solutions:**
1. Verify Supabase URL is correct
2. Check service role key hasn't expired
3. Ensure Supabase project is active
4. Verify RLS policies allow worker access

### OpenAI API Errors

**Symptoms:**
```
❌ OpenAI API error: 401 Unauthorized
```

**Solutions:**
1. Verify API key is correct and active
2. Check OpenAI billing status
3. Ensure project ID matches the API key
4. Test API key in OpenAI playground

## 🛡️ Security Best Practices

### 1. Separate API Keys
- Use different OpenAI API keys for development and production
- Rotate keys regularly

### 2. Environment Separation
- Use different Supabase projects for staging and production
- Never share service role keys between environments

### 3. Access Control
- Limit Supabase service role key usage to necessary operations
- Implement proper RLS policies in Supabase

### 4. Monitoring
- Set up alerts for failed deployments
- Monitor API usage and costs
- Log security events

## 📊 Environment Variable Checklist

Before deploying, verify:

- [ ] NEXT_PUBLIC_SUPABASE_URL is set and accessible
- [ ] SUPABASE_SERVICE_ROLE_KEY is the service role key (not anon key)
- [ ] OPENAI_API_KEY is valid and has credits
- [ ] OPENAI_PROJECT_ID matches the API key
- [ ] Worker starts without environment errors
- [ ] Database connection test passes
- [ ] Worker can successfully process a test job

## 🔄 Updating Environment Variables

### In Render:
1. Go to service dashboard
2. Navigate to Environment section
3. Update variable values
4. Click "Save Changes"
5. **Redeploy** the service for changes to take effect

### Important Notes:
- Environment variable changes require a service restart
- Some changes may take a few minutes to propagate
- Always test after updating critical variables

---

**Environment setup complete!** ✅ Your worker is now ready to process jobs securely.
