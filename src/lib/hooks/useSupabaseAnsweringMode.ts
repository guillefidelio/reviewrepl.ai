'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { supabase } from '@/lib/supabase';

export type AnsweringMode = 'simple' | 'pro';

export function useSupabaseAnsweringMode() {
  const { user } = useSupabaseAuth();
  const [selectedMode, setSelectedMode] = useState<AnsweringMode>('simple');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch answering mode from the main users table
  const fetchAnsweringMode = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('answering_mode_selected, answering_mode_last_updated, answering_mode_is_active')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (userData.answering_mode_selected) {
        setSelectedMode(userData.answering_mode_selected);
      }
    } catch (err) {
      console.error('Error fetching answering mode:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch answering mode');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update answering mode in the main users table
  const updateMode = async (newMode: AnsweringMode) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      setLoading(true);

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          answering_mode_selected: newMode,
          answering_mode_last_updated: new Date().toISOString(),
          answering_mode_is_active: true
        })
        .eq('id', user.id)
        .select('answering_mode_selected, answering_mode_last_updated, answering_mode_is_active')
        .single();

      if (updateError) throw updateError;

      setSelectedMode(newMode);
      return updatedUser;
    } catch (err) {
      console.error('Error updating answering mode:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update answering mode';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch mode on mount and when user changes
  useEffect(() => {
    fetchAnsweringMode();
  }, [user, fetchAnsweringMode]);

  return {
    selectedMode,
    loading,
    error,
    fetchAnsweringMode,
    updateMode,
    clearError
  };
}

