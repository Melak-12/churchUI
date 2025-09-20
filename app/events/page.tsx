"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">
              {isAdmin
                ? "Manage church events, services, and meetings"
                : "Discover and register for upcoming church events"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/events/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild>
                <Link href="/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
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
          </CardContent>
        </Card>

        {/* Events List */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
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
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming events
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Create your first event to get started
                  </p>
                  <Button asChild>
                    <Link href="/events/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
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
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No past events
                  </h3>
                  <p className="text-gray-500 text-center">
                    Past events will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {event.title}
              </h3>
              <Badge className={getEventTypeColor(event.type)}>
                {event.type.replace("_", " ")}
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>

            {event.description && (
              <p className="text-gray-600 mb-3 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
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

          <div className="flex items-center space-x-2 ml-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${eventId}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>

            {isAdmin ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${eventId}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(eventId)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </>
            ) : (
              <>
                {event.registrationRequired &&
                  event.status === "PUBLISHED" &&
                  onRegister && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onRegister(eventId)}
                      disabled={isRegistering || event.isFull}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : event.isFull ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Full
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Register
                        </>
                      )}
                    </Button>
                  )}
                {!event.registrationRequired &&
                  event.status === "PUBLISHED" && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Open to all
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
