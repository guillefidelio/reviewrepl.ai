import { User } from 'firebase/auth';

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
  displayName: string;
  email: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User profile form data (for update operations)
export interface UserProfileFormData {
  displayName: string;
  email: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
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
  businessName: string;
  productService: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Business profile form data (for create/update operations)
export interface BusinessProfileFormData {
  businessName: string;
  productService: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
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
  text: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
