"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventRegistration, Volunteer, Resource } from "@/types";
import apiClient from "@/lib/api";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  Settings,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getDocumentId } from "@/lib/utils";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  isFuture,
} from "date-fns";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  // Debug logging
  console.log("Event ID from params:", eventId);

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId && eventId !== "undefined") {
      fetchEventDetails();
    } else {
      setError("Invalid event ID");
      setLoading(false);
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const [eventData, registrationsData, volunteersData] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.getEventRegistrations(eventId),
        apiClient.getEventVolunteers(eventId),
      ]);

      // Debug logging
      console.log("Event data received:", eventData);
      console.log("Event ID:", eventData.id, "Event _id:", eventData._id);
      console.log("Using getDocumentId:", getDocumentId(eventData));

      setEvent(eventData);
      setRegistrations(registrationsData);
      setVolunteers(volunteersData);
    } catch (err: any) {
      setError(err.message || "Failed to load event details");
      console.error("Event details fetch error:", err);
    } finally {
      setLoading(false);
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

  const getRegistrationStatusColor = (status: string) => {
    const colors = {
      REGISTERED: "bg-blue-100 text-blue-800",
      ATTENDED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.REGISTERED;
  };

  const getVolunteerStatusColor = (status: string) => {
    const colors = {
      ASSIGNED: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || colors.ASSIGNED;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading event details...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error || "Event not found"}</p>
            <Button onClick={() => router.push("/events")} className="mt-4">
              Back to Events
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {event.title}
                </h1>
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type.replace("_", " ")}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
              <p className="text-gray-600">{event.description}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/events/${getDocumentId(event)}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Event Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Registrations
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.registrationCount || 0}
                    {event.capacity && ` / ${event.capacity}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">
              Registrations ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="volunteers">
              Volunteers ({volunteers.length})
            </TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">
                      {event.description || "No description provided"}
                    </p>
                  </div>

                  {event.registrationRequired && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Registration Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Registration Required:
                          </span>
                          <span className="font-medium">Yes</span>
                        </div>
                        {event.capacity && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium">
                              {event.capacity} people
                            </span>
                          </div>
                        )}
                        {event.registrationDeadline && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-medium">
                              {format(
                                new Date(event.registrationDeadline),
                                "MMM d, yyyy h:mm a"
                              )}
                            </span>
                          </div>
                        )}
                        {event.allowWaitlist && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Waitlist:</span>
                            <span className="font-medium">Enabled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {event.isRecurring && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Recurrence
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pattern:</span>
                          <span className="font-medium">
                            {event.recurrencePattern}
                          </span>
                        </div>
                        {event.recurrenceEndDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ends:</span>
                            <span className="font-medium">
                              {format(
                                new Date(event.recurrenceEndDate),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" asChild>
                    <Link
                      href={`/events/${getDocumentId(event)}/registrations`}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Registrations
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/events/${getDocumentId(event)}/volunteers`}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Volunteers
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/events/${getDocumentId(event)}/resources`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Resources
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Event Registrations</h3>
              <Button asChild>
                <Link href={`/events/${getDocumentId(event)}/registrations`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Registration
                </Link>
              </Button>
            </div>

            {registrations.length > 0 ? (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {registration.member.firstName}{" "}
                              {registration.member.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {registration.member.phone}
                            </p>
                          </div>
                          <Badge
                            className={getRegistrationStatusColor(
                              registration.status
                            )}
                          >
                            {registration.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Registered{" "}
                          {format(
                            new Date(registration.registeredAt),
                            "MMM d, yyyy"
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No registrations yet
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    {event.registrationRequired
                      ? "No one has registered for this event yet"
                      : "This event does not require registration"}
                  </p>
                  {event.registrationRequired && (
                    <Button asChild>
                      <Link
                        href={`/events/${getDocumentId(event)}/registrations`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Registration
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Event Volunteers</h3>
              <Button asChild>
                <Link href={`/events/${getDocumentId(event)}/volunteers`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Volunteer
                </Link>
              </Button>
            </div>

            {volunteers.length > 0 ? (
              <div className="space-y-4">
                {volunteers.map((volunteer) => (
                  <Card key={volunteer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {volunteer.member.firstName}{" "}
                              {volunteer.member.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {volunteer.role}
                            </p>
                          </div>
                          <Badge
                            className={getVolunteerStatusColor(
                              volunteer.status
                            )}
                          >
                            {volunteer.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Assigned{" "}
                          {format(
                            new Date(volunteer.assignedAt),
                            "MMM d, yyyy"
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No volunteers assigned
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Assign volunteers to help with this event
                  </p>
                  <Button asChild>
                    <Link href={`/events/${getDocumentId(event)}/volunteers`}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Volunteer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Event Resources</h3>
              <Button asChild>
                <Link href={`/events/${getDocumentId(event)}/resources`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Resources
                </Link>
              </Button>
            </div>

            {event.resources && event.resources.length > 0 ? (
              <div className="space-y-4">
                {event.resources.map((resource, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {resource.resource.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {resource.resource.type}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(resource.startTime), "h:mm a")} -{" "}
                          {format(new Date(resource.endTime), "h:mm a")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No resources assigned
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Assign rooms, equipment, or other resources to this event
                  </p>
                  <Button asChild>
                    <Link href={`/events/${getDocumentId(event)}/resources`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Resources
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
