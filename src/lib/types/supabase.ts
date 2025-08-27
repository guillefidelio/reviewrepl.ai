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
  AnsweringMode,
  AnsweringModeData,
  AnsweringModeRecord
} from '@/lib/hooks/useSupabaseAnsweringMode';

export type {
  CreditsBalance,
  CreditsRecord
} from '@/lib/hooks/useSupabaseCredits';

