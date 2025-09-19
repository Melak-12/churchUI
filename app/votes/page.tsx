'use client';

import { AppShell } from '@/components/layout/app-shell';
import { VoteCard } from '@/components/voting/vote-card';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { Vote as VoteIcon, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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
        console.error('Failed to fetch votes:', err);
        setError(err.message || 'Failed to fetch votes');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  const activeVotes = votes.filter(v => v.status === 'ACTIVE');

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Votes</h1>
          <p className="text-gray-600">Participate in community decisions</p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading votes...</h3>
              <p className="text-gray-500">Please wait while we fetch the latest votes.</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading votes</h3>
              <p className="text-gray-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Active Votes */}
        {!loading && !error && activeVotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeVotes.map((vote) => (
              <VoteCard key={vote.id} vote={vote} isAdmin={false} />
            ))}
          </div>
        )}

        {/* No Active Votes */}
        {!loading && !error && activeVotes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active votes</h3>
              <p className="text-gray-500">
                There are currently no votes accepting responses. Check back later for new community decisions.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Closed Votes */}
        {!loading && !error && votes.filter(v => v.status === 'CLOSED').length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {votes
                .filter(v => v.status === 'CLOSED')
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