'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthContextType, UserProfile } from '@/lib/types';

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId: string) => {
    if (!db) {
      console.warn('Firestore is not initialized');
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile: UserProfile = {
          uid: userDoc.id,
          userId: userDoc.id, // Add missing userId field
          email: data.email,
          displayName: data.displayName,
          phone: data.phone || data.phoneNumber || '', // Handle both property names
          avatar: data.avatar || data.photoURL || '', // Handle both property names
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
      setProfileError(errorMessage);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Refresh user profile data
  const refreshUserProfile = async () => {
    if (user?.uid) {
      await fetchUserProfile(user.uid);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Google sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    try {
      setError(null);
      setLoading(true);
      await firebaseSignOut(auth);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign out';
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Clear profile error
  const clearProfileError = () => {
    setProfileError(null);
  };

  // Listen for authentication state changes
  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth is not initialized. Please check your Firebase configuration.');
      setError('Firebase configuration is missing. Please check your .env.local file and restart the development server.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile when user signs in
        await fetchUserProfile(user.uid);
      } else {
        // Clear user profile when user signs out
        setUserProfile(null);
        setProfileError(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Context value
  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    profileLoading,
    error,
    profileError,
    signIn,
    signInWithGoogle,
    signOut,
    clearError,
    clearProfileError,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
