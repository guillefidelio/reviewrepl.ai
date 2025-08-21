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
import { UserProfile, BusinessProfile } from '@/lib/types';

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
            userId: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            position: data.position || '',
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
      userId: userId,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      company: userData.company || '',
      position: userData.position || '',
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
            businessName: data.businessName || '',
            businessMainCategory: data.businessMainCategory || 'Restaurant',
            businessSecondaryCategory: data.businessSecondaryCategory || '',
            businessTags: data.businessTags || [],
            mainProductsServices: data.mainProductsServices || '',
            briefDescription: data.briefDescription || '',
            country: data.country || '',
            stateProvince: data.stateProvince || '',
            language: data.language || 'English',
            responseTone: data.responseTone || 'Professional',
            responseLength: data.responseLength || 'Standard',
            greetings: data.greetings || '',
            signatures: data.signatures || '',
            positiveReviewCTA: data.positiveReviewCTA || '',
            negativeReviewEscalation: data.negativeReviewEscalation || '',
            brandVoiceNotes: data.brandVoiceNotes || '',
            otherConsiderations: data.otherConsiderations || '',
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
      businessMainCategory: profileData.businessMainCategory || 'Restaurant',
      businessSecondaryCategory: profileData.businessSecondaryCategory || '',
      businessTags: profileData.businessTags || [],
      mainProductsServices: profileData.mainProductsServices || '',
      briefDescription: profileData.briefDescription || '',
      country: profileData.country || '',
      stateProvince: profileData.stateProvince || '',
      language: profileData.language || 'English',
      responseTone: profileData.responseTone || 'Professional',
      responseLength: profileData.responseLength || 'Standard',
      greetings: profileData.greetings || '',
      signatures: profileData.signatures || '',
      positiveReviewCTA: profileData.positiveReviewCTA || '',
      negativeReviewEscalation: profileData.negativeReviewEscalation || '',
      brandVoiceNotes: profileData.brandVoiceNotes || '',
      otherConsiderations: profileData.otherConsiderations || '',
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
