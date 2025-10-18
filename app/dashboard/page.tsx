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
import { Member, Event } from "@/types";
import apiClient from "@/lib/api";
import {
  Users,
  AlertCircle,
  MessageSquare,
  UserPlus,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersResponse, eventsResponse] =
          await Promise.all([
            apiClient.getMembers(),
            apiClient.getUpcomingEvents(5),
          ]);

        setMembers(membersResponse.members);
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
      <div className='space-y-4 sm:space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-3 sm:gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold'>Dashboard</h1>
            <p className='text-sm text-muted-foreground'>Overview of your community</p>
          </div>
          <div className='flex flex-row gap-3'>
            <Button
              size='sm'
              variant='outline'
              asChild
              className='flex-1 sm:flex-none sm:w-auto'
            >
              <Link href='/communications/new'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Send SMS
              </Link>
            </Button>
            <Button size='sm' asChild className='flex-1 sm:flex-none sm:w-auto'>
              <Link href='/members/new'>
                <UserPlus className='h-4 w-4 mr-2' />
                Add Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
        </div>

        {/* Upcoming Events - Only show if there are events */}
        {events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>Upcoming Events</span>
                <Button variant='outline' size='sm' asChild>
                  <Link href='/events'>View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className='flex items-center justify-between p-3 border rounded-lg'>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium truncate'>{event.title}</div>
                      <div className='text-sm text-muted-foreground flex items-center gap-4'>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-4 w-4' />
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Delinquent Members - Only show if there are any */}
        {criticalDelinquent.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Need Attention</CardTitle>
              <CardDescription>Members over 90 days behind</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {criticalDelinquent.slice(0, 3).map((member) => (
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
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
