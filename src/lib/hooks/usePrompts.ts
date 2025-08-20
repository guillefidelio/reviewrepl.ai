'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Prompt, PromptFormData, PromptState } from '@/lib/types';

export function usePrompts(userId: string) {
  const [state, setState] = useState<PromptState>({
    data: null,
    loading: true,
    error: null,
    isEditing: false,
    isCreating: false,
    editingPromptId: null
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Real-time subscription to prompts collection
  useEffect(() => {
    if (!userId || !db) {
      setState(prev => ({ ...prev, loading: false, data: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', userId, 'prompts'),
        orderBy('createdAt', 'desc')
      ),
      (querySnapshot) => {
        const prompts: Prompt[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const prompt: Prompt = {
            id: doc.id,
            userId: userId,
            content: data.content || '',
            hasText: data.hasText || false,
            rating: data.rating || 0,
            version: data.version || 1,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
          prompts.push(prompt);
        });
        
        setState(prev => ({
          ...prev,
          data: prompts,
          loading: false,
          error: null
        }));
      },
      (error) => {
        console.error('Error listening to prompts:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load prompts'
        }));
      }
    );

    // Cleanup subscription on unmount or userId change
    return () => unsubscribe();
  }, [userId]);

  const createPrompt = useCallback(async (formData: PromptFormData) => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null, isCreating: true }));

    try {
      // Generate a unique ID for the prompt
      const promptId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const promptRef = doc(db, 'users', userId, 'prompts', promptId);
      
      const prompt: Prompt = {
        id: promptId,
        userId: userId,
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(promptRef, prompt);

      setState(prev => ({
        ...prev,
        loading: false,
        isCreating: false,
        isEditing: false,
        editingPromptId: null
      }));

      return true;
    } catch (error) {
      console.error('Error creating prompt:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create prompt',
        isCreating: false
      }));
      throw error;
    }
  }, [userId]);

  const updatePrompt = useCallback(async (promptId: string, formData: PromptFormData) => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const promptRef = doc(db, 'users', userId, 'prompts', promptId);
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      };
      
      await updateDoc(promptRef, updateData);

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false,
        isEditing: false,
        editingPromptId: null
      }));

      return true;
    } catch (error) {
      console.error('Error updating prompt:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update prompt'
      }));
      throw error;
    }
  }, [userId]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!userId || !db) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const promptRef = doc(db, 'users', userId, 'prompts', promptId);
      await deleteDoc(promptRef);

      // Note: We don't need to manually update state here because onSnapshot will handle it
      // The real-time subscription will automatically update the state with the new data
      
      setState(prev => ({
        ...prev,
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete prompt'
      }));
    }
  }, [userId]);

  const toggleEditMode = useCallback((promptId?: string) => {
    setState(prev => ({ 
      ...prev, 
      isEditing: !prev.isEditing,
      isCreating: !promptId && !prev.isEditing, // Set isCreating to true when no promptId and not currently editing
      editingPromptId: promptId || null
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleEditMode,
    clearError
  };
}
