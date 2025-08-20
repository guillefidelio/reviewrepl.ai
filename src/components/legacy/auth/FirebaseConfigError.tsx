'use client';

export function FirebaseConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 border border-red-200">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Firebase Configuration Missing
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            The Firebase configuration is not properly set up. Please check your environment variables.
          </p>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-xs text-gray-700 font-mono">
              Create a <strong>.env.local</strong> file with your Firebase credentials
            </p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Check the <strong>FIREBASE_SETUP.md</strong> file for detailed instructions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
