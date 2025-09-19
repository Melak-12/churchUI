'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { CommunicationStats } from '@/components/communications/communication-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Member, Vote } from '@/types';
import apiClient from '@/lib/api';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  Vote as VoteIcon, 
  MessageSquare, 
  UserPlus,
  Plus,
  Calendar,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersResponse, votesResponse] = await Promise.all([
          apiClient.getMembers(),
          apiClient.getVotes()
        ]);
        
        setMembers(membersResponse.members);
        setVotes(votesResponse.votes);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const paidMembers = members.filter(m => m.status === 'PAID').length;
  const delinquentMembers = members.filter(m => m.status === 'DELINQUENT').length;
  const criticalDelinquent = members.filter(m => m.delinquencyDays > 90);
  const activeVotes = votes.filter(v => v.status === 'ACTIVE');

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your community</p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/voting/new">
                <VoteIcon className="h-4 w-4 mr-2" />
                New Vote
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/communications/new">
                <MessageSquare className="h-4 w-4 mr-2" />
                New SMS
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/members">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardCard
            title="Paid Members"
            value={paidMembers}
            icon={DollarSign}
            description="Current and up-to-date"
          />
          <DashboardCard
            title="Delinquent Members"
            value={delinquentMembers}
            icon={AlertCircle}
            description="Behind on payments"
          />
          <DashboardCard
            title="Active Votes"
            value={activeVotes.length}
            icon={VoteIcon}
            description="Currently accepting votes"
          />
          <DashboardCard
            title="Total Members"
            value={members.length}
            icon={Users}
            description="All registered members"
          />
        </div>

        {/* Communication Statistics */}
        <CommunicationStats />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Critical Delinquent Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Critical Delinquent (&gt;90 days)</span>
              </CardTitle>
              <CardDescription>
                Members who have lost voting eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {criticalDelinquent.length > 0 ? (
                <div className="space-y-3">
                  {criticalDelinquent.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-500">{member.phone}</div>
                      </div>
                      <Badge variant="destructive">
                        {member.delinquencyDays} days
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    Send Payment Reminder
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All members are current!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Votes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <VoteIcon className="h-5 w-5 text-blue-500" />
                <span>Active Votes</span>
              </CardTitle>
              <CardDescription>
                Votes currently accepting responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeVotes.length > 0 ? (
                <div className="space-y-3">
                  {activeVotes.map((vote) => (
                    <div key={vote.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{vote.title}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-4 mt-1">
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{vote.participationPercent}% participation</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Ends {new Date(vote.endAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/voting/${vote.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <VoteIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">No active votes</p>
                  <Button size="sm" asChild>
                    <Link href="/voting/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Vote
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}