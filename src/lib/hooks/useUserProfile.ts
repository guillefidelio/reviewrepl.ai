'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserProfileFormData, UserProfileState, UserProfileHookReturn } from '@/lib/types';

export function useUserProfile(userId: string): UserProfileHookReturn {
  const [state, setState] = useState<UserProfileState>({
    data: null,
    loading: true,
    error: null,
    isEditing: false
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Real-time subscription to user profile
  useEffect(() => {
    if (!userId || !db) {
      setState(prev => ({ ...prev, loading: false, data: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId, 'userprofile', userId), // Using userId as document ID
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userProfile: UserProfile = {
            uid: docSnap.id,
            userId: userId,
            displayName: data.displayName || '',
            email: data.email || '',
            bio: data.bio || '',
            phone: data.phone || '',
            location: data.location || '',
            website: data.website || '',
            company: data.company || '',
            jobTitle: data.jobTitle || '',
            avatar: data.avatar || '',
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
          // No user profile exists
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
      const userProfileRef = doc(db, 'users', userId, 'userprofile', userId);
      const newUserProfile: Omit<UserProfile, 'uid'> = {
        userId: userId,
        displayName: formData.displayName,
        email: formData.email,
        bio: formData.bio || '',
        phone: formData.phone || '',
        location: formData.location || '',
        website: formData.website || '',
        company: formData.company || '',
        jobTitle: formData.jobTitle || '',
        avatar: '', // Will be set separately if needed
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(userProfileRef, newUserProfile);

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false,
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

    // Check if we have data to update using stateRef
    if (!stateRef.current.data?.uid) {
      throw new Error('No user profile to update');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const userProfileRef = doc(db, 'users', userId, 'userprofile', stateRef.current.data.uid);
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      };
      
      await updateDoc(userProfileRef, updateData);

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false,
        // isEditing is NOT set here - form handles closing itself
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
  }, [userId]); // Removed state.data from dependencies

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
    clearError
  };
}
