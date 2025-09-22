"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateEventRequest, Resource } from "@/types";
import apiClient from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [eventData, setEventData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    type: "SERVICE",
    startDate: "",
    endDate: "",
    location: "",
    capacity: undefined,
    registrationRequired: false,
    registrationDeadline: "",
    allowWaitlist: false,
    maxWaitlist: undefined,
    isRecurring: false,
    recurrencePattern: undefined,
    recurrenceEndDate: "",
    resources: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof CreateEventRequest, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResourceAdd = () => {
    setEventData((prev) => ({
      ...prev,
      resources: [
        ...(prev.resources || []),
        {
          resource: "",
          startTime: "",
          endTime: "",
          notes: "",
        },
      ],
    }));
  };

  const handleResourceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setEventData((prev) => ({
      ...prev,
      resources:
        prev.resources?.map((resource, i) =>
          i === index ? { ...resource, [field]: value } : resource
        ) || [],
    }));
  };

  const handleResourceRemove = (index: number) => {
    setEventData((prev) => ({
      ...prev,
      resources: prev.resources?.filter((_, i) => i !== index) || [],
    }));
  };

  const fillWithSampleData = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM tomorrow

    const endTime = new Date(tomorrow);
    endTime.setHours(12, 0, 0, 0); // 12:00 PM tomorrow

    const registrationDeadline = new Date(tomorrow);
    registrationDeadline.setDate(registrationDeadline.getDate() - 1);
    registrationDeadline.setHours(18, 0, 0, 0); // 6:00 PM today

    setEventData({
      title: "Sunday Morning Service",
      description:
        "Join us for our weekly Sunday morning worship service. We'll have inspiring music, meaningful fellowship, and a powerful message from our pastor. All are welcome!",
      type: "SERVICE",
      startDate: tomorrow.toISOString().slice(0, 16), // Format for datetime-local input
      endDate: endTime.toISOString().slice(0, 16),
      location: "Main Sanctuary",
      capacity: 150,
      registrationRequired: true,
      registrationDeadline: registrationDeadline.toISOString().slice(0, 16),
      allowWaitlist: true,
      maxWaitlist: 25,
      isRecurring: true,
      recurrencePattern: "WEEKLY",
      recurrenceEndDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10), // 3 months from now
      resources: [], // Temporarily remove resources to avoid validation error
    });

    toast({
      title: "Sample Data Loaded",
      description: "Form has been filled with sample church service data",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !eventData.title ||
      !eventData.startDate ||
      !eventData.endDate ||
      !eventData.location
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    // Validate recurring event requirements
    if (eventData.isRecurring && !eventData.recurrenceEndDate) {
      toast({
        title: "Validation Error",
        description: "Recurrence end date is required for recurring events",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      fron; // Prepare event data with proper resource formatting
      const eventDataToSend = {
        ...eventData,
        resources: eventData.resources || [], // Include resources if they exist
        // Fix recurrence end date validation - send undefined instead of empty string
        recurrenceEndDate: eventData.recurrenceEndDate || undefined,
      };

      await apiClient.createEvent(eventDataToSend);

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      router.push("/events");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/events'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Create New Event
            </h1>
            <p className='text-gray-600'>
              Add a new church event, service, or meeting
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Event Details */}
            <div className='lg:col-span-2 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>
                    Basic information about the event
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Event Title *</Label>
                    <Input
                      id='title'
                      value={eventData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder='Enter event title'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      value={eventData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder='Enter event description'
                      rows={3}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='type'>Event Type *</Label>
                      <Select
                        value={eventData.type}
                        onValueChange={(value) =>
                          handleInputChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='SERVICE'>Service</SelectItem>
                          <SelectItem value='MEETING'>Meeting</SelectItem>
                          <SelectItem value='SPECIAL_OCCASION'>
                            Special Occasion
                          </SelectItem>
                          <SelectItem value='CONFERENCE'>Conference</SelectItem>
                          <SelectItem value='SOCIAL'>Social</SelectItem>
                          <SelectItem value='OTHER'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='location'>Location *</Label>
                      <Input
                        id='location'
                        value={eventData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder='Enter location'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='startDate'>Start Date & Time *</Label>
                      <Input
                        id='startDate'
                        type='datetime-local'
                        value={eventData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='endDate'>End Date & Time *</Label>
                      <Input
                        id='endDate'
                        type='datetime-local'
                        value={eventData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration Settings</CardTitle>
                  <CardDescription>
                    Configure event registration and capacity
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='registrationRequired'
                      checked={eventData.registrationRequired}
                      onCheckedChange={(checked) =>
                        handleInputChange("registrationRequired", checked)
                      }
                    />
                    <Label htmlFor='registrationRequired'>
                      Registration Required
                    </Label>
                  </div>

                  {eventData.registrationRequired && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='capacity'>Capacity</Label>
                        <Input
                          id='capacity'
                          type='number'
                          value={eventData.capacity || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "capacity",
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          placeholder='Maximum number of attendees'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='registrationDeadline'>
                          Registration Deadline
                        </Label>
                        <Input
                          id='registrationDeadline'
                          type='datetime-local'
                          value={eventData.registrationDeadline || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "registrationDeadline",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Switch
                          id='allowWaitlist'
                          checked={eventData.allowWaitlist}
                          onCheckedChange={(checked) =>
                            handleInputChange("allowWaitlist", checked)
                          }
                        />
                        <Label htmlFor='allowWaitlist'>Allow Waitlist</Label>
                      </div>

                      {eventData.allowWaitlist && (
                        <div className='space-y-2'>
                          <Label htmlFor='maxWaitlist'>Max Waitlist Size</Label>
                          <Input
                            id='maxWaitlist'
                            type='number'
                            value={eventData.maxWaitlist || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "maxWaitlist",
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            placeholder='Maximum waitlist size'
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recurring Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Events</CardTitle>
                  <CardDescription>Set up recurring events</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='isRecurring'
                      checked={eventData.isRecurring}
                      onCheckedChange={(checked) =>
                        handleInputChange("isRecurring", checked)
                      }
                    />
                    <Label htmlFor='isRecurring'>
                      This is a recurring event
                    </Label>
                  </div>

                  {eventData.isRecurring && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='recurrencePattern'>
                          Recurrence Pattern
                        </Label>
                        <Select
                          value={eventData.recurrencePattern || ""}
                          onValueChange={(value) =>
                            handleInputChange("recurrencePattern", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select pattern' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='DAILY'>Daily</SelectItem>
                            <SelectItem value='WEEKLY'>Weekly</SelectItem>
                            <SelectItem value='MONTHLY'>Monthly</SelectItem>
                            <SelectItem value='YEARLY'>Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='recurrenceEndDate'>End Date</Label>
                        <Input
                          id='recurrenceEndDate'
                          type='date'
                          value={eventData.recurrenceEndDate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "recurrenceEndDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resources Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Add equipment, rooms, or other resources needed for this
                    event
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {eventData.resources?.map((resource, index) => (
                    <div
                      key={index}
                      className='p-4 border rounded-lg space-y-4'
                    >
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>Resource {index + 1}</h4>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleResourceRemove(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor={`resource-${index}`}>
                            Resource Name
                          </Label>
                          <Input
                            id={`resource-${index}`}
                            value={resource.resource}
                            onChange={(e) =>
                              handleResourceChange(
                                index,
                                "resource",
                                e.target.value
                              )
                            }
                            placeholder='e.g., Sound System, Projector'
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor={`notes-${index}`}>Notes</Label>
                          <Input
                            id={`notes-${index}`}
                            value={resource.notes || ""}
                            onChange={(e) =>
                              handleResourceChange(
                                index,
                                "notes",
                                e.target.value
                              )
                            }
                            placeholder='Additional details'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor={`startTime-${index}`}>
                            Start Time
                          </Label>
                          <Input
                            id={`startTime-${index}`}
                            type='datetime-local'
                            value={resource.startTime}
                            onChange={(e) =>
                              handleResourceChange(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor={`endTime-${index}`}>End Time</Label>
                          <Input
                            id={`endTime-${index}`}
                            type='datetime-local'
                            value={resource.endTime}
                            onChange={(e) =>
                              handleResourceChange(
                                index,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleResourceAdd}
                    className='w-full'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Resource
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Button type='submit' className='w-full' disabled={loading}>
                    {loading ? "Creating..." : "Create Event"}
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={fillWithSampleData}
                  >
                    <FileText className='h-4 w-4 mr-2' />
                    Fill with Sample Data
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    asChild
                  >
                    <Link href='/events'>Cancel</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm text-gray-600'>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      Duration:{" "}
                      {eventData.startDate && eventData.endDate
                        ? Math.round(
                            (new Date(eventData.endDate).getTime() -
                              new Date(eventData.startDate).getTime()) /
                              (1000 * 60 * 60)
                          ) + " hours"
                        : "Not set"}
                    </span>
                  </div>
                  {eventData.capacity && (
                    <div className='flex items-center space-x-2'>
                      <Users className='h-4 w-4' />
                      <span>Capacity: {eventData.capacity} people</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
