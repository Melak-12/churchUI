import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vote } from '@/types';
import { getDocumentId } from '@/lib/utils';
import { Clock, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface VoteCardProps {
  vote: Vote;
  isAdmin?: boolean;
}

export function VoteCard({ vote, isAdmin = false }: VoteCardProps) {
  // Debug: Log the vote object to see its structure
  console.log('VoteCard - vote object:', vote);
  console.log('VoteCard - vote.id:', vote.id);
  console.log('VoteCard - vote._id:', (vote as any)._id);

  // Get the vote ID, handling both _id and id fields (MongoDB compatibility)
  const voteId = getDocumentId(vote);

  const getStatusColor = (status: Vote['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{vote.title}</CardTitle>
            {vote.description && (
              <CardDescription className="line-clamp-2">
                {vote.description}
              </CardDescription>
            )}
          </div>
          <Badge className={getStatusColor(vote.status)}>
            {vote.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dates */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(vote.startAt)} - {formatDate(vote.endAt)}</span>
          </div>
        </div>

        {/* Participation */}
        {vote.participationPercent !== undefined && vote.participationPercent !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Participation</span>
              </span>
              <span>{vote.participationPercent}% ({vote.participationCount || 0}/{vote.eligibleCount || 0})</span>
            </div>
            <Progress value={vote.participationPercent} className="h-2" />
          </div>
        )}

        {/* Results (if closed) */}
        {vote.status === 'CLOSED' && vote.results && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>Results</span>
            </div>
            <div className="space-y-1">
              {Object.entries(vote.results).map(([option, count]) => (
                <div key={option} className="flex items-center justify-between text-sm">
                  <span>{option}</span>
                  <Badge variant="outline">{count} votes</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {isAdmin ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/voting/${voteId}`}>
                  {vote.status === 'CLOSED' ? 'View Results' : 'Manage'}
                </Link>
              </Button>
              {vote.status === 'ACTIVE' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/ballot/${voteId}`}>
                    View Ballot
                  </Link>
                </Button>
              )}
            </>
          ) : (
            vote.status === 'ACTIVE' && (
              <Button size="sm" asChild>
                <Link href={`/ballot/${voteId}`}>
                  Cast Vote
                </Link>
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}