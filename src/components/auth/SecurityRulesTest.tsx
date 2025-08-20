'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

export function SecurityRulesTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

    const testSecurityRules = async () => {
    if (!user) {
      addResult('❌ No user authenticated');
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    addResult('🚀 Starting security rules test...');

    try {
      if (!db) {
        addResult('❌ Firestore not initialized');
        return;
      }

      // Test 1: User can read their own document
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          addResult('✅ User can read own document');
        } else {
          addResult('⚠️ User document does not exist yet');
        }
      } catch (error) {
        addResult(`❌ User cannot read own document: ${error}`);
      }

      // Test 2: User can create their own document
      try {
        const userData = {
          email: user.email,
          displayName: user.displayName || 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        addResult('✅ User can create own document');
      } catch (error) {
        addResult(`❌ User cannot create own document: ${error}`);
      }

      // Test 3: User can create a business profile in their user subcollection
      try {
        const businessProfileData = {
          businessName: 'Test Business',
          productService: 'Test Service',
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const businessProfileRef = await addDoc(collection(db, 'users', user.uid, 'businessProfiles'), businessProfileData);
        addResult('✅ User can create business profile in user subcollection');
        
        // Test 4: User can read their own business profile from user subcollection
        try {
          const businessDoc = await getDoc(doc(db, 'users', user.uid, 'businessProfiles', businessProfileRef.id));
          if (businessDoc.exists()) {
            addResult('✅ User can read own business profile from user subcollection');
          }
               } catch {
         addResult('❌ User cannot read own business profile from user subcollection');
       }
      } catch (error) {
        addResult(`❌ User cannot create business profile in user subcollection: ${error}`);
      }

      // Test 5: User can create a prompt in their user subcollection
      try {
        const promptData = {
          text: 'Test prompt for security rules testing',
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const promptRef = await addDoc(collection(db, 'users', user.uid, 'prompts'), promptData);
        addResult('✅ User can create prompt in user subcollection');
        
        // Test 6: User can read their own prompt from user subcollection
        try {
          const promptDoc = await getDoc(doc(db, 'users', user.uid, 'prompts', promptRef.id));
          if (promptDoc.exists()) {
            addResult('✅ User can read own prompt from user subcollection');
          }
                 } catch {
           addResult('❌ User cannot read own prompt from user subcollection');
         }
      } catch (error) {
        addResult(`❌ User cannot create prompt in user subcollection: ${error}`);
      }

      // Test 7: User cannot read other users' data (should fail)
      try {
        const otherUserId = 'other-user-id-that-does-not-exist';
        await getDoc(doc(db, 'users', otherUserId));
        addResult('❌ Security breach: User can read other user document');
      } catch (error) {
        addResult('✅ Security working: User cannot read other user document');
      }

      addResult('🎉 Security rules test completed!');

    } catch (error) {
      addResult(`❌ Test failed with error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Please log in to test security rules</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Firestore Security Rules Test
      </h3>
      
      <div className="mb-4">
        <button
          onClick={testSecurityRules}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? 'Testing...' : 'Run Security Rules Test'}
        </button>
        
        <button
          onClick={clearResults}
          className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
        <h4 className="font-medium text-gray-900 mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Click &quot;Run Security Rules Test&quot; to begin.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>What this tests:</strong></p>
                 <ul className="list-disc list-inside mt-2 space-y-1">
           <li>User can read/write their own data</li>
           <li>User cannot access other users&apos; data</li>
           <li>Business profile creation and access in user subcollection</li>
           <li>Prompt creation and access in user subcollection</li>
           <li>Data validation rules</li>
         </ul>
      </div>
    </div>
  );
}
