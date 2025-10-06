"use client";

import { AppShell } from "@/components/layout/app-shell";
import { VoteCard } from "@/components/voting/vote-card";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import {
  Vote as VoteIcon,
  Calendar,
  Loader2,
  CheckCircle,
  Users,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ActiveVotesPage() {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getVotes();
        setVotes(response.votes || []);
      } catch (err: any) {
        console.error("Failed to fetch votes:", err);
        setError(err.message || "Failed to fetch votes");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  const activeVotes = votes.filter((v) => v.status === "ACTIVE");

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='bg-card rounded-xl p-6 border shadow-sm'>
          <div className='flex items-center space-x-3 mb-2'>
            <div className='p-2 bg-blue-500 rounded-lg'>
              <VoteIcon className='h-6 w-6 text-white' />
            </div>
            <h1 className='text-2xl font-bold text-foreground'>
              Community Voting 🗳️
            </h1>
          </div>
          <p className='text-muted-foreground'>
            Have your voice heard in important community decisions
          </p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Active Votes</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {activeVotes.length}
                  </p>
                </div>
                <VoteIcon className='h-8 w-8 text-green-500' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Completed</p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {votes.filter((v) => v.status === "CLOSED").length}
                  </p>
                </div>
                <CheckCircle className='h-8 w-8 text-blue-500' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Votes</p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {votes.length}
                  </p>
                </div>
                <BarChart3 className='h-8 w-8 text-purple-500' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className='text-center py-12'>
              <Loader2 className='h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Loading votes...
              </h3>
              <p className='text-gray-500'>
                Please wait while we fetch the latest votes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className='text-center py-12'>
              <Calendar className='h-12 w-12 text-red-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Error loading votes
              </h3>
              <p className='text-gray-500'>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Active Votes */}
        {!loading && !error && activeVotes.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {activeVotes.map((vote) => (
              <VoteCard key={vote.id} vote={vote} isAdmin={false} />
            ))}
          </div>
        )}

        {/* No Active Votes */}
        {!loading && !error && activeVotes.length === 0 && (
          <Card className='border-dashed border-2 border-gray-200 dark:border-gray-700'>
            <CardContent className='text-center py-12'>
              <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 w-fit mx-auto'>
                <VoteIcon className='h-8 w-8 text-blue-500' />
              </div>
              <h3 className='text-lg font-medium text-foreground mb-2'>
                All caught up! 🎉
              </h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                No active votes right now. New community decisions will appear
                here when they&apos;re available.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Closed Votes */}
        {!loading &&
          !error &&
          votes.filter((v) => v.status === "CLOSED").length > 0 && (
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <BarChart3 className='h-5 w-5 text-muted-foreground' />
                <h2 className='text-lg font-semibold text-foreground'>
                  Recent Results 📊
                </h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {votes
                  .filter((v) => v.status === "CLOSED")
                  .map((vote) => (
                    <VoteCard key={vote.id} vote={vote} isAdmin={false} />
                  ))}
              </div>
            </div>
          )}
      </div>
    </AppShell>
  );
}
