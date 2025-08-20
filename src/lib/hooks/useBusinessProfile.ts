'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BusinessProfile, BusinessProfileFormData, BusinessProfileState } from '@/lib/types';

export function useBusinessProfile(userId: string) {
  const [state, setState] = useState<BusinessProfileState>({
    data: null,
    loading: true,
    error: null,
    isEditing: false,
    isCreating: false
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Real-time subscription to business profile
  useEffect(() => {
    if (!userId || !db) {
      setState(prev => ({ ...prev, loading: false, data: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId, 'businessProfiles', userId), // Using userId as document ID
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const businessProfile: BusinessProfile = {
            uid: docSnap.id,
            userId: userId,
            businessName: data.businessName || '',
            productService: data.productService || '',
            description: data.description || '',
            industry: data.industry || '',
            website: data.website || '',
            location: data.location || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
          
          setState(prev => ({
            ...prev,
            data: businessProfile,
            loading: false,
            error: null
          }));
        } else {
          // No business profile exists
          setState(prev => ({
            ...prev,
            data: null,
            loading: false,
            error: null
          }));
        }
      },
      (error) => {
        console.error('Error listening to business profile:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load business profile'
        }));
      }
    );

    // Cleanup subscription on unmount or userId change
    return () => unsubscribe();
  }, [userId]);

  const fetchBusinessProfile = useCallback(async () => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessProfileRef = doc(db, 'users', userId, 'businessProfiles', userId);
      const docSnap = await getDocs(collection(db, 'users', userId, 'businessProfiles'));
      
      if (!docSnap.empty) {
        const doc = docSnap.docs[0]; // Get first document
        const data = doc.data();
        const businessProfile: BusinessProfile = {
          uid: doc.id,
          userId: userId,
          businessName: data.businessName || '',
          productService: data.productService || '',
          description: data.description || '',
          industry: data.industry || '',
          website: data.website || '',
          location: data.location || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        
        setState(prev => ({
          ...prev,
          data: businessProfile,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          data: null,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch business profile'
      }));
    }
  }, [userId]);

  const createBusinessProfile = useCallback(async (formData: BusinessProfileFormData) => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null, isCreating: true }));

    try {
      const businessProfileRef = doc(db, 'users', userId, 'businessProfiles', userId);
      const businessProfile: BusinessProfile = {
        uid: userId,
        userId: userId,
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(businessProfileRef, businessProfile);

      setState(prev => ({
        ...prev,
        data: businessProfile,
        loading: false,
        isCreating: false,
        isEditing: false
      }));

      return true;
    } catch (error) {
      console.error('Error creating business profile:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create business profile',
        isCreating: false
      }));
      throw error;
    }
  }, [userId]);

  const updateBusinessProfile = useCallback(async (formData: BusinessProfileFormData) => {
    if (!userId || !db) return;

    // Check if we have data to update using stateRef
    if (!stateRef.current.data?.uid) {
      throw new Error('No business profile to update');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessProfileRef = doc(db, 'users', userId, 'businessProfiles', stateRef.current.data.uid);
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      };
      
      await updateDoc(businessProfileRef, updateData);

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false,
        // isEditing is NOT set here - form handles closing itself
      }));

      return true;
    } catch (error) {
      console.error('Error updating business profile:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update business profile'
      }));
      throw error;
    }
  }, [userId]); // Removed state.data from dependencies

  const deleteBusinessProfile = useCallback(async () => {
    if (!userId || !db || !state.data?.uid) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessProfileRef = doc(db, 'users', userId, 'businessProfiles', state.data.uid);
      await deleteDoc(businessProfileRef);

      setState(prev => ({
        ...prev,
        data: null,
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting business profile:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete business profile'
      }));
    }
  }, [userId, state.data]);

  const toggleEditMode = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchBusinessProfile,
    createBusinessProfile,
    updateBusinessProfile,
    deleteBusinessProfile,
    toggleEditMode,
    clearError
  };
}
