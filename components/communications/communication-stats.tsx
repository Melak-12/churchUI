'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface CommunicationStats {
  total: number;
  draft: number;
  scheduled: number;
  sent: number;
  failed: number;
  totalSmsSent?: number;
  totalSmsDelivered?: number;
}

export function CommunicationStats() {
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getCommunicationStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load communication statistics');
        console.error('Error fetching communication stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const totalSmsSent = stats.totalSmsSent || 0;
  const totalSmsDelivered = stats.totalSmsDelivered || 0;
  
  const deliveryRate = totalSmsSent > 0 
    ? Math.round((totalSmsDelivered / totalSmsSent) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Communication Statistics</span>
        </CardTitle>
        <CardDescription>
          Overview of SMS campaigns and delivery performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-gray-600">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {/* SMS Delivery Stats */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">SMS Delivery Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-lg font-semibold">{totalSmsSent.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Messages Sent</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-lg font-semibold">{totalSmsDelivered.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Delivered</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold">%</span>
              </div>
              <div>
                <div className="text-lg font-semibold">{deliveryRate}%</div>
                <div className="text-xs text-gray-600">Delivery Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {stats.scheduled > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{stats.scheduled} Scheduled</span>
            </Badge>
          )}
          {stats.failed > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>{stats.failed} Failed</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
