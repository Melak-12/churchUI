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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event, EventRegistration, Member } from "@/types";
import apiClient from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EventRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  // Debug logging
  console.log("Registrations page - Event ID from params:", eventId);
  console.log("Registrations page - All params:", params);

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRegistration, setNewRegistration] = useState({
    memberId: "",
    notes: "",
    emergencyContact: { name: "", phone: "" },
    dietaryRestrictions: "",
    specialRequirements: "",
  });

  useEffect(() => {
    if (eventId && eventId !== "undefined") {
      fetchData();
    }
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for event ID:", eventId);

      const [eventData, registrationsData] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.getEventRegistrations(eventId),
      ]);

      console.log("Event data received:", eventData);
      console.log("Registrations data received:", registrationsData);
      console.log("🎯 Event Status:", eventData.status);
      console.log("📅 Registration Deadline:", eventData.registrationDeadline);
      console.log("👥 Capacity:", eventData.capacity);
      console.log("📝 Registration Required:", eventData.registrationRequired);

      setEvent(eventData);
      setRegistrations(registrationsData);

      // Try to fetch members, but don't fail if it doesn't work
      try {
        const membersData = await apiClient.getMembers({ limit: 1000 }); // Get all members
        setMembers(membersData.members || []);
        console.log(
          "Members data received:",
          membersData.members?.length || 0,
          "members"
        );
      } catch (membersErr: any) {
        console.warn("Failed to fetch members:", membersErr.message);
        // Don't show error toast for members fetch failure, just log it
        setMembers([]);
      }
    } catch (err: any) {
      console.error("Fetch data error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRegistration.memberId) {
      toast({
        title: "❌ Validation Error",
        description: "Please select a member to register",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setDebugInfo(null);

    const registrationData = {
      eventId,
      memberId: newRegistration.memberId,
      notes: newRegistration.notes,
      emergencyContact: newRegistration.emergencyContact.name
        ? newRegistration.emergencyContact
        : undefined,
      dietaryRestrictions: newRegistration.dietaryRestrictions || undefined,
      specialRequirements: newRegistration.specialRequirements || undefined,
    };

    console.log("🚀 Starting registration process...");
    console.log("📋 Registration data:", registrationData);
    console.log("🎯 Event ID:", eventId);

    // Check API client state
    console.log(
      "🔑 API Client token:",
      apiClient.token ? "Present" : "Missing"
    );
    console.log(
      "🌐 API Base URL:",
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    );

    try {
      // Test API client connectivity first
      console.log("🧪 Testing API client connectivity...");
      try {
        const healthCheck = await apiClient.healthCheck();
        console.log("✅ Health check successful:", healthCheck);
      } catch (healthErr) {
        console.error("❌ Health check failed:", healthErr);
      }

      console.log("📡 Calling API: registerForEvent");
      const response = await apiClient.registerForEvent(
        eventId,
        registrationData
      );

      console.log("✅ Registration successful:", response);

      toast({
        title: "🎉 Success!",
        description:
          "Registration added successfully! The member has been registered for this event.",
      });

      setNewRegistration({
        memberId: "",
        notes: "",
        emergencyContact: { name: "", phone: "" },
        dietaryRestrictions: "",
        specialRequirements: "",
      });
      setShowAddForm(false);
      await fetchData();
    } catch (err: any) {
      console.error("❌ Registration failed:", err);
      console.error("❌ Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
        response: err.response,
        config: err.config,
      });

      const debugData = {
        error: err.message,
        errorName: err.name,
        errorStack: err.stack,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        url: err.config?.url || err.request?.url,
        method: err.config?.method || err.request?.method,
        headers: err.config?.headers || err.request?.headers,
        timestamp: new Date().toISOString(),
        registrationData: registrationData,
        eventId: eventId,
        fullError: err,
      };

      setDebugInfo(debugData);

      // Enhanced error message based on status code
      let errorTitle = "❌ Registration Failed";
      let errorDescription = err.message || "Failed to add registration";

      if (err.response?.status === 401) {
        errorTitle = "🔐 Authentication Error";
        errorDescription =
          "You need to be logged in to register members. Please log in and try again.";
      } else if (err.response?.status === 403) {
        errorTitle = "🚫 Permission Denied";
        errorDescription =
          "You don't have permission to register members for this event. Admin access required.";
      } else if (err.response?.status === 400) {
        errorTitle = "📝 Validation Error";
        errorDescription =
          err.response?.data?.message ||
          "Please check your input and try again.";
      } else if (err.response?.status === 409) {
        errorTitle = "⚠️ Already Registered";
        errorDescription = "This member is already registered for this event.";
      } else if (err.response?.status === 404) {
        errorTitle = "🔍 Event Not Found";
        errorDescription =
          "The event you're trying to register for doesn't exist or has been deleted.";
      } else if (err.response?.status >= 500) {
        errorTitle = "🔧 Server Error";
        errorDescription =
          "There's a problem with the server. Please try again later or contact support.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    status: string
  ) => {
    try {
      await apiClient.updateRegistrationStatus(eventId, registrationId, status);

      toast({
        title: "Success",
        description: "Registration status updated successfully",
      });

      await fetchData(); // Refresh the data
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      REGISTERED: "bg-blue-100 text-blue-800",
      ATTENDED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.REGISTERED;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ATTENDED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "NO_SHOW":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Users className="h-4 w-4 text-blue-600" />;
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.member.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.member.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.member.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || registration.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading registrations...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Event not found</p>
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
              <Link href={`/events/${eventId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Event Registrations
              </h1>
              <p className="text-gray-600">{event.title}</p>
            </div>
          </div>

          <Button
            onClick={() => setShowAddForm(true)}
            disabled={event.status !== "PUBLISHED"}
            title={
              event.status !== "PUBLISHED"
                ? "Event must be published to allow registrations"
                : ""
            }
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Registration
          </Button>
        </div>

        {/* Event Status Alert */}
        {event.status !== "PUBLISHED" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">
                  ⚠️ Event Not Available for Registration
                </div>
                <div>
                  <strong>Current Status:</strong> {event.status}
                </div>
                <div>
                  <strong>Required Status:</strong> PUBLISHED
                </div>
                <div className="text-sm">
                  This event needs to be published before members can register.
                  Only published events accept registrations.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {event.registrationDeadline &&
          new Date() > new Date(event.registrationDeadline) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    ⏰ Registration Deadline Passed
                  </div>
                  <div>
                    <strong>Deadline:</strong>{" "}
                    {format(new Date(event.registrationDeadline), "PPP 'at' p")}
                  </div>
                  <div className="text-sm">
                    The registration deadline for this event has passed.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Event Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Registrations
                  </p>
                  <p className="text-sm text-gray-600">
                    {registrations.length}
                    {event.capacity && ` / ${event.capacity}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Attended</p>
                  <p className="text-sm text-gray-600">
                    {
                      registrations.filter((r) => r.status === "ATTENDED")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Registration Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Registration</CardTitle>
              <CardDescription>
                Register a member for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRegistration} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberId">Member *</Label>
                    <Select
                      value={newRegistration.memberId}
                      onValueChange={(value) =>
                        setNewRegistration((prev) => ({
                          ...prev,
                          memberId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} -{" "}
                            {member.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newRegistration.notes}
                      onChange={(e) =>
                        setNewRegistration((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergencyName"
                      value={newRegistration.emergencyContact.name}
                      onChange={(e) =>
                        setNewRegistration((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            name: e.target.value,
                          },
                        }))
                      }
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      value={newRegistration.emergencyContact.phone}
                      onChange={(e) =>
                        setNewRegistration((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            phone: e.target.value,
                          },
                        }))
                      }
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dietary">Dietary Restrictions</Label>
                    <Input
                      id="dietary"
                      value={newRegistration.dietaryRestrictions}
                      onChange={(e) =>
                        setNewRegistration((prev) => ({
                          ...prev,
                          dietaryRestrictions: e.target.value,
                        }))
                      }
                      placeholder="Any dietary restrictions"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special">Special Requirements</Label>
                    <Input
                      id="special"
                      value={newRegistration.specialRequirements}
                      onChange={(e) =>
                        setNewRegistration((prev) => ({
                          ...prev,
                          specialRequirements: e.target.value,
                        }))
                      }
                      placeholder="Any special requirements"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Registration
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Debug Information */}
                {debugInfo && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                        🔍 Click to view debug information
                      </summary>
                      <div className="mt-3 p-3 bg-white border border-red-200 rounded text-xs font-mono">
                        <div className="space-y-2">
                          <div>
                            <strong>Error:</strong> {debugInfo.error}
                          </div>
                          <div>
                            <strong>Error Name:</strong> {debugInfo.errorName}
                          </div>
                          <div>
                            <strong>Status:</strong> {debugInfo.status}{" "}
                            {debugInfo.statusText}
                          </div>
                          <div>
                            <strong>URL:</strong> {debugInfo.url}
                          </div>
                          <div>
                            <strong>Method:</strong> {debugInfo.method}
                          </div>
                          <div>
                            <strong>Timestamp:</strong> {debugInfo.timestamp}
                          </div>
                          <div>
                            <strong>Event ID:</strong> {debugInfo.eventId}
                          </div>

                          {debugInfo.registrationData && (
                            <div>
                              <strong>Registration Data:</strong>
                              <pre className="mt-1 p-2 bg-gray-50 border rounded overflow-auto max-h-40">
                                {JSON.stringify(
                                  debugInfo.registrationData,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}

                          {debugInfo.responseData && (
                            <div>
                              <strong>Server Response:</strong>
                              <pre className="mt-1 p-2 bg-gray-50 border rounded overflow-auto max-h-40">
                                {JSON.stringify(
                                  debugInfo.responseData,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}

                          {debugInfo.headers && (
                            <div>
                              <strong>Request Headers:</strong>
                              <pre className="mt-1 p-2 bg-gray-50 border rounded overflow-auto max-h-40">
                                {JSON.stringify(debugInfo.headers, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="REGISTERED">Registered</SelectItem>
                  <SelectItem value="ATTENDED">Attended</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registrations List */}
        <div className="space-y-4">
          {filteredRegistrations.length > 0 ? (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(registration.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {registration.member.firstName}{" "}
                            {registration.member.lastName}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{registration.member.phone}</span>
                            </div>
                            {registration.member.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>{registration.member.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(registration.status)}>
                        {registration.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500">
                        Registered{" "}
                        {format(
                          new Date(registration.registeredAt),
                          "MMM d, yyyy"
                        )}
                      </div>
                      <Select
                        value={registration.status}
                        onValueChange={(value) =>
                          updateRegistrationStatus(registration.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REGISTERED">Registered</SelectItem>
                          <SelectItem value="ATTENDED">Attended</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="NO_SHOW">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(registration.notes ||
                    registration.emergencyContact?.name ||
                    registration.dietaryRestrictions ||
                    registration.specialRequirements) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {registration.notes && (
                          <div>
                            <span className="font-medium text-gray-900">
                              Notes:
                            </span>
                            <p className="text-gray-600">
                              {registration.notes}
                            </p>
                          </div>
                        )}
                        {registration.emergencyContact?.name && (
                          <div>
                            <span className="font-medium text-gray-900">
                              Emergency Contact:
                            </span>
                            <p className="text-gray-600">
                              {registration.emergencyContact.name} -{" "}
                              {registration.emergencyContact.phone}
                            </p>
                          </div>
                        )}
                        {registration.dietaryRestrictions && (
                          <div>
                            <span className="font-medium text-gray-900">
                              Dietary Restrictions:
                            </span>
                            <p className="text-gray-600">
                              {registration.dietaryRestrictions}
                            </p>
                          </div>
                        )}
                        {registration.specialRequirements && (
                          <div>
                            <span className="font-medium text-gray-900">
                              Special Requirements:
                            </span>
                            <p className="text-gray-600">
                              {registration.specialRequirements}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No registrations found
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No registrations match your search criteria"
                    : "No one has registered for this event yet"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Registration
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
