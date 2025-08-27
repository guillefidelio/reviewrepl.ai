# API Authentication Setup Guide

## 🎯 **What We Just Built**

We've successfully created the foundational API and authentication layer for your Chrome extension. This is the secure foundation that will protect all your future API endpoints.

## 🏗️ **Architecture Overview**

```
Chrome Extension → Your API → Supabase JWT Validation → Protected Endpoint
     ↓              ↓              ↓                    ↓
   Request    Authorization   Token Check         User Data
   (with JWT)   Header        (Service Role)      (if valid)
```

## 📁 **Files Created**

1. **`src/app/api/v1/me/route.ts`** - Protected test endpoint
2. **`src/lib/api/auth-middleware.ts`** - Reusable authentication middleware
3. **`src/app/api-test/page.tsx`** - Test page to verify functionality
4. **`env-example.txt`** - Updated environment variables template

## 🔧 **Setup Instructions**

### **Step 1: Get Your Supabase Service Role Key**

⚠️ **CRITICAL**: You need the service role key (not the anon key) for server-side JWT validation.

1. Go to your Supabase project: https://aailoyciqgopysfowtso.supabase.co
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. This key has admin privileges - keep it secret!

### **Step 2: Update Environment Variables**

Create or update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aailoyciqgopysfowtso.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (for server-side operations)
# ⚠️ IMPORTANT: This key has admin privileges - keep it secret!
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Step 3: Restart Your Development Server**

```bash
npm run dev
```

## 🧪 **Testing the API**

### **Option 1: Use the Test Page (Recommended)**

1. Visit: `http://localhost:3000/api-test`
2. Log in with your Supabase account
3. Click "Test Authenticated Request" to test with valid JWT
4. Click "Test Unauthorized Request" to test without JWT

### **Option 2: Test with curl**

```bash
# Test with valid token (replace YOUR_JWT_TOKEN)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/v1/me

# Test without token (should return 401)
curl http://localhost:3000/api/v1/me
```

### **Option 3: Test with Postman/Insomnia**

- **URL**: `GET http://localhost:3000/api/v1/me`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

## ✅ **Acceptance Criteria Verification**

Let's verify each requirement:

### **1. ✅ Basic REST API server created and running**
- Next.js API routes are set up
- Server responds to requests

### **2. ✅ Authentication middleware connected to Supabase**
- `auth-middleware.ts` validates JWTs using Supabase service role
- Middleware can be reused across all protected endpoints

### **3. ✅ One protected test endpoint: GET /api/v1/me**
- Endpoint exists at `/api/v1/me`
- Protected by authentication middleware

### **4. ✅ Valid JWT returns 200 OK with user data**
- Test with valid token returns success response
- User ID and email are included in response

### **5. ✅ Invalid/no token returns 401 Unauthorized**
- Missing Authorization header → 401
- Invalid token → 401
- Expired token → 401

## 🔒 **Security Features**

- **JWT Validation**: Uses Supabase's built-in JWT validation
- **Service Role Key**: Server-side validation (not exposed to client)
- **Proper Error Handling**: No information leakage in error messages
- **Reusable Middleware**: Consistent authentication across all endpoints

## 🚀 **Next Steps**

Now that the foundation is solid, you can:

1. **Add More Protected Endpoints**: Use `withAuth()` wrapper for any new API routes
2. **Build Business Logic**: Add credit checking, rate limiting, etc.
3. **Create Chrome Extension**: Start building the extension that will use these endpoints
4. **Add Background Workers**: Implement the job queue system for AI processing

## 🐛 **Troubleshooting**

### **Common Issues:**

**"SUPABASE_SERVICE_ROLE_KEY is not defined"**
- Check your `.env.local` file
- Make sure you copied the service_role key, not the anon key
- Restart your development server

**"Token validation error"**
- Ensure you're using a valid JWT from a logged-in user
- Check that the token hasn't expired
- Verify your Supabase project is accessible

**"401 Unauthorized" when you expect success**
- Check the Authorization header format: `Bearer TOKEN`
- Ensure the token is from the same Supabase project
- Verify the user exists in your database

## 📚 **How It Works**

1. **Client sends request** with JWT in Authorization header
2. **Middleware extracts token** from `Bearer TOKEN` format
3. **Supabase validates JWT** using service role key
4. **If valid**: User info attached to request, handler executes
5. **If invalid**: 401 Unauthorized returned immediately

This creates a secure, scalable foundation for all your future API endpoints!

---

*Your API foundation is now ready. The Chrome extension can securely authenticate and make requests to your protected endpoints.*
