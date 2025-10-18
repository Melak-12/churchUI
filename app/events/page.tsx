"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { FeatureGuard } from "@/components/feature-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventQuery } from "@/types";
import apiClient from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  PartyPopper,
  Zap,
  Star,
  Grid,
  List,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  isFuture,
} from "date-fns";

export default function EventsPage() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const isAdmin = user.role === "ADMIN";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(
    null
  );

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const query: EventQuery = {
        page: 1,
        limit: 50,
        search: searchTerm || undefined,
        type: filterType !== "all" ? filterType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy: "startDate",
        sortOrder: "asc",
      };

      const response = await apiClient.getEvents(query);
      setEvents(response.events || []);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
      console.error("Events fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingEventId(eventId);
      await apiClient.deleteEvent(eventId);
      // Refresh the events list
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
      console.error("Delete event error:", err);
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    if (!user.memberId) {
      toast({
        title: "Error",
        description:
          "You must be logged in as a member to register for events.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegisteringEventId(eventId);
      await apiClient.registerForEvent(eventId, {
        eventId,
        notes: "",
      });

      toast({
        title: "Success",
        description: "You have successfully registered for this event!",
      });

      // Refresh events to update registration status
      await fetchEvents();
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description:
          err.message || "Failed to register for event. Please try again.",
        variant: "destructive",
      });
      console.error("Registration error:", err);
    } finally {
      setRegisteringEventId(null);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      SERVICE: "bg-blue-100 text-blue-800",
      MEETING: "bg-green-100 text-green-800",
      SPECIAL_OCCASION: "bg-purple-100 text-purple-800",
      CONFERENCE: "bg-orange-100 text-orange-800",
      SOCIAL: "bg-pink-100 text-pink-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getRelativeTime = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return "Today";
    if (isTomorrow(eventDate)) return "Tomorrow";
    if (isThisWeek(eventDate)) return "This week";
    if (isPast(eventDate)) return "Past";
    return "Upcoming";
  };

  const upcomingEvents =
    events?.filter((event) => isFuture(new Date(event.startDate))) || [];
  const pastEvents =
    events?.filter((event) => isPast(new Date(event.startDate))) || [];

  if (loading) {
    return (
      <AppShell>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center space-x-2'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
            <span>Loading events...</span>
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
            <p className='text-red-600'>{error}</p>
            <Button onClick={fetchEvents} className='mt-4'>
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <FeatureGuard feature='events'>
      <AppShell>
        <div className='space-y-4 sm:space-y-6'>
          {/* Header Section */}
          <div className='flex flex-col gap-3 sm:gap-4'>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold'>
                Events
              </h1>
              <p className='text-sm text-muted-foreground'>
                Discover and join upcoming community activities
              </p>
            </div>
            {isAdmin && (
              <Button asChild className='w-full sm:w-auto sm:max-w-fit'>
                <Link href='/events/new'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Event
                </Link>
              </Button>
            )}
          </div>


          {/* Search and Filters */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative flex-1'>
                  <Search className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search events...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' asChild>
                    <Link href='/events/calendar'>
                      <Calendar className='h-4 w-4 mr-2' />
                      Calendar
                    </Link>
                  </Button>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className='w-32'>
                      <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      <SelectItem value='SERVICE'>Service</SelectItem>
                      <SelectItem value='MEETING'>Meeting</SelectItem>
                      <SelectItem value='SPECIAL_OCCASION'>Special</SelectItem>
                      <SelectItem value='CONFERENCE'>Conference</SelectItem>
                      <SelectItem value='SOCIAL'>Social</SelectItem>
                      <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Tabs defaultValue='upcoming' className='space-y-4 sm:space-y-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='upcoming' className='text-sm sm:text-base'>
                <span className='hidden sm:inline'>Upcoming</span>
                <span className='sm:hidden'>Upcoming</span>
                <span className='ml-1'>({upcomingEvents.length})</span>
              </TabsTrigger>
              <TabsTrigger value='past' className='text-sm sm:text-base'>
                <span className='hidden sm:inline'>Past</span>
                <span className='sm:hidden'>Past</span>
                <span className='ml-1'>({pastEvents.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='upcoming' className='space-y-4'>
              {upcomingEvents.length > 0 ? (
                <div className='grid gap-4'>
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={getDocumentId(event)}
                      event={event}
                      onDelete={isAdmin ? handleDeleteEvent : undefined}
                      onRegister={!isAdmin ? handleRegisterForEvent : undefined}
                      isDeleting={deletingEventId === getDocumentId(event)}
                      isRegistering={
                        registeringEventId === getDocumentId(event)
                      }
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              ) : (
                <Card className='border-dashed border-2 border-gray-200 dark:border-gray-700'>
                  <CardContent className='flex flex-col items-center justify-center py-12 px-4'>
                    <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4'>
                      <Calendar className='h-8 w-8 text-blue-500' />
                    </div>
                    <h3 className='text-lg font-medium text-foreground mb-2 text-center'>
                      No upcoming events yet!
                    </h3>
                    <p className='text-muted-foreground text-center mb-6 max-w-md'>
                      {isAdmin
                        ? "Ready to bring the community together? Create your first event!"
                        : "Check back soon for exciting community activities and gatherings."}
                    </p>
                    {isAdmin && (
                      <Button className='shadow-sm' asChild>
                        <Link href='/events/new'>
                          <Plus className='h-4 w-4 mr-2' />
                          Create Your First Event
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value='past' className='space-y-4'>
              {pastEvents.length > 0 ? (
                <div className='grid gap-4'>
                  {pastEvents.map((event) => (
                    <EventCard
                      key={getDocumentId(event)}
                      event={event}
                      onDelete={isAdmin ? handleDeleteEvent : undefined}
                      onRegister={!isAdmin ? handleRegisterForEvent : undefined}
                      isDeleting={deletingEventId === getDocumentId(event)}
                      isRegistering={
                        registeringEventId === getDocumentId(event)
                      }
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              ) : (
                <Card className='border-dashed border-2 border-gray-200 dark:border-gray-700'>
                  <CardContent className='flex flex-col items-center justify-center py-12 px-4'>
                    <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-4'>
                      <Calendar className='h-8 w-8 text-purple-500' />
                    </div>
                    <h3 className='text-lg font-medium text-foreground mb-2 text-center'>
                      No past events yet
                    </h3>
                    <p className='text-muted-foreground text-center max-w-md'>
                      Your event history will appear here as activities are
                      completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </FeatureGuard>
  );
}

function EventCard({
  event,
  onDelete,
  onRegister,
  isDeleting,
  isRegistering,
  isAdmin,
}: {
  event: Event;
  onDelete?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  isDeleting: boolean;
  isRegistering: boolean;
  isAdmin: boolean;
}) {
  // Get the event ID using the utility function
  const eventId = getDocumentId(event);

  const getEventTypeColor = (type: string) => {
    const colors = {
      SERVICE: "bg-blue-100 text-blue-800",
      MEETING: "bg-green-100 text-green-800",
      SPECIAL_OCCASION: "bg-purple-100 text-purple-800",
      CONFERENCE: "bg-orange-100 text-orange-800",
      SOCIAL: "bg-pink-100 text-pink-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getRelativeTime = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return "Today";
    if (isTomorrow(eventDate)) return "Tomorrow";
    if (isThisWeek(eventDate)) return "This week";
    if (isPast(eventDate)) return "Past";
    return "Upcoming";
  };

  return (
    <Card className='hover:shadow-md transition-all duration-300'>
      <CardContent className='p-3 sm:p-4 md:p-6'>
        <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 sm:space-y-4 lg:space-y-0'>
          <div className='flex-1 min-w-0'>
            {/* Title and Badges */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2 sm:mb-3 space-y-1.5 sm:space-y-0'>
              <h3 className='text-base sm:text-lg md:text-xl font-semibold text-foreground truncate'>
                {event.title}
              </h3>
              <div className='flex flex-wrap gap-1.5 sm:gap-2'>
                <Badge
                  variant='secondary'
                  className={`${getEventTypeColor(event.type)} text-xs px-1.5 py-0.5`}
                >
                  {event.type.replace("_", " ")}
                </Badge>
                <Badge
                  variant='secondary'
                  className={`${getStatusColor(event.status)} text-xs px-1.5 py-0.5`}
                >
                  {event.status}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className='text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4 line-clamp-2'>
                {event.description}
              </p>
            )}

            {/* Event Details */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm text-muted-foreground'>
              <div className='flex items-center space-x-1.5 sm:space-x-2'>
                <div className='p-0.5 sm:p-1 bg-blue-50 dark:bg-blue-900/20 rounded'>
                  <Clock className='h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500' />
                </div>
                <span className='truncate text-[11px] sm:text-xs'>
                  {format(new Date(event.startDate), "MMM d, h:mm a")}
                </span>
              </div>
              <div className='flex items-center space-x-1.5 sm:space-x-2'>
                <div className='p-0.5 sm:p-1 bg-green-50 dark:bg-green-900/20 rounded'>
                  <MapPin className='h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-green-500' />
                </div>
                <span className='truncate text-[11px] sm:text-xs'>{event.location}</span>
              </div>
              {event.capacity && (
                <div className='flex items-center space-x-1.5 sm:space-x-2'>
                  <div className='p-0.5 sm:p-1 bg-purple-50 dark:bg-purple-900/20 rounded'>
                    <Users className='h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-purple-500' />
                  </div>
                  <span className='text-[11px] sm:text-xs'>
                    {event.registrationCount || 0}/{event.capacity}
                  </span>
                </div>
              )}
              <div className='flex items-center space-x-1.5 sm:space-x-2'>
                <div className='p-0.5 sm:p-1 bg-orange-50 dark:bg-orange-900/20 rounded'>
                  <Calendar className='h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-orange-500' />
                </div>
                <span className='font-medium text-orange-600 text-[11px] sm:text-xs'>
                  {getRelativeTime(event.startDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-row sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 lg:ml-4 lg:flex-col lg:items-stretch lg:min-w-0'>
            {/* View Button */}
            <Button
              variant='outline'
              size='sm'
              className='flex-1 sm:flex-none sm:w-auto lg:w-full text-xs h-8 sm:h-9'
              asChild
            >
              <Link href={`/events/${eventId}`}>
                <Eye className='h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
                <span className='hidden sm:inline lg:hidden'>View</span>
                <span className='sm:hidden lg:inline'>View</span>
              </Link>
            </Button>

            {/* Admin Actions */}
            {isAdmin ? (
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full sm:w-auto lg:w-full'
                  asChild
                >
                  <Link href={`/events/${eventId}/edit`}>
                    <Edit className='h-4 w-4 mr-2' />
                    <span className='hidden sm:inline lg:hidden'>Edit</span>
                    <span className='sm:hidden lg:inline'>Edit Event</span>
                  </Link>
                </Button>
                {onDelete && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onDelete(eventId)}
                    disabled={isDeleting}
                    className='w-full sm:w-auto lg:w-full text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50'
                  >
                    {isDeleting ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                    ) : (
                      <>
                        <Trash2 className='h-4 w-4 mr-2' />
                        <span className='hidden sm:inline lg:hidden'>
                          Delete
                        </span>
                        <span className='sm:hidden lg:inline'>
                          Delete Event
                        </span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              /* Member Actions */
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col'>
                {event.registrationRequired &&
                  event.status === "PUBLISHED" &&
                  onRegister && (
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => onRegister(eventId)}
                      disabled={isRegistering || event.isFull}
                      className='w-full sm:w-auto lg:w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                    >
                      {isRegistering ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      ) : event.isFull ? (
                        <>
                          <AlertCircle className='h-4 w-4 mr-2' />
                          <span className='hidden sm:inline lg:hidden'>
                            Full
                          </span>
                          <span className='sm:hidden lg:inline'>
                            Event Full
                          </span>
                        </>
                      ) : (
                        <>
                          <UserPlus className='h-4 w-4 mr-2' />
                          <span className='hidden sm:inline lg:hidden'>
                            Register
                          </span>
                          <span className='sm:hidden lg:inline'>
                            Register Now
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                {!event.registrationRequired &&
                  event.status === "PUBLISHED" && (
                    <div className='flex items-center justify-center text-green-600 text-sm py-2 px-3 border border-green-200 rounded-md bg-green-50'>
                      <CheckCircle className='h-4 w-4 mr-2' />
                      <span className='hidden sm:inline lg:hidden'>
                        Open to all
                      </span>
                      <span className='sm:hidden lg:inline'>
                        Open to All Members
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
