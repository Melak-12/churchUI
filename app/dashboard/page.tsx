"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CommunicationStats } from "@/components/communications/communication-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Member, Vote, Event } from "@/types";
import apiClient from "@/lib/api";
import {
  Users,
  AlertCircle,
  Vote as VoteIcon,
  MessageSquare,
  UserPlus,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersResponse, votesResponse, eventsResponse] =
          await Promise.all([
            apiClient.getMembers(),
            apiClient.getVotes(),
            apiClient.getUpcomingEvents(5),
          ]);

        setMembers(membersResponse.members);
        setVotes(votesResponse.votes);
        setEvents(eventsResponse);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const paidMembers = members.filter((m) => m.status === "PAID").length;
  const delinquentMembers = members.filter(
    (m) => m.status === "DELINQUENT"
  ).length;
  const criticalDelinquent = members.filter((m) => m.delinquencyDays > 90);
  const activeVotes = votes.filter((v) => v.status === "ACTIVE");

  if (loading) {
    return (
      <AppShell>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <AlertCircle className='h-8 w-8 text-red-500 mx-auto mb-2' />
            <p className='text-red-600'>{error}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Dashboard</h1>
            <p className='text-muted-foreground'>Overview of your community</p>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' asChild>
              <Link href='/communications/new'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Send SMS
              </Link>
            </Button>
            <Button size='sm' asChild>
              <Link href='/members/new'>
                <UserPlus className='h-4 w-4 mr-2' />
                Add Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <DashboardCard
            title='Paid Members'
            value={paidMembers}
            icon={Users}
            iconColor='green'
            description='Current and up-to-date'
          />
          <DashboardCard
            title='Need Follow-up'
            value={delinquentMembers}
            icon={AlertCircle}
            iconColor='orange'
            description='Behind on payments'
          />
          <DashboardCard
            title='Active Votes'
            value={activeVotes.length}
            icon={VoteIcon}
            iconColor='blue'
            description='Currently accepting votes'
          />
          <DashboardCard
            title='Total Members'
            value={members.length}
            icon={Users}
            iconColor='purple'
            description='All registered members'
          />
        </div>

        {/* Communication Statistics */}
        <CommunicationStats />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-medium'>
                Upcoming Events
              </CardTitle>
              <CardDescription>Next 5 events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className='space-y-2'>
                  {events.map((event) => (
                    <div key={event.id} className='p-3 border rounded-lg'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium truncate'>
                            {event.title}
                          </div>
                          <div className='text-sm text-muted-foreground mt-1 flex items-center gap-4'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                            {event.location && (
                              <span className='truncate'>{event.location}</span>
                            )}
                          </div>
                        </div>
                        <Button variant='outline' size='sm' asChild>
                          <Link href={`/events/${event.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full'
                    asChild
                  >
                    <Link href='/events'>View All</Link>
                  </Button>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <Calendar className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
                  <p className='text-sm text-muted-foreground mb-4'>
                    No upcoming events
                  </p>
                  <Button size='sm' variant='outline' asChild>
                    <Link href='/events/new'>Create Event</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Critical Delinquent Members */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-medium'>
                Need Attention
              </CardTitle>
              <CardDescription>Members over 90 days behind</CardDescription>
            </CardHeader>
            <CardContent>
              {criticalDelinquent.length > 0 ? (
                <div className='space-y-2'>
                  {criticalDelinquent.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium truncate'>
                          {member.firstName} {member.lastName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {member.phone}
                        </div>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {member.delinquencyDays} days
                      </div>
                    </div>
                  ))}
                  <Button variant='outline' size='sm' className='w-full'>
                    Send Reminder
                  </Button>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-sm text-muted-foreground'>
                    All members are current
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Votes */}
        {activeVotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-medium'>
                Active Votes
              </CardTitle>
              <CardDescription>
                Votes currently accepting responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {activeVotes.map((vote) => (
                  <div key={vote.id} className='p-3 border rounded-lg'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium'>{vote.title}</div>
                        <div className='text-sm text-muted-foreground mt-1'>
                          Ends {new Date(vote.endAt).toLocaleDateString()} •{" "}
                          {vote.participationPercent}% voted
                        </div>
                      </div>
                      <Button variant='outline' size='sm' asChild>
                        <Link href={`/voting/${vote.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
