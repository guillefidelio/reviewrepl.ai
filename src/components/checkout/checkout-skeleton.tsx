'use client';

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Summary Skeleton */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 rounded mr-3 animate-pulse"></div>
                    <div>
                      <div className="h-5 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="border-t pt-4">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="h-4 w-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Frame Skeleton */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>

              {/* Paddle Frame Placeholder */}
              <div className="w-full h-96 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
                <div className="h-3 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
