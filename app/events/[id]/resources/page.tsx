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
import { Event, Resource } from "@/types";
import apiClient from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Search,
  Settings,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EventResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [eventResources, setEventResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    resourceId: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  useEffect(() => {
    if (eventId && eventId !== "undefined") {
      fetchData();
    }
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventData, resourcesData] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.getResources(), // Get all available resources
      ]);

      setEvent(eventData);
      setResources(resourcesData);

      // Populate event resources with full resource data
      if (eventData.resources && eventData.resources.length > 0) {
        const populatedResources = eventData.resources.map(
          (eventResource: any) => {
            const fullResource = resourcesData.find(
              (r: any) => r.id === eventResource.resource
            );
            return {
              ...eventResource,
              resource: fullResource || {
                id: eventResource.resource,
                name: "Unknown Resource",
              },
            };
          }
        );
        setEventResources(populatedResources);
      } else {
        setEventResources([]);
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

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newResource.resourceId ||
      !newResource.startTime ||
      !newResource.endTime
    ) {
      toast({
        title: "Validation Error",
        description: "Please select a resource and enter start/end times",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.assignResourceToEvent(eventId, {
        resourceId: newResource.resourceId,
        startTime: newResource.startTime || undefined,
        endTime: newResource.endTime || undefined,
        notes: newResource.notes || undefined,
      });

      toast({
        title: "Success",
        description: "Resource assigned successfully",
      });

      setNewResource({
        resourceId: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
      setShowAddForm(false);
      await fetchData(); // Refresh the data
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to assign resource",
        variant: "destructive",
      });
    }
  };

  const removeResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to remove this resource?")) {
      return;
    }

    try {
      await apiClient.removeResourceFromEvent(eventId, resourceId);

      toast({
        title: "Success",
        description: "Resource removed successfully",
      });

      await fetchData(); // Refresh the data
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove resource",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ROOM: "bg-blue-100 text-blue-800",
      EQUIPMENT: "bg-green-100 text-green-800",
      VEHICLE: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || resource.type === typeFilter;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading resources...</span>
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
                Event Resources
              </h1>
              <p className="text-gray-600">{event.title}</p>
            </div>
          </div>

          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Resource
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
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Resources</p>
                  <p className="text-sm text-gray-600">
                    {eventResources.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Resource Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Resource to Event</CardTitle>
              <CardDescription>
                Assign a resource to this event with specific timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddResource} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resourceId">Resource *</Label>
                  <Select
                    value={newResource.resourceId}
                    onValueChange={(value) =>
                      setNewResource((prev) => ({ ...prev, resourceId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type}) -{" "}
                          {resource.location || "No location"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newResource.startTime}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={newResource.endTime}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newResource.notes}
                    onChange={(e) =>
                      setNewResource((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes or instructions"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">Assign Resource</Button>
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

        {/* Assigned Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Resources</CardTitle>
            <CardDescription>
              Resources currently assigned to this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventResources.length > 0 ? (
              <div className="space-y-4">
                {eventResources.map((eventResource, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {eventResource.resource.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <Badge
                              className={getTypeColor(
                                eventResource.resource.type
                              )}
                            >
                              {eventResource.resource.type}
                            </Badge>
                            {eventResource.resource.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{eventResource.resource.location}</span>
                              </div>
                            )}
                            {eventResource.resource.capacity && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  Capacity: {eventResource.resource.capacity}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">
                          {format(
                            new Date(eventResource.startTime),
                            "MMM d, h:mm a"
                          )}{" "}
                          - {format(new Date(eventResource.endTime), "h:mm a")}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeResource(
                              eventResource.resource.id ||
                                eventResource.resource
                            )
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {eventResource.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-900">
                          Notes:
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {eventResource.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No resources assigned
                </h3>
                <p className="text-gray-500 mb-4">
                  Assign rooms, equipment, or other resources to this event
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First Resource
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Available Resources</CardTitle>
            <CardDescription>
              All available resources that can be assigned to events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search resources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    <SelectItem value="VEHICLE">Vehicle</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {resource.name}
                    </h4>
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </div>

                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {resource.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-gray-500">
                    {resource.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{resource.location}</span>
                      </div>
                    )}
                    {resource.capacity && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Capacity: {resource.capacity}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setNewResource((prev) => ({
                          ...prev,
                          resourceId: resource.id,
                          startTime: event.startDate.slice(0, 16),
                          endTime: event.endDate.slice(0, 16),
                        }));
                        setShowAddForm(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign to Event
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No resources found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || typeFilter !== "all"
                    ? "No resources match your search criteria"
                    : "No resources are available"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
