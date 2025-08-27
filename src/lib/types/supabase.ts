// Re-export all types from our Supabase hooks for easy access
export type {
  UserProfile,
  UserProfileData
} from '@/lib/hooks/useSupabaseUserProfile';

export type {
  BusinessProfile,
  BusinessProfileData
} from '@/lib/hooks/useSupabaseBusinessProfile';

export type {
  Prompt,
  PromptData
} from '@/lib/hooks/useSupabasePrompts';

export type {
  AnsweringMode
} from '@/lib/hooks/useSupabaseAnsweringMode';

export type {
  CreditsBalance
} from '@/lib/hooks/useSupabaseCredits';

