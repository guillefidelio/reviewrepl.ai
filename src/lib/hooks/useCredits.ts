import { useState, useEffect } from 'react';
import { doc, collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'usage' | 'allocation' | 'purchase' | 'reset' | 'refund' | 'bonus' | 'manual_adjustment';
  amount: number;
  balanceAfter: number;
  timestamp: Date;
  description: string;
}

export interface CreditBalance {
  available: number;
  total: number;
  lastUpdated: Date;
}

export function useCredits(userId: string | undefined) {
  const [balance, setBalance] = useState<CreditBalance>({ available: 0, total: 0, lastUpdated: new Date() });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to user document for credit balance
    const userUnsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.credits) {
            setBalance({
              available: data.credits.available || 0,
              total: data.credits.total || 0,
              lastUpdated: data.credits.lastUpdated?.toDate() || new Date(),
            });
          } else {
            // Default credits for new users
            setBalance({
              available: 10, // Free tier credits
              total: 10,
              lastUpdated: new Date(),
            });
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user credits:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Listen to credit transactions
    const transactionsUnsubscribe = onSnapshot(
      query(
        collection(db, 'users', userId, 'creditTransactions'),
        orderBy('timestamp', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        const creditTransactions: CreditTransaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          creditTransactions.push({
            id: doc.id,
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            balanceAfter: data.balanceAfter,
            timestamp: data.timestamp?.toDate() || new Date(),
            description: data.description,
          });
        });
        setTransactions(creditTransactions);
      },
      (err) => {
        console.error('Error fetching credit transactions:', err);
        // Don't set error here as it's not critical for basic functionality
      }
    );

    return () => {
      userUnsubscribe();
      transactionsUnsubscribe();
    };
  }, [userId]);

  const getCreditUsage = () => {
    if (balance.total === 0) return 0;
    return ((balance.total - balance.available) / balance.total) * 100;
  };

  return {
    balance,
    transactions,
    loading,
    error,
    getCreditUsage,
    clearError: () => setError(null),
  };
}
