'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { supabase } from '@/lib/supabase';

export interface CreditsBalance {
  available: number;
  total: number;
  lastUpdated: Date;
}

export function useSupabaseCredits() {
  const { user } = useSupabaseAuth();
  const [balance, setBalance] = useState<CreditsBalance>({ available: 0, total: 0, lastUpdated: new Date() });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch credits from the main users table
  const fetchCredits = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('credits_available, credits_total, credits_last_updated')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setBalance({
        available: userData.credits_available || 0,
        total: userData.credits_total || 0,
        lastUpdated: new Date(userData.credits_last_updated)
      });
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize credits for new user in the main users table
  const initializeCredits = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          credits_available: 10,
          credits_total: 10,
          credits_last_updated: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('credits_available, credits_total, credits_last_updated')
        .single();

      if (updateError) throw updateError;

      setBalance({
        available: updatedUser.credits_available,
        total: updatedUser.credits_total,
        lastUpdated: new Date(updatedUser.credits_last_updated)
      });

      return updatedUser;
    } catch (err) {
      console.error('Error initializing credits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize credits';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update credits in the main users table
  const updateCredits = async (newAvailable: number, newTotal?: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const updateData: {
        credits_available: number;
        credits_last_updated: string;
        credits_total?: number;
      } = {
        credits_available: newAvailable,
        credits_last_updated: new Date().toISOString()
      };

      if (newTotal !== undefined) {
        updateData.credits_total = newTotal;
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select('credits_available, credits_total, credits_last_updated')
        .single();

      if (updateError) throw updateError;

      setBalance({
        available: updatedUser.credits_available,
        total: updatedUser.credits_total,
        lastUpdated: new Date(updatedUser.credits_last_updated)
      });

      return updatedUser;
    } catch (err) {
      console.error('Error updating credits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update credits';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch credits on mount and when user changes
  useEffect(() => {
    fetchCredits();
  }, [user, fetchCredits]);

  return {
    balance,
    loading,
    error,
    fetchCredits,
    initializeCredits,
    updateCredits,
    clearError
  };
}

