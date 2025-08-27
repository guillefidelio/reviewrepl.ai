'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { supabase } from '@/lib/supabase';

export interface Prompt {
  id: string;
  user_id: string;
  content: string;
  version: number;
  rating: number;
  has_text: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptData {
  content: string;
  version?: number;
  rating?: number;
  has_text?: boolean;
}

export function useSupabasePrompts() {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Fetch prompts
  const fetchPrompts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: prompts, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(prompts || []);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create prompt
  const createPrompt = async (promptData: PromptData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const { data: newPrompt, error: createError } = await supabase
        .from('prompts')
        .insert({
          user_id: user.id,
          content: promptData.content,
          version: promptData.version || 1,
          rating: promptData.rating || 0.0,
          has_text: promptData.has_text || false
        })
        .select()
        .single();

      if (createError) throw createError;

      setData(prev => [newPrompt, ...prev]);
      return newPrompt;
    } catch (err) {
      console.error('Error creating prompt:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update prompt
  const updatePrompt = async (promptId: string, promptData: Partial<PromptData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const { data: updatedPrompt, error: updateError } = await supabase
        .from('prompts')
        .update({
          ...promptData,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setData(prev => prev.map(p => p.id === promptId ? updatedPrompt : p));
      return updatedPrompt;
    } catch (err) {
      console.error('Error updating prompt:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete prompt
  const deletePrompt = async (promptId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setData(prev => prev.filter(p => p.id !== promptId));
    } catch (err) {
      console.error('Error deleting prompt:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Toggle edit mode
  const toggleEditMode = (promptId?: string) => {
    if (promptId) {
      setEditingPromptId(promptId);
      setIsEditing(true);
    } else {
      setEditingPromptId(null);
      setIsEditing(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch prompts on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchPrompts();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [user, fetchPrompts]);

  return {
    data,
    loading,
    error,
    isEditing,
    editingPromptId,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleEditMode,
    clearError,
    fetchPrompts
  };
}

