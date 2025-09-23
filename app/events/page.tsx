"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { FeatureGuard } from "@/components/auth/feature-guard";
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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CheckCircle,
  AlertCircle,
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

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, filterType, filterStatus]);

  const fetchEvents = async () => {
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
  };

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
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading events...</span>
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
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchEvents} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <FeatureGuard feature="events">
      <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Events
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              {isAdmin
                ? "Manage church events, services, and meetings"
                : "Discover and register for upcoming church events"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/events/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Calendar View</span>
                <span className="sm:hidden">Calendar</span>
              </Link>
            </Button>
            {isAdmin && (
              <Button size="sm" className="w-full sm:w-auto" asChild>
                <Link href="/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Event</span>
                  <span className="sm:hidden">New</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 sm:h-11"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48 lg:w-48 h-10 sm:h-11">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="SPECIAL_OCCASION">
                      Special Occasion
                    </SelectItem>
                    <SelectItem value="CONFERENCE">Conference</SelectItem>
                    <SelectItem value="SOCIAL">Social</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48 lg:w-48 h-10 sm:h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Tabs defaultValue="upcoming" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="text-sm sm:text-base">
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Upcoming</span>
              <span className="ml-1">({upcomingEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="text-sm sm:text-base">
              <span className="hidden sm:inline">Past</span>
              <span className="sm:hidden">Past</span>
              <span className="ml-1">({pastEvents.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={getDocumentId(event)}
                    event={event}
                    onDelete={isAdmin ? handleDeleteEvent : undefined}
                    onRegister={!isAdmin ? handleRegisterForEvent : undefined}
                    isDeleting={deletingEventId === getDocumentId(event)}
                    isRegistering={registeringEventId === getDocumentId(event)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 text-center">
                    No upcoming events
                  </h3>
                  <p className="text-gray-500 text-center mb-6 text-sm sm:text-base max-w-md">
                    Create your first event to get started
                  </p>
                  {isAdmin && (
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link href="/events/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.length > 0 ? (
              <div className="grid gap-4">
                {pastEvents.map((event) => (
                  <EventCard
                    key={getDocumentId(event)}
                    event={event}
                    onDelete={isAdmin ? handleDeleteEvent : undefined}
                    onRegister={!isAdmin ? handleRegisterForEvent : undefined}
                    isDeleting={deletingEventId === getDocumentId(event)}
                    isRegistering={registeringEventId === getDocumentId(event)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 text-center">
                    No past events
                  </h3>
                  <p className="text-gray-500 text-center text-sm sm:text-base max-w-md">
                    Past events will appear here
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 min-w-0">
            {/* Title and Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-3 space-y-2 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {event.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                  {event.type.replace("_", " ")}
                </Badge>
                <Badge className={`${getStatusColor(event.status)} text-xs`}>
                  {event.status}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">
                {event.description}
              </p>
            )}

            {/* Event Details */}
            <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {event.registrationCount || 0}/{event.capacity} registered
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-400">
                {getRelativeTime(event.startDate)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:ml-4 lg:flex-col lg:items-stretch lg:min-w-0">
            {/* View Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto lg:w-full"
              asChild
            >
              <Link href={`/events/${eventId}`}>
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline lg:hidden">View</span>
                <span className="sm:hidden lg:inline">View Details</span>
              </Link>
            </Button>

            {/* Admin Actions */}
            {isAdmin ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto lg:w-full"
                  asChild
                >
                  <Link href={`/events/${eventId}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline lg:hidden">Edit</span>
                    <span className="sm:hidden lg:inline">Edit Event</span>
                  </Link>
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(eventId)}
                    disabled={isDeleting}
                    className="w-full sm:w-auto lg:w-full text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline lg:hidden">
                          Delete
                        </span>
                        <span className="sm:hidden lg:inline">
                          Delete Event
                        </span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              /* Member Actions */
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col">
                {event.registrationRequired &&
                  event.status === "PUBLISHED" &&
                  onRegister && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onRegister(eventId)}
                      disabled={isRegistering || event.isFull}
                      className="w-full sm:w-auto lg:w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : event.isFull ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline lg:hidden">
                            Full
                          </span>
                          <span className="sm:hidden lg:inline">
                            Event Full
                          </span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline lg:hidden">
                            Register
                          </span>
                          <span className="sm:hidden lg:inline">
                            Register Now
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                {!event.registrationRequired &&
                  event.status === "PUBLISHED" && (
                    <div className="flex items-center justify-center text-green-600 text-sm py-2 px-3 border border-green-200 rounded-md bg-green-50">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline lg:hidden">
                        Open to all
                      </span>
                      <span className="sm:hidden lg:inline">
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
