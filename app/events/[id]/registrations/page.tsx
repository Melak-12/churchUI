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
        title: "Validation Error",
        description: "Please select a member",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.registerForEvent(eventId, {
        eventId,
        memberId: newRegistration.memberId,
        notes: newRegistration.notes,
        emergencyContact: newRegistration.emergencyContact.name
          ? newRegistration.emergencyContact
          : undefined,
        dietaryRestrictions: newRegistration.dietaryRestrictions || undefined,
        specialRequirements: newRegistration.specialRequirements || undefined,
      });

      toast({
        title: "Success",
        description: "Registration added successfully",
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
      toast({
        title: "Error",
        description: err.message || "Failed to add registration",
        variant: "destructive",
      });
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

          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Registration
          </Button>
        </div>

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
                  <Button type="submit">Add Registration</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
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
