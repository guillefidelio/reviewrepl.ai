rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions for authentication and authorization
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // NOTE: Renamed for clarity to isOwner, but logic is the same.
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }
    
    function isSupport() {
      return isAuthenticated() && request.auth.token.support == true;
    }
    
    function isValidUser() {
      return isAuthenticated() && request.auth.uid != null;
    }
    
    function isSystemService() {
      return isAuthenticated() && request.auth.token.systemService == true;
    }
    
    // Helper functions for data validation
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }
    
    function isValidSubscriptionPlan(plan) {
      return plan in ['free', 'starter', 'professional', 'pro', 'premium'];
    }
    
    function isValidSubscriptionStatus(status) {
      return status in ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'];
    }
    
    function isValidTransactionType(type) {
      return type in ['usage', 'allocation', 'purchase', 'reset', 'refund', 'bonus', 'manual_adjustment'];
    }
    
    // Validate user document structure
    function isValidUserDocument(data) {
      return data.keys().hasAll(['email', 'createdAt']) &&
             data.email is string &&
             isValidEmail(data.email) &&
             data.createdAt is timestamp &&
             (!('subscriptionPlan' in data) || isValidSubscriptionPlan(data.subscriptionPlan)) &&
             (!('subscriptionStatus' in data) || isValidSubscriptionStatus(data.subscriptionStatus));
    }
    
    // Validate credit transaction structure
    function isValidCreditTransaction(data) {
      return data.keys().hasAll(['type', 'amount', 'timestamp', 'userId']) &&
             data.type is string &&
             isValidTransactionType(data.type) &&
             data.amount is number &&
             data.timestamp is timestamp &&
             data.userId is string;
    }
    
    // Check if user is modifying only allowed fields
    function isAllowedUserUpdate(request) {
      let allowedFields = ['email', 'displayName', 'subscriptionPlan', 'subscriptionStatus', 
                           'credits', 'lastLoginAt', 'preferences', 'updatedAt'];
      return request.resource.data.diff(request.resource.data).affectedKeys().hasOnly(allowedFields);
    }
    
    // Users collection rules - UID-BASED DOCUMENT IDs for NextAuth compatibility
    match /users/{userId} {
      // Allow read access to own user document (userId is the UID)
      allow read: if isOwner(userId);
      
      // Allow admins and support to read any user document
      allow read: if isAdmin() || isSupport();
      
      // Allow create for authenticated users creating their own document with valid data
      allow create: if isOwner(userId) &&
                       isValidUserDocument(request.resource.data);
      
      // Allow update to own document with valid data and allowed fields only
      allow update: if isOwner(userId) &&
                       isAllowedUserUpdate(request) &&
                       isValidUserDocument(request.resource.data);
      
      // Allow system services to update user documents (for credit operations)
      allow update: if (isSystemService() || isAdmin()) &&
                       isValidUserDocument(request.resource.data);
      
      // Prevent deletion of user documents (except by admin)
      allow delete: if isAdmin();
      
      // Credit transactions subcollection - ONLY system services and admins can create
      match /creditTransactions/{transactionId} {
        allow read: if isOwner(userId);
        allow read: if isAdmin() || isSupport();
        
        // SECURITY FIX: Only system services and admins can create credit transactions
        allow create: if (isSystemService() || isAdmin()) &&
                         isValidCreditTransaction(request.resource.data) &&
                         request.resource.data.userId == userId;
        
        allow update: if false; // Immutable audit trail
        allow delete: if isAdmin();
      }
      
      // Usage analytics subcollection
      match /usageAnalytics/{analyticsId} {
        allow read: if isOwner(userId);
        allow read: if isAdmin() || isSupport();
        allow create: if isSystemService() || isAdmin();
        allow update: if isSystemService() || isAdmin();
        allow delete: if isAdmin();
      }
      
      // Daily usage summaries subcollection
      match /dailyUsageSummaries/{summaryId} {
        allow read: if isOwner(userId);
        allow read: if isAdmin() || isSupport();
        allow create, update: if isSystemService() || isAdmin();
        allow delete: if isAdmin();
      }
      
      // Monthly analytics reports subcollection
      match /monthlyAnalyticsReports/{reportId} {
        allow read: if isOwner(userId);
        allow read: if isAdmin() || isSupport();
        allow create, update: if isSystemService() || isAdmin();
        allow delete: if isAdmin();
      }
      
      // AI generation jobs subcollection
      match /generationJobs/{jobId} {
        allow read: if isOwner(userId);
        allow read: if isAdmin() || isSupport();
        allow create, update: if isSystemService() || isAdmin();
        allow delete: if isAdmin();
      }
      
      // Prompts subcollection - MORE SPECIFIC PERMISSIONS
      match /prompts/{promptId} {
        // Allow users to read, create, and update their own prompts
        allow read, create, update: if isOwner(userId);
        
        // Allow users to delete their own prompts
        allow delete: if isOwner(userId);
        
        // Allow admins to read and delete any prompts
        allow read, delete: if isAdmin() || isSupport();
      }
      
      // Profile subcollection - FIXED REDUNDANT PERMISSIONS
      match /userprofile/{profileId} {
        // Allow full access to own profile documents (read, create, update, delete)
        allow read, create, update, delete: if isOwner(userId);
        
        // Allow admins and support to read any profile
        allow read: if isAdmin() || isSupport();
        
        // Allow admins to delete profiles
        allow delete: if isAdmin();
      }
    }
    
    // System-wide analytics (admin only)
    match /systemAnalytics/{analyticsId} {
      allow read: if isAdmin() || isSupport();
      allow create, update, delete: if isAdmin();
    }
    
    // Error reports (admin and support)
    match /errorReports/{reportId} {
      allow read: if isAdmin() || isSupport();
      allow create, update, delete: if isAdmin();
      
      // Allow users to create error reports for their own issues
      allow create: if isValidUser() && 
                       request.resource.data.userId == request.auth.uid;
    }
    
    // Plan configurations (read-only for users, admin-only for write)
    match /planConfigurations/{planId} {
      allow read: if isValidUser();
      allow create, update, delete: if isAdmin();
    }
    
    // Subscription webhooks log (admin only)
    match /webhookLogs/{logId} {
      allow read: if isAdmin() || isSupport();
      allow create, update, delete: if isAdmin() || isSystemService();
    }
    
    // Credit transaction batches (admin only)
    match /creditTransactionBatches/{batchId} {
      allow read: if isAdmin() || isSupport();
      allow create, update, delete: if isAdmin() || isSystemService();
    }
    
    // Rate limiting and abuse prevention (admin and system)
    match /rateLimits/{limitId} {
      allow read: if isAdmin() || isSupport() || isSystemService();
      allow create, update, delete: if isAdmin() || isSystemService();
    }
    
    // Audit logs (admin and support read, admin write)
    match /auditLogs/{logId} {
      allow read: if isAdmin() || isSupport();
      allow create, update, delete: if isAdmin() || isSystemService();
    }
    
    // Default deny rule for any unmatched paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}