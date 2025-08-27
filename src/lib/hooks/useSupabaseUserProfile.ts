'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  credits_available: number;
  credits_total: number;
  credits_last_updated: string;
  answering_mode_selected: 'simple' | 'pro';
  answering_mode_last_updated: string;
  answering_mode_is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileData {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
}

// Function to create default prompts for new users
const createDefaultPrompts = async (userId: string) => {
  const defaultPrompts = [
    {
      user_id: userId,
      content: `You are a professional business representative responding to a negative review (1-2 stars). 

Your goal is to:
- Acknowledge the customer's concerns sincerely
- Show empathy and understanding
- Offer a specific solution or compensation
- Demonstrate commitment to improvement
- Invite further communication to resolve the issue

Keep your response professional, empathetic, and solution-focused. Avoid being defensive or making excuses.`,
      version: 1,
      rating: 5.0,
      has_text: true
    },
    {
      user_id: userId,
      content: `You are a professional business representative responding to a neutral review (3 stars).

Your goal is to:
- Thank the customer for their feedback
- Acknowledge both positive and negative aspects mentioned
- Show appreciation for their time and input
- Offer to address any specific concerns
- Encourage future business and improvement

Keep your response balanced, appreciative, and forward-looking. Show that you value all feedback as an opportunity to improve.`,
      version: 1,
      rating: 5.0,
      has_text: true
    },
    {
      user_id: userId,
      content: `You are a professional business representative responding to a positive review (4-5 stars).

Your goal is to:
- Express genuine gratitude for the positive feedback
- Acknowledge specific positive aspects mentioned
- Show appreciation for their business and time
- Reinforce your commitment to maintaining high standards
- Encourage them to return and recommend your business

Keep your response warm, appreciative, and genuine. Show enthusiasm for their satisfaction and encourage continued business.`,
      version: 1,
      rating: 5.0,
      has_text: true
    }
  ];

  try {
    const { data: prompts, error } = await supabase
      .from('prompts')
      .insert(defaultPrompts)
      .select();

    if (error) {
      console.error('Error creating default prompts:', error);
      throw error;
    }

    console.log('Default prompts created successfully:', prompts);
    return prompts;
  } catch (err) {
    console.error('Failed to create default prompts:', err);
    // Don't throw error here - we don't want prompt creation to fail user profile creation
    return null;
  }
};

export function useSupabaseUserProfile() {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from the main users table
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      setData(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Create user profile in the main users table
  const createUserProfile = async (profileData: UserProfileData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      setLoading(true);

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          ...profileData,
          credits_available: 10,
          credits_total: 10,
          credits_last_updated: new Date().toISOString(),
          answering_mode_selected: 'simple',
          answering_mode_last_updated: new Date().toISOString(),
          answering_mode_is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      // Create default prompts for the new user
      await createDefaultPrompts(user.id);

      setData(newProfile);
      setLoading(false);
      return newProfile;
    } catch (err) {
      console.error('Error creating user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Update user profile in the main users table
  const updateUserProfile = async (profileData: Partial<UserProfileData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      setLoading(true);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state immediately with the new data
      setData(updatedProfile);
      
      // Ensure loading state is updated
      setLoading(false);
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch profile on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [user]);

  return {
    data,
    loading,
    error,
    fetchUserProfile,
    createUserProfile,
    updateUserProfile,
    clearError
  };
}

