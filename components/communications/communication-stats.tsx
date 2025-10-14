"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

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
        setError("Failed to load communication statistics");
        console.error("Error fetching communication stats:", err);
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
          <CardTitle className='flex items-center space-x-2'>
            <MessageSquare className='h-5 w-5' />
            <span>Communication Statistics</span>
          </CardTitle>
          <CardDescription>
            Loading your communication insights...
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='p-4 rounded-lg border space-y-3'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-8 w-12' />
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
          <CardTitle className='flex items-center space-x-2'>
            <MessageSquare className='h-5 w-5' />
            <span>Communication Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <AlertCircle className='h-8 w-8 text-muted-foreground mx-auto mb-3' />
              <p className='text-sm text-muted-foreground'>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const totalSmsSent = stats.totalSmsSent || 0;
  const totalSmsDelivered = stats.totalSmsDelivered || 0;

  const deliveryRate =
    totalSmsSent > 0 ? Math.round((totalSmsDelivered / totalSmsSent) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <MessageSquare className='h-5 w-5' />
          <span>Communication Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simple Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Total Campaigns */}
          <div className='rounded-lg p-4 border'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 bg-muted rounded-lg'>
                <MessageSquare className='h-4 w-4 text-muted-foreground' />
              </div>
            </div>
            <div className='text-2xl font-bold mb-1'>{stats.total}</div>
            <div className='text-sm text-muted-foreground mb-2'>
              Total Campaigns
            </div>
            <div className='text-xs text-muted-foreground'>
              {stats.draft} drafts • {stats.scheduled} scheduled
            </div>
          </div>

          {/* Messages Sent */}
          <div className='rounded-lg p-4 border'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 bg-muted rounded-lg'>
                <Send className='h-4 w-4 text-muted-foreground' />
              </div>
            </div>
            <div className='text-2xl font-bold mb-1'>
              {totalSmsSent.toLocaleString()}
            </div>
            <div className='text-sm text-muted-foreground mb-2'>
              Messages Sent
            </div>
            <div className='text-xs text-muted-foreground'>
              {totalSmsDelivered.toLocaleString()} delivered
            </div>
          </div>

          {/* Success Rate */}
          <div className='rounded-lg p-4 border'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 bg-muted rounded-lg'>
                <CheckCircle className='h-4 w-4 text-muted-foreground' />
              </div>
            </div>
            <div className='text-2xl font-bold mb-1'>{deliveryRate}%</div>
            <div className='text-sm text-muted-foreground mb-2'>
              Success Rate
            </div>
            <div className='text-xs text-muted-foreground'>
              {stats.failed} failed
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
