"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Attendance,
  CreateAttendanceRequest,
  Member,
  Event,
  Ministry,
  SmallGroup,
} from "@/types";
import apiClient from "@/lib/api";

const attendanceSchema = z.object({
  member: z.string().min(1, "Member is required"),
  event: z.string().optional(),
  service: z
    .object({
      date: z.string().min(1, "Service date is required"),
      type: z.enum([
        "SUNDAY_SERVICE",
        "WEDNESDAY_SERVICE",
        "SPECIAL_SERVICE",
        "OTHER",
      ]),
      time: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
        .optional(),
    })
    .optional(),
  ministry: z.string().optional(),
  smallGroup: z.string().optional(),
  checkInTime: z.string().optional(),
  method: z.enum(["MANUAL", "QR_CODE", "MOBILE_APP", "KIOSK"]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  initialData?: Attendance;
  onSubmit: (data: CreateAttendanceRequest) => void;
  onCancel: () => void;
}

export function AttendanceForm({
  initialData,
  onSubmit,
  onCancel,
}: AttendanceFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceType, setAttendanceType] = useState<
    "service" | "event" | "ministry" | "smallGroup"
  >("service");

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      member: initialData?.member._id || "",
      event: initialData?.event?._id || "",
      service: initialData?.service
        ? {
            date: initialData.service.date.split("T")[0],
            type: initialData.service.type,
            time: initialData.service.time || "",
          }
        : undefined,
      ministry: initialData?.ministry?._id || "",
      smallGroup: initialData?.smallGroup?._id || "",
      checkInTime: initialData?.checkInTime
        ? new Date(initialData.checkInTime).toISOString().slice(0, 16)
        : "",
      method: initialData?.method || "MANUAL",
      notes: initialData?.notes || "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          membersResponse,
          eventsResponse,
          ministriesResponse,
          smallGroupsResponse,
        ] = await Promise.all([
          apiClient.getMembers(),
          apiClient.getEvents(),
          apiClient.getMinistries(),
          apiClient.getSmallGroups(),
        ]);

        setMembers(membersResponse.members);
        setEvents(eventsResponse.events);
        setMinistries(ministriesResponse.ministries);
        setSmallGroups(smallGroupsResponse.smallGroups);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Determine attendance type based on initial data
  useEffect(() => {
    if (initialData) {
      if (initialData.service) setAttendanceType("service");
      else if (initialData.event) setAttendanceType("event");
      else if (initialData.ministry) setAttendanceType("ministry");
      else if (initialData.smallGroup) setAttendanceType("smallGroup");
    }
  }, [initialData]);

  const handleSubmit = async (data: AttendanceFormData) => {
    setLoading(true);
    try {
      // Clean up the data based on attendance type
      const submitData: CreateAttendanceRequest = {
        member: data.member,
        method: data.method,
        notes: data.notes,
        checkInTime: data.checkInTime || new Date().toISOString(),
      };

      // Add type-specific data
      if (attendanceType === "service" && data.service) {
        submitData.service = {
          date: data.service.date,
          type: data.service.type,
          time: data.service.time,
        };
      } else if (attendanceType === "event" && data.event) {
        submitData.event = data.event;
      } else if (attendanceType === "ministry" && data.ministry) {
        submitData.ministry = data.ministry;
      } else if (attendanceType === "smallGroup" && data.smallGroup) {
        submitData.smallGroup = data.smallGroup;
      }

      onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceTypeChange = (
    type: "service" | "event" | "ministry" | "smallGroup"
  ) => {
    setAttendanceType(type);
    // Clear type-specific fields when switching
    form.setValue("event", "");
    form.setValue("ministry", "");
    form.setValue("smallGroup", "");
    form.setValue("service", undefined);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Method *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="QR_CODE">QR Code</SelectItem>
                        <SelectItem value="MOBILE_APP">Mobile App</SelectItem>
                        <SelectItem value="KIOSK">Kiosk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkInTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use current time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Attendance Type */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={attendanceType}
                onValueChange={handleAttendanceTypeChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="service" />
                  <Label htmlFor="service">Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event" id="event" />
                  <Label htmlFor="event">Event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ministry" id="ministry" />
                  <Label htmlFor="ministry">Ministry Meeting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="smallGroup" id="smallGroup" />
                  <Label htmlFor="smallGroup">Small Group</Label>
                </div>
              </RadioGroup>

              {/* Service Details */}
              {attendanceType === "service" && (
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="service.date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SUNDAY_SERVICE">
                              Sunday Service
                            </SelectItem>
                            <SelectItem value="WEDNESDAY_SERVICE">
                              Wednesday Service
                            </SelectItem>
                            <SelectItem value="SPECIAL_SERVICE">
                              Special Service
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service.time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Event Details */}
              {attendanceType === "event" && (
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="event"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {events.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title} -{" "}
                                {new Date(event.startDate).toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Ministry Details */}
              {attendanceType === "ministry" && (
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="ministry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ministry *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ministry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ministries.map((ministry) => (
                              <SelectItem key={ministry.id} value={ministry.id}>
                                {ministry.name} -{" "}
                                {ministry.category.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Small Group Details */}
              {attendanceType === "smallGroup" && (
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="smallGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Small Group *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select small group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {smallGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                                {group.ministry && ` - ${group.ministry.name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Record" : "Check In"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
