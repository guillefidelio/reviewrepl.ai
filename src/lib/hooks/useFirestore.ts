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
            email: data.email,
            displayName: data.displayName,
            phone: data.phone,
            bio: data.bio,
            location: data.location,
            website: data.website,
            company: data.company,
            jobTitle: data.jobTitle,
            avatar: data.avatar,
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
      email: userData.email || '',
      displayName: userData.displayName || '',
      phone: userData.phone || '',
      bio: userData.bio || '',
      location: userData.location || '',
      website: userData.website || '',
      company: userData.company || '',
      jobTitle: userData.jobTitle || '',
      avatar: userData.avatar || '',
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
