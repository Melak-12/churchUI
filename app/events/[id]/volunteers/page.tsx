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
import { Event, Volunteer, Member } from "@/types";
import apiClient from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EventVolunteersPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    memberId: "",
    role: "",
    notes: "",
    shiftStart: "",
    shiftEnd: "",
  });

  useEffect(() => {
    if (eventId && eventId !== "undefined") {
      fetchData();
    }
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventData, volunteersData] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.getEventVolunteers(eventId),
      ]);

      setEvent(eventData);
      setVolunteers(volunteersData);

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
        setMembers([]);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVolunteer.memberId || !newVolunteer.role) {
      toast({
        title: "Validation Error",
        description: "Please select a member and enter a role",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.assignVolunteer(eventId, {
        eventId,
        memberId: newVolunteer.memberId,
        role: newVolunteer.role,
        notes: newVolunteer.notes || undefined,
        shiftStart: newVolunteer.shiftStart || undefined,
        shiftEnd: newVolunteer.shiftEnd || undefined,
      });

      toast({
        title: "Success",
        description: "Volunteer assigned successfully",
      });

      setNewVolunteer({
        memberId: "",
        role: "",
        notes: "",
        shiftStart: "",
        shiftEnd: "",
      });
      setShowAddForm(false);
      await fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to assign volunteer",
        variant: "destructive",
      });
    }
  };

  const updateVolunteerStatus = async (volunteerId: string, status: string) => {
    try {
      await apiClient.updateVolunteerStatus(eventId, volunteerId, status);

      toast({
        title: "Success",
        description: "Volunteer status updated successfully",
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

  const removeVolunteer = async (volunteerId: string) => {
    if (!confirm("Are you sure you want to remove this volunteer?")) {
      return;
    }

    try {
      await apiClient.removeVolunteer(eventId, volunteerId);

      toast({
        title: "Success",
        description: "Volunteer removed successfully",
      });

      await fetchData(); // Refresh the data
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove volunteer",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ASSIGNED: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || colors.ASSIGNED;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.member.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      volunteer.member.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      volunteer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.member.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || volunteer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading volunteers...</span>
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
                Event Volunteers
              </h1>
              <p className="text-gray-600">{event.title}</p>
            </div>
          </div>

          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Volunteer
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
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Volunteers
                  </p>
                  <p className="text-sm text-gray-600">{volunteers.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Confirmed</p>
                  <p className="text-sm text-gray-600">
                    {volunteers.filter((v) => v.status === "CONFIRMED").length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Volunteer Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Assign New Volunteer</CardTitle>
              <CardDescription>
                Assign a member as a volunteer for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVolunteer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberId">Member *</Label>
                    <Select
                      value={newVolunteer.memberId}
                      onValueChange={(value) =>
                        setNewVolunteer((prev) => ({
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
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={newVolunteer.role}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      placeholder="e.g., Usher, Greeter, Sound Tech"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shiftStart">Shift Start Time</Label>
                    <Input
                      id="shiftStart"
                      type="datetime-local"
                      value={newVolunteer.shiftStart}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          shiftStart: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shiftEnd">Shift End Time</Label>
                    <Input
                      id="shiftEnd"
                      type="datetime-local"
                      value={newVolunteer.shiftEnd}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          shiftEnd: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newVolunteer.notes}
                    onChange={(e) =>
                      setNewVolunteer((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes or instructions"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">Assign Volunteer</Button>
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
                    placeholder="Search volunteers..."
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
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Volunteers List */}
        <div className="space-y-4">
          {filteredVolunteers.length > 0 ? (
            filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(volunteer.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {volunteer.member.firstName}{" "}
                            {volunteer.member.lastName}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">
                                {volunteer.role}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{volunteer.member.phone}</span>
                            </div>
                            {volunteer.member.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>{volunteer.member.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(volunteer.status)}>
                        {volunteer.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500">
                        Assigned{" "}
                        {format(new Date(volunteer.assignedAt), "MMM d, yyyy")}
                      </div>
                      <Select
                        value={volunteer.status}
                        onValueChange={(value) =>
                          updateVolunteerStatus(volunteer.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeVolunteer(volunteer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(volunteer.notes ||
                    volunteer.shiftStart ||
                    volunteer.shiftEnd) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {volunteer.notes && (
                          <div>
                            <span className="font-medium text-gray-900">
                              Notes:
                            </span>
                            <p className="text-gray-600">{volunteer.notes}</p>
                          </div>
                        )}
                        {(volunteer.shiftStart || volunteer.shiftEnd) && (
                          <div>
                            <span className="font-medium text-gray-900">
                              Shift:
                            </span>
                            <p className="text-gray-600">
                              {volunteer.shiftStart && volunteer.shiftEnd
                                ? `${format(
                                    new Date(volunteer.shiftStart),
                                    "MMM d, h:mm a"
                                  )} - ${format(
                                    new Date(volunteer.shiftEnd),
                                    "h:mm a"
                                  )}`
                                : volunteer.shiftStart
                                ? `From ${format(
                                    new Date(volunteer.shiftStart),
                                    "MMM d, h:mm a"
                                  )}`
                                : volunteer.shiftEnd
                                ? `Until ${format(
                                    new Date(volunteer.shiftEnd),
                                    "h:mm a"
                                  )}`
                                : "No shift times specified"}
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
                  No volunteers found
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No volunteers match your search criteria"
                    : "No volunteers have been assigned to this event yet"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign First Volunteer
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
