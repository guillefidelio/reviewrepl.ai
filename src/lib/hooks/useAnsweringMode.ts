import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';

export function useAnsweringMode(uid: string, userProfile: UserProfile | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current selected mode from userProfile
  const selectedMode = userProfile?.answeringMode?.selectedMode || 'simple';

  // Debug logging
  console.log('useAnsweringMode hook:', { 
    uid, 
    selectedMode, 
    userProfile: userProfile?.answeringMode,
    timestamp: Date.now()
  });

  // Update mode in Firebase
  const updateMode = async (newMode: 'simple' | 'pro') => {
    if (!uid || !db) {
      console.error('Cannot update mode: missing uid or db', { uid, hasDb: !!db });
      return;
    }

    console.log('Updating answering mode to:', newMode, 'for user:', uid);
    setLoading(true);
    setError(null);

    try {
      // Update the main user document, not the userprofile subcollection
      const userRef = doc(db, 'users', uid);
      console.log('Updating document at path:', `users/${uid}`);
      
      const updateData = {
        'answeringMode.selectedMode': newMode,
        'answeringMode.lastUpdated': Timestamp.now(),
        'answeringMode.isActive': true
      };
      
      console.log('Update data:', updateData);
      await updateDoc(userRef, updateData);
      console.log('Successfully updated answering mode to:', newMode);
      
      // Note: No need to manually update local state - the real-time listener in AuthProvider will handle this
    } catch (error) {
      console.error('Error updating answering mode:', error);
      setError(error instanceof Error ? error.message : 'Failed to update answering mode');
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedMode,
    loading,
    error,
    updateMode,
    clearError: () => setError(null)
  };
}
