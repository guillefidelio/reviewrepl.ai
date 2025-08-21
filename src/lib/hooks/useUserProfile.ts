'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserProfileFormData } from '@/lib/types';

export function useUserProfile(userId: string) {
  const [state, setState] = useState<{
    data: UserProfile | null;
    loading: boolean;
    error: string | null;
    isEditing: boolean;
  }>({
    data: null,
    loading: true,
    error: null,
    isEditing: false,
  });

  // Fetch user profile from Firestore
  useEffect(() => {
    if (!userId || !db) {
      setState(prev => ({ ...prev, loading: false, data: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Subscribe to real-time updates from the main users collection
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userProfile: UserProfile = {
            uid: docSnap.id,
            userId: userId,
            firstName: data.firstName || data.displayName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || data.phoneNumber || '',
            company: data.company || '',
            position: data.position || data.jobTitle || '',
            credits: data.credits ? {
              available: data.credits.available || 0,
              total: data.credits.total || 0,
              lastUpdated: data.credits.lastUpdated?.toDate() || new Date(),
            } : undefined,
            answeringMode: data.answeringMode ? {
              selectedMode: data.answeringMode.selectedMode || 'simple',
              lastUpdated: data.answeringMode.lastUpdated?.toDate() || new Date(),
              isActive: data.answeringMode.isActive || false
            } : {
              selectedMode: 'simple',
              lastUpdated: new Date(),
              isActive: true
            },
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
          
          setState(prev => ({
            ...prev,
            data: userProfile,
            loading: false,
            error: null
          }));
        } else {
          // No user document exists
          setState(prev => ({
            ...prev,
            data: null,
            loading: false,
            error: null
          }));
        }
      },
      (error) => {
        console.error('Error listening to user profile:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load user profile'
        }));
      }
    );

    // Cleanup subscription on unmount or userId change
    return () => unsubscribe();
  }, [userId]);

  const createUserProfile = useCallback(async (formData: UserProfileFormData) => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Create profile in the main users collection
      const userRef = doc(db, 'users', userId);
      const newUserProfile = {
        uid: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        credits: {
          available: 10, // Free tier credits
          total: 10,
          lastUpdated: Timestamp.now(),
        },
        answeringMode: {
          selectedMode: 'simple' as const,
          lastUpdated: Timestamp.now(),
          isActive: true
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(userRef, newUserProfile, { merge: true });

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create user profile'
      }));
      throw error;
    }
  }, [userId]);

  const updateUserProfile = useCallback(async (formData: UserProfileFormData) => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Update profile in the main users collection
      const userRef = doc(db, 'users', userId);
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(userRef, updateData);

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update user profile'
      }));
      throw error;
    }
  }, [userId]);

  const toggleEditMode = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createUserProfile,
    updateUserProfile,
    toggleEditMode,
    clearError,
  };
}
