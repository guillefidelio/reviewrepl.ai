# Chrome Extension Migration Guide: Firestore to Supabase

## Overview

This guide outlines the complete migration process for moving your Chrome extension from Firebase/Firestore to Supabase. The migration involves updating authentication, database operations, and API calls while maintaining the same functionality.

## Prerequisites

- Supabase project already set up and configured
- Chrome extension source code accessible
- Understanding of both Firestore and Supabase APIs
- Chrome extension development environment ready

## Migration Steps

### 1. Update Dependencies

**Remove Firebase dependencies:**
```json
// package.json - Remove these lines
{
  "dependencies": {
    "firebase": "^x.x.x",
    "@firebase/firestore": "^x.x.x",
    "@firebase/auth": "^x.x.x"
  }
}
```

**Add Supabase dependencies:**
```json
// package.json - Add these lines
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

**Install new dependencies:**
```bash
npm install @supabase/supabase-js
npm uninstall firebase @firebase/firestore @firebase/auth
```

### 2. Update Configuration Files

**Replace Firebase config with Supabase config:**
```typescript
// Before: firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

**After: supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Update Authentication

**Replace Firebase Auth with Supabase Auth:**

```typescript
// Before: Firebase Auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Sign in
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign up
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign out
const signOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
```

**After: Supabase Auth**
```typescript
import { supabase } from './supabase';

// Sign in
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    throw error;
  }
};

// Sign up
const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    throw error;
  }
};

// Sign out
const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};
```

### 4. Update Database Operations

**Replace Firestore operations with Supabase:**

#### User Profile Operations

**Before: Firestore**
```typescript
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Get user profile
const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

// Create/Update user profile
const updateUserProfile = async (userId: string, profileData: any) => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, profileData, { merge: true });
};

// Update specific fields
const updateUserField = async (userId: string, field: string, value: any) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { [field]: value });
};
```

**After: Supabase**
```typescript
import { supabase } from './supabase';

// Get user profile
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

// Create/Update user profile
const updateUserProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, ...profileData })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Update specific fields
const updateUserField = async (userId: string, field: string, value: any) => {
  const { data, error } = await supabase
    .from('users')
    .update({ [field]: value })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### Business Profile Operations

**Before: Firestore**
```typescript
// Get business profile
const getBusinessProfile = async (userId: string) => {
  const docRef = doc(db, 'business_profiles', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

// Create/Update business profile
const updateBusinessProfile = async (userId: string, profileData: any) => {
  const docRef = doc(db, 'business_profiles', userId);
  await setDoc(docRef, profileData, { merge: true });
};
```

**After: Supabase**
```typescript
// Get business profile
const getBusinessProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
};

// Create/Update business profile
const updateBusinessProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .upsert({ user_id: userId, ...profileData })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### Prompts Operations

**Before: Firestore**
```typescript
// Get user prompts
const getUserPrompts = async (userId: string) => {
  const q = query(collection(db, 'prompts'), where('user_id', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Create prompt
const createPrompt = async (promptData: any) => {
  const docRef = doc(collection(db, 'prompts'));
  await setDoc(docRef, promptData);
  return docRef.id;
};
```

**After: Supabase**
```typescript
// Get user prompts
const getUserPrompts = async (userId: string) => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Create prompt
const createPrompt = async (promptData: any) => {
  const { data, error } = await supabase
    .from('prompts')
    .insert(promptData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### 5. Update Real-time Listeners

**Replace Firestore listeners with Supabase subscriptions:**

**Before: Firestore**
```typescript
import { onSnapshot, doc } from 'firebase/firestore';

const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
  if (doc.exists()) {
    const userData = doc.data();
    // Handle user data updates
  }
});

// Cleanup
unsubscribe();
```

**After: Supabase**
```typescript
import { supabase } from './supabase';

const subscription = supabase
  .channel('user-profile')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
    (payload) => {
      // Handle user data updates
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### 6. Update Error Handling

**Supabase error handling pattern:**
```typescript
try {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    // Handle specific Supabase errors
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Database error:', error);
  throw error;
}
```

### 7. Update Chrome Extension Manifest

**Ensure proper permissions for Supabase:**
```json
{
  "manifest_version": 3,
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://*.supabase.co/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src https://*.supabase.co"
  }
}
```

### 8. Update Background Script

**Replace Firebase initialization with Supabase:**
```typescript
// background.ts
import { supabase } from './supabase';

// Initialize Supabase client
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Chrome extension installed, Supabase client initialized');
});

// Handle authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
```

### 9. Update Content Script

**Replace Firestore calls with Supabase:**
```typescript
// content_script.ts
import { supabase } from './supabase';

// Example: Get user profile when needed
const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
```

### 10. Update Popup Script

**Replace authentication UI with Supabase:**
```typescript
// popup.ts
import { supabase } from './supabase';

// Sign in form
const handleSignIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      showError(error.message);
      return;
    }
    
    showSuccess('Signed in successfully!');
    updateUI(data.user);
  } catch (error) {
    showError('An unexpected error occurred');
  }
};

// Sign up form
const handleSignUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      showError(error.message);
      return;
    }
    
    showSuccess('Account created! Please check your email for verification.');
  } catch (error) {
    showError('An unexpected error occurred');
  }
};
```

## Testing the Migration

### 1. Test Authentication
- [ ] User sign up
- [ ] User sign in
- [ ] User sign out
- [ ] Password reset
- [ ] Email verification

### 2. Test Database Operations
- [ ] Create user profile
- [ ] Update user profile
- [ ] Create business profile
- [ ] Update business profile
- [ ] Create prompts
- [ ] Update prompts
- [ ] Delete prompts

### 3. Test Real-time Updates
- [ ] User profile changes
- [ ] Business profile changes
- [ ] Prompt updates

### 4. Test Error Handling
- [ ] Network errors
- [ ] Authentication errors
- [ ] Database errors
- [ ] Permission errors

## Common Issues and Solutions

### 1. CORS Issues
**Problem**: Supabase requests blocked by CORS
**Solution**: Ensure proper host permissions in manifest.json

### 2. Authentication State Not Persisting
**Problem**: User logged out after page refresh
**Solution**: Use `supabase.auth.getSession()` on initialization

### 3. Real-time Subscriptions Not Working
**Problem**: Changes not received in real-time
**Solution**: Check channel subscription and ensure proper cleanup

### 4. Database Permissions
**Problem**: "Row Level Security" errors
**Solution**: Ensure RLS policies are properly configured in Supabase

## Performance Considerations

### 1. Connection Pooling
- Supabase automatically handles connection pooling
- No need to manually manage connections

### 2. Caching
- Implement client-side caching for frequently accessed data
- Use Supabase's built-in caching where possible

### 3. Batch Operations
- Use Supabase's batch operations for multiple updates
- Consider using transactions for complex operations

## Security Considerations

### 1. Row Level Security (RLS)
- Ensure RLS policies are properly configured
- Test policies thoroughly before deployment

### 2. API Keys
- Never expose service role keys in client code
- Use anon keys for public operations
- Implement proper authentication checks

### 3. Data Validation
- Validate all data on both client and server
- Use TypeScript interfaces for type safety

## Rollback Plan

If issues arise during migration:

1. **Keep Firebase code** in a separate branch
2. **Test thoroughly** before removing Firebase
3. **Monitor** Supabase performance and costs
4. **Have rollback procedures** documented

## Post-Migration Tasks

1. **Remove Firebase code** completely
2. **Update documentation** with new Supabase endpoints
3. **Monitor performance** and error rates
4. **Update team training** materials
5. **Archive Firebase project** (after confirming everything works)

## Conclusion

This migration will modernize your Chrome extension with Supabase's powerful features while maintaining the same functionality. The key is to:

- Test each component thoroughly
- Handle errors gracefully
- Maintain data consistency
- Monitor performance
- Have a rollback plan

Remember to test the migration in a development environment before deploying to production.
