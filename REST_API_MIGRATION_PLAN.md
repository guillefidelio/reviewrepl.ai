# Chrome Extension REST API Migration Plan

## 🎯 **Migration Goal**
Replace Cloud Functions with a REST API hosted on your Next.js website for better performance, control, and maintainability.

## 🏗️ **New Architecture Overview**

### **Current Flow (Cloud Functions)**
```
Chrome Extension → Cloud Functions → Database
     ↓                    ↓           ↓
   Request         Cold Start Delay   Data
   (Slow)         (2-10 seconds)    Return
```

### **New Flow (REST API)**
```
Chrome Extension → Your Website API → Background Worker → Database
     ↓                    ↓                    ↓           ↓
   Request         Instant Acknowledgment   AI Processing   Data
   (Fast)         (<100ms)                (2-10 seconds)  Return
```

## 📁 **Project Structure Changes**

### **New Directory Structure**
```
src/
├── app/
│   ├── api/                    # NEW: API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── reviews/           # Review processing endpoints
│   │   ├── prompts/           # Prompt management endpoints
│   │   └── users/             # User profile endpoints
│   ├── dashboard/             # Existing dashboard
│   └── ...                    # Other existing routes
├── lib/
│   ├── api/                   # NEW: API utilities
│   │   ├── auth.ts           # Auth API functions
│   │   ├── reviews.ts        # Review API functions
│   │   └── types.ts          # API request/response types
│   ├── workers/               # NEW: Background job processing
│   │   ├── review-processor.ts # AI review processing worker
│   │   └── job-queue.ts      # Job queue management
│   ├── supabase.ts           # Existing Supabase client
│   └── ...                   # Other existing files
└── components/                # Existing components
```

## 🔌 **API Endpoints Design**

### **1. Authentication Endpoints**
```
POST   /api/auth/login         # User login
POST   /api/auth/register      # User registration
POST   /api/auth/refresh       # Refresh access token
DELETE /api/auth/logout        # User logout
```

### **2. Review Processing Endpoints**
```
POST   /api/reviews/jobs       # Create review processing job (async)
GET    /api/reviews/jobs/:id   # Get job status and result
POST   /api/reviews/analyze    # Analyze review sentiment
GET    /api/reviews/history    # Get user's review history
```

### **3. Prompt Management Endpoints**
```
GET    /api/prompts            # Get user's prompts
POST   /api/prompts            # Create new prompt
PUT    /api/prompts/:id        # Update prompt
DELETE /api/prompts/:id        # Delete prompt
```

### **4. User Profile Endpoints**
```
GET    /api/users/profile      # Get user profile
PUT    /api/users/profile      # Update user profile
GET    /api/users/credits      # Get user credits
POST   /api/users/credits      # Update user credits
```

## 🔐 **Authentication & Security**

### **JWT Token Strategy**
- **Access Token**: Short-lived (15 minutes) for API calls
- **Refresh Token**: Long-lived (7 days) stored securely
- **Chrome Extension**: Stores tokens in chrome.storage.local

### **Security Measures**
- CORS configuration for Chrome extension origin
- Rate limiting per user/IP
- Input validation and sanitization
- SQL injection prevention via Supabase
- Row Level Security (RLS) policies

## 🔧 **Chrome Extension Changes**

### **New API Client Structure**
```typescript
// Before: Direct Supabase calls
const { data, error } = await supabase
  .from('reviews')
  .select('*')
  .eq('user_id', userId);

// After: REST API calls with job-based processing
const response = await fetch('/api/reviews/jobs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ review_text: '...', user_id: userId })
});
const { job_id } = await response.json();

// Poll for job completion
const checkJobStatus = async (jobId: string) => {
  const statusResponse = await fetch(`/api/reviews/jobs/${jobId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return statusResponse.json();
};
```

### **Token Management**
```typescript
// Store tokens securely
chrome.storage.local.set({
  accessToken: 'jwt_token_here',
  refreshToken: 'refresh_token_here'
});

// Use tokens in API calls
const makeApiCall = async (endpoint: string, options = {}) => {
  const { accessToken } = await chrome.storage.local.get(['accessToken']);
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

## 🚀 **Implementation Phases**

### **Sprint 1: Foundation (1-2 weeks)**
- [ ] Create API route structure in Next.js
- [ ] Implement JWT authentication system
- [ ] Set up CORS and security middleware
- [ ] Create basic user authentication endpoints
- [ ] Set up development and testing environment

### **Sprint 2: Core Features & Infrastructure (2-3 weeks)**
- [ ] Implement review processing API with job-based architecture
- [ ] Create prompt management endpoints
- [ ] Add user profile management
- [ ] **Implement and test background worker process**
- [ ] Set up job queue system
- [ ] Add rate limiting and validation

### **Sprint 3: Chrome Extension Integration (2-3 weeks)**
- [ ] Update Chrome extension to use REST API
- [ ] Implement token management
- [ ] Replace Supabase calls with API calls
- [ ] Add error handling and retry logic
- [ ] Implement job status polling

### **Sprint 4: Testing & Optimization (1-2 weeks)**
- [ ] Performance testing and optimization
- [ ] Security audit and penetration testing
- [ ] Load testing for concurrent users
- [ ] Documentation and deployment
- [ ] Monitor and tune background worker performance

## 📊 **Performance Benefits & Expectations**

### **Key Performance Improvements**
- **API Response Time**: Cold start delays eliminated → <100ms acknowledgment
- **UI Responsiveness**: Instant feedback when submitting requests
- **Reliability**: No more function timeouts or cold start failures
- **Scalability**: Better horizontal scaling and resource management

### **Important: Managing Expectations**
⚠️ **Critical Distinction**: The performance improvement is in **app responsiveness**, not AI speed

- **API Response Time**: <100ms to acknowledge request and create job ✅
- **End-to-End AI Processing**: Still 2-10 seconds (dependent on AI provider) ⏱️
- **User Experience**: Immediate feedback + reliable processing vs. waiting + potential failures

### **Monitoring Metrics**
- API acknowledgment response times
- Job processing completion rates
- Background worker performance
- Error rates and recovery times
- User satisfaction scores

## 🔧 **Technical Requirements**

### **Next.js Configuration**
- API routes with proper middleware
- JWT token validation
- CORS configuration for Chrome extension
- Rate limiting implementation
- Error handling and logging

### **Database Integration**
- Supabase client for database operations
- Row Level Security policies
- Connection pooling optimization
- Query performance monitoring

### **Background Worker Infrastructure**
- Job queue management system
- Worker process monitoring and restart logic
- Error handling and retry mechanisms
- Performance metrics collection

### **Chrome Extension Updates**
- Token storage and management
- API client implementation
- Error handling and retry logic
- Offline capability considerations

## 🚨 **Potential Challenges**

### **1. CORS Configuration**
- Chrome extension origin handling
- Preflight request optimization
- Cross-origin resource sharing setup

### **2. Token Management**
- Secure storage in Chrome extension
- Automatic token refresh
- Handling expired tokens gracefully

### **3. Rate Limiting**
- Per-user rate limiting
- IP-based rate limiting
- Fair usage policies

### **4. Error Handling**
- Network error recovery
- Retry logic implementation
- User-friendly error messages

### **5. Worker Process Management & Monitoring** ⚠️ **NEW OPERATIONAL RESPONSIBILITY**
- **Process Reliability**: How to ensure the worker process is always running?
- **Crash Recovery**: What happens if it crashes? How does it restart?
- **Performance Monitoring**: How to track worker performance and error rates?
- **Resource Management**: Memory usage, CPU utilization, and scaling decisions
- **Logging & Debugging**: Comprehensive logging for troubleshooting

*Note: With Cloud Functions, Google handled this infrastructure for you. Now you are responsible for maintaining a reliable background processing system.*

## 📈 **Success Metrics**

### **Performance Metrics**
- [ ] API acknowledgment time <100ms (95th percentile)
- [ ] Zero cold start delays
- [ ] 99.9% uptime for API endpoints
- [ ] Background worker uptime >99.5%
- [ ] Support for 1000+ concurrent users

### **User Experience Metrics**
- [ ] Improved review submission responsiveness
- [ ] Better extension reliability
- [ ] Enhanced error recovery
- [ ] Consistent processing times

### **Business Metrics**
- [ ] Reduced infrastructure costs
- [ ] Improved user retention
- [ ] Better scalability for growth
- [ ] Enhanced developer productivity

## 🔄 **Rollback Plan**

### **If Issues Arise**
1. **Immediate**: Switch back to Cloud Functions
2. **Investigation**: Debug API and worker issues
3. **Fix**: Resolve identified problems
4. **Re-deploy**: Gradual rollout with monitoring

### **Rollback Triggers**
- API response time >500ms
- Error rate >5%
- Background worker failure rate >10%
- User complaints about performance
- Critical security vulnerabilities

## 📋 **Next Steps**

1. **Review this refined plan** with your team
2. **Set up development environment** for API development
3. **Create API route structure** in Next.js
4. **Implement authentication system**
5. **Begin Chrome extension updates**
6. **Test thoroughly** before production deployment
7. **Plan for ongoing operational maintenance** of the new infrastructure

---

*This migration will significantly improve your Chrome extension's responsiveness and reliability while giving you full control over your API infrastructure. Remember: the goal is better user experience through immediate feedback and reliable processing, not faster AI responses.*

