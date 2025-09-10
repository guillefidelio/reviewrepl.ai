'use client';

import { useEffect, useState } from 'react';
import { usePaddleSubscription } from '@/lib/hooks/usePaddleSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Download, CreditCard, Calendar } from 'lucide-react';

interface BillingHistoryItem {
  id: string;
  type: 'subscription' | 'transaction' | 'credit_allocation';
  description: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  invoiceUrl?: string;
}

export function BillingHistory() {
  const { } = usePaddleSubscription();
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock billing history data - replace with real API calls
  useEffect(() => {
    const fetchBillingHistory = async () => {
      setLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with actual Paddle API calls
      const mockHistory: BillingHistoryItem[] = [
        {
          id: '1',
          type: 'subscription',
          description: 'Pro Plan - Monthly Subscription',
          amount: 29.99,
          currency: 'USD',
          status: 'paid',
          date: '2024-01-15T10:30:00Z',
          invoiceUrl: '#'
        },
        {
          id: '2',
          type: 'subscription',
          description: 'Pro Plan - Monthly Subscription',
          amount: 29.99,
          currency: 'USD',
          status: 'paid',
          date: '2024-01-01T10:30:00Z',
          invoiceUrl: '#'
        },
        {
          id: '3',
          type: 'credit_allocation',
          description: 'Monthly Credit Allocation - 500 credits',
          amount: 0,
          currency: 'USD',
          status: 'completed',
          date: '2024-01-01T00:00:00Z'
        }
      ];

      setBillingHistory(mockHistory);
      setLoading(false);
    };

    fetchBillingHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { variant: 'secondary' as const, className: 'bg-green-100 text-green-800' },
      pending: { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' },
      failed: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      completed: { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <CreditCard className="h-4 w-4" />;
      case 'transaction':
        return <Receipt className="h-4 w-4" />;
      case 'credit_allocation':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Loading your billing history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          View your payment history and download invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your billing history will appear here once you make payments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {billingHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                    <p className="text-sm text-gray-600">{item.currency}</p>
                  </div>

                  {item.invoiceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.invoiceUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export/Refresh Actions */}
        {billingHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {billingHistory.length} transactions
              </p>
              <div className="space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
