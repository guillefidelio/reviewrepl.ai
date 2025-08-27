'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { supabase } from '@/lib/supabase';

export interface BusinessProfileData {
  business_name: string;
  business_main_category: string;
  business_secondary_category: string;
  business_tags: string[];
  main_products_services: string;
  brief_description: string;
  country: string;
  state_province: string;
  language: string;
  response_tone: string;
  response_length: string;
  greetings: string;
  signatures: string;
  positive_review_cta: string;
  negative_review_escalation: string;
  brand_voice_notes: string;
  other_considerations: string;
}

// Form data interface with camelCase field names for the UI
export interface BusinessProfileFormData {
  businessName: string;
  businessMainCategory: string;
  businessSecondaryCategory: string;
  businessTags: string[];
  mainProductsServices: string;
  briefDescription: string;
  country: string;
  stateProvince: string;
  language: string;
  responseTone: string;
  responseLength: string;
  greetings: string;
  signatures: string;
  positiveReviewCTA: string;
  negativeReviewEscalation: string;
  brandVoiceNotes: string;
  otherConsiderations: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_main_category: string;
  business_secondary_category: string;
  business_tags: string[];
  main_products_services: string;
  brief_description: string;
  country: string;
  state_province: string;
  language: string;
  response_tone: string;
  response_length: string;
  greetings: string;
  signatures: string;
  positive_review_cta: string;
  negative_review_escalation: string;
  brand_voice_notes: string;
  other_considerations: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseBusinessProfile() {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business profile
  const fetchBusinessProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: profile, error: fetchError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      setData(profile);
    } catch (err) {
      console.error('Error fetching business profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch business profile');
    } finally {
      setLoading(false);
    }
  };

  // Create business profile
  const createBusinessProfile = async (profileData: BusinessProfileData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      setLoading(true);

      const { data: newProfile, error: createError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          ...profileData
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update local state immediately
      setData(newProfile);
      setLoading(false);
      return newProfile;
    } catch (err) {
      console.error('Error creating business profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create business profile';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Update business profile
  const updateBusinessProfile = async (profileData: Partial<BusinessProfileData>) => {
    if (!user || !data) throw new Error('Business profile not found');

    try {
      setError(null);
      setLoading(true);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('business_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state immediately
      setData(updatedProfile);
      setLoading(false);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating business profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update business profile';
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
      fetchBusinessProfile();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [user]);

  return {
    data,
    loading,
    error,
    createBusinessProfile,
    updateBusinessProfile,
    fetchBusinessProfile,
    clearError
  };
}
