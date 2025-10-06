"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
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
      <Card className='overflow-hidden'>
        <CardHeader className='bg-primary text-white'>
          <CardTitle className='flex items-center space-x-2'>
            <MessageSquare className='h-6 w-6' />
            <span>📱 Messages & Outreach</span>
          </CardTitle>
          <CardDescription className='text-purple-100'>
            Loading your communication insights...
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='p-4 rounded-lg bg-gray-50 space-y-3'>
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
      <Card className='overflow-hidden'>
        <CardHeader className='bg-primary text-white'>
          <CardTitle className='flex items-center space-x-2'>
            <MessageSquare className='h-6 w-6' />
            <span>📱 Messages & Outreach</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-3' />
              <p className='text-red-600 font-medium'>
                Oops! Something went wrong
              </p>
              <p className='text-gray-500 text-sm'>{error}</p>
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
        <CardDescription>
          Overview of your messaging campaigns and delivery performance
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Unified Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {/* Total Campaigns */}
          <div className='bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-md'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='text-right'>
                <div className='text-3xl font-bold text-blue-700 dark:text-blue-300'>
                  {stats.total}
                </div>
                <div className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                  Total Campaigns
                </div>
              </div>
            </div>
            <div className='flex items-center text-sm text-blue-600 dark:text-blue-400'>
              <div className='text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full'>
                {stats.draft} drafts • {stats.scheduled} scheduled
              </div>
            </div>
          </div>

          {/* Messages Sent & Delivered */}
          <div className='bg-green-50 dark:bg-green-950 rounded-lg p-6 border'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-green-500 dark:bg-green-600 rounded-lg shadow-md'>
                <Send className='h-6 w-6 text-white' />
              </div>
              <div className='text-right'>
                <div className='text-3xl font-bold text-green-700 dark:text-green-300'>
                  {totalSmsSent.toLocaleString()}
                </div>
                <div className='text-sm font-medium text-green-600 dark:text-green-400'>
                  Messages Sent
                </div>
              </div>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-green-600 dark:text-green-400'>
                ✓ {totalSmsDelivered.toLocaleString()} delivered
              </span>
              <span className='text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full'>
                {stats.sent} campaigns
              </span>
            </div>
          </div>

          {/* Success Rate */}
          <div className='bg-purple-50 dark:bg-purple-950 rounded-lg p-6 border'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-purple-500 dark:bg-purple-600 rounded-lg shadow-md'>
                <TrendingUp className='h-6 w-6 text-white' />
              </div>
              <div className='text-right'>
                <div className='text-3xl font-bold text-purple-700 dark:text-purple-300'>
                  {deliveryRate}%
                </div>
                <div className='text-sm font-medium text-purple-600 dark:text-purple-400'>
                  Success Rate
                </div>
              </div>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span
                className={`font-medium ${
                  deliveryRate >= 95
                    ? "text-green-600 dark:text-green-400"
                    : deliveryRate >= 85
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {deliveryRate >= 95
                  ? "🎉 Excellent!"
                  : deliveryRate >= 85
                  ? "👍 Good"
                  : "⚠️ Needs attention"}
              </span>
              <span className='text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full'>
                {stats.failed} failed
              </span>
            </div>
          </div>
        </div>

        {/* Status Summary Bar */}
        <div className='bg-muted/50 rounded-lg p-4 border'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center space-x-2'>
              <MessageSquare className='h-5 w-5 text-muted-foreground' />
              <span className='font-medium text-foreground'>
                Quick Overview
              </span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {stats.draft > 0 && (
                <Badge
                  variant='secondary'
                  className='bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                >
                  <Clock className='h-3 w-3 mr-1' />
                  {stats.draft} Draft{stats.draft > 1 ? "s" : ""}
                </Badge>
              )}
              {stats.scheduled > 0 && (
                <Badge
                  variant='secondary'
                  className='bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700'
                >
                  <Clock className='h-3 w-3 mr-1' />
                  {stats.scheduled} Scheduled
                </Badge>
              )}
              {stats.failed > 0 ? (
                <Badge variant='destructive'>
                  <AlertCircle className='h-3 w-3 mr-1' />
                  {stats.failed} Failed
                </Badge>
              ) : (
                <Badge
                  variant='secondary'
                  className='bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                >
                  <CheckCircle className='h-3 w-3 mr-1' />
                  All Success!
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
