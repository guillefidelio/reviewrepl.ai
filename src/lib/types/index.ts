import { User } from '@supabase/supabase-js';

// Authentication context types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  clearProfileError: () => void;
  refreshUserProfile: () => Promise<void>;
}

// User profile types
export interface UserProfile {
  uid: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  credits?: {
    available: number;
    total: number;
    lastUpdated: Date;
  };
  answeringMode?: {
    selectedMode: 'simple' | 'pro';
    lastUpdated: Date;
    isActive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User profile form data (for update operations)
export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
}

// User profile operation states
export interface UserProfileState {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
}

// User profile hook return type
export interface UserProfileHookReturn extends UserProfileState {
  createUserProfile: (formData: UserProfileFormData) => Promise<boolean | undefined>;
  updateUserProfile: (formData: UserProfileFormData) => Promise<boolean | undefined>;
  toggleEditMode: () => void;
  clearError: () => void;
}

// Business profile types
export interface BusinessProfile {
  uid: string;
  userId: string;
  
  // Essential Parameters
  businessName: string;
  businessMainCategory: 'Restaurant' | 'Retail Store' | 'Medical/Healthcare' | 'Auto Service' | 'Beauty/Salon' | 'Professional Services' | 'Hotel/Lodging';
  businessSecondaryCategory: string;
  businessTags: string[];
  mainProductsServices: string;
  briefDescription: string;
  country: string;
  stateProvince: string;
  language: 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Other';
  responseTone: 'Professional' | 'Friendly' | 'Casual' | 'Formal';
  
  // Useful Secondary Parameters
  responseLength: 'Brief' | 'Standard' | 'Detailed';
  greetings: string;
  signatures: string;
  positiveReviewCTA: string;
  negativeReviewEscalation: string;
  
  // Advanced Options
  brandVoiceNotes: string;
  otherConsiderations: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Business profile form data (for create/update operations)
export interface BusinessProfileFormData {
  // Essential Parameters
  businessName: string;
  businessMainCategory: 'Restaurant' | 'Retail Store' | 'Medical/Healthcare' | 'Auto Service' | 'Beauty/Salon' | 'Professional Services' | 'Hotel/Lodging';
  businessSecondaryCategory: string;
  businessTags: string[];
  mainProductsServices: string;
  briefDescription: string;
  country: string;
  stateProvince: string;
  language: 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Other';
  responseTone: 'Professional' | 'Friendly' | 'Casual' | 'Formal';
  
  // Useful Secondary Parameters
  responseLength: 'Brief' | 'Standard' | 'Detailed';
  greetings: string;
  signatures: string;
  positiveReviewCTA: string;
  negativeReviewEscalation: string;
  
  // Advanced Options
  brandVoiceNotes: string;
  otherConsiderations: string;
}

// Business profile operation states
export interface BusinessProfileState {
  data: BusinessProfile | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isCreating: boolean;
}

// Prompt types
export interface Prompt {
  id: string;
  userId: string;
  content: string;
  hasText: boolean;
  rating: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Prompt form data (for create/update operations)
export interface PromptFormData {
  content: string;
  hasText: boolean;
  rating: number;
  version: number;
}

// Prompt operation states
export interface PromptState {
  data: Prompt[] | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isCreating: boolean;
  editingPromptId: string | null;
}

// Prompt hook return type
export interface PromptHookReturn extends PromptState {
  createPrompt: (formData: PromptFormData) => Promise<boolean | undefined>;
  updatePrompt: (promptId: string, formData: PromptFormData) => Promise<boolean | undefined>;
  deletePrompt: (promptId: string) => Promise<void>;
  toggleEditMode: (promptId?: string) => void;
  clearError: () => void;
}
