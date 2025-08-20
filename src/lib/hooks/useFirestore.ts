import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { UserProfile, BusinessProfile, Prompt } from '@/lib/types';

// User Profile Operations
export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            phoneNumber: data.phoneNumber,
            photoURL: data.photoURL,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createUserProfile = async (userData: Partial<UserProfile>): Promise<void> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    const profileData = {
      uid: userId,
      email: userData.email || '',
      displayName: userData.displayName || '',
      phoneNumber: userData.phoneNumber || '',
      photoURL: userData.photoURL || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', userId), profileData);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(doc(db, 'users', userId), updateData);
  };

  return {
    profile,
    loading,
    error,
    createUserProfile,
    updateUserProfile,
  };
}

// Business Profile Operations
export function useBusinessProfile(userId: string | undefined) {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', userId, 'businessProfiles'),
        where('userId', '==', userId)
      ),
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setBusinessProfile({
            uid: doc.id,
            userId: data.userId,
            businessName: data.businessName,
            productService: data.productService,
            description: data.description,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          setBusinessProfile(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching business profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createBusinessProfile = async (profileData: Partial<BusinessProfile>): Promise<string> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    const businessData = {
      userId,
      businessName: profileData.businessName || '',
      productService: profileData.productService || '',
      description: profileData.description || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'users', userId, 'businessProfiles'), businessData);
    return docRef.id;
  };

  const updateBusinessProfile = async (profileId: string, updates: Partial<BusinessProfile>): Promise<void> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(doc(db, 'users', userId, 'businessProfiles', profileId), updateData);
  };

  return {
    businessProfile,
    loading,
    error,
    createBusinessProfile,
    updateBusinessProfile,
  };
}

// Prompts Operations
export function usePrompts(userId: string | undefined) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users', userId, 'prompts'),
      (snapshot) => {
        const promptsList = snapshot.docs.map(doc => ({
          id: doc.id,
          userId: doc.data().userId,
          text: doc.data().text,
          metadata: doc.data().metadata,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }));
        setPrompts(promptsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching prompts:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createPrompt = async (text: string, metadata?: Record<string, unknown>): Promise<string> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    const promptData = {
      userId,
      text,
      metadata: metadata || {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'users', userId, 'prompts'), promptData);
    return docRef.id;
  };

  const updatePrompt = async (promptId: string, updates: Partial<Prompt>): Promise<void> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(doc(db, 'users', userId, 'prompts', promptId), updateData);
  };

  const deletePrompt = async (promptId: string): Promise<void> => {
    if (!userId || !db) throw new Error('User ID or Firestore not available');

    // Note: We'll need to implement delete functionality in the security rules
    // For now, we'll just update the prompt to mark it as deleted
    await updateDoc(doc(db, 'users', userId, 'prompts', promptId), {
      deleted: true,
      updatedAt: Timestamp.now(),
    });
  };

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
  };
}
