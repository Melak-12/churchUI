"use client";

import { AppShell } from "@/components/layout/app-shell";
import { FeatureGuard } from "@/components/feature-guard";
import { VoteCard } from "@/components/voting/vote-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { Plus, Vote as VoteIcon, Loader2, Filter } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function VotingPage() {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const params =
          statusFilter !== "ALL"
            ? { status: statusFilter as "SCHEDULED" | "ACTIVE" | "CLOSED" }
            : {};
        const response = await apiClient.getVotes(params);
        setVotes(response.votes || []);
      } catch (err: any) {
        console.error("Failed to fetch votes:", err);
        setError(err.message || "Failed to fetch votes");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [statusFilter]);
  return (
    <FeatureGuard feature='voting'>
      <AppShell>
        <div className='space-y-4 sm:space-y-6'>
          {/* Header */}
          <div className='flex flex-col gap-3 sm:gap-4'>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold'>
                Voting & Decisions
              </h1>
              <p className='text-sm text-muted-foreground'>
                Manage community votes and elections democratically
              </p>
            </div>
            <Button asChild className='w-full sm:w-auto sm:max-w-fit'>
              <Link href='/voting/new'>
                <Plus className='h-4 w-4 mr-2' />
                New Vote
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Filter className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Filter by status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue placeholder='All' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Votes</SelectItem>
                    <SelectItem value='SCHEDULED'>Scheduled</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='CLOSED'>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
                <VoteIcon className='h-12 w-12 text-red-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Error loading votes
                </h3>
                <p className='text-gray-500'>{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Votes Grid */}
          {!loading && !error && votes.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {votes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} isAdmin={true} />
              ))}
            </div>
          )}

          {/* No Votes */}
          {!loading && !error && votes.length === 0 && (
            <Card className='border-dashed border-2 border-gray-200'>
              <CardContent className='text-center py-16'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <VoteIcon className='h-8 w-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No votes yet
                </h3>
                <p className='text-gray-500 mb-6 max-w-sm mx-auto'>
                  Create your first vote to get started with community decision
                  making.
                </p>
                <Button
                  asChild
                  variant='outline'
                  className='h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                >
                  <Link href='/voting/new' className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Create Your First Vote
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </FeatureGuard>
  );
}
