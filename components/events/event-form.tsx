"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateEventRequest } from "@/types";
import { Calendar, Clock, MapPin, Users, Plus, Trash2 } from "lucide-react";

const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Event title is required")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  type: z.enum([
    "SERVICE",
    "MEETING",
    "SPECIAL_OCCASION",
    "CONFERENCE",
    "SOCIAL",
    "OTHER",
  ]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location cannot exceed 200 characters"),
  capacity: z.number().min(0).optional(),
  registrationRequired: z.boolean(),
  registrationDeadline: z.string().optional(),
  allowWaitlist: z.boolean(),
  maxWaitlist: z.number().min(0).optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional(),
  recurrenceEndDate: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Partial<CreateEventRequest>;
  onSubmit: (data: CreateEventRequest) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function EventForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Create Event",
}: EventFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "SERVICE",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      location: initialData?.location || "",
      capacity: initialData?.capacity,
      registrationRequired: initialData?.registrationRequired || false,
      registrationDeadline: initialData?.registrationDeadline || "",
      allowWaitlist: initialData?.allowWaitlist || false,
      maxWaitlist: initialData?.maxWaitlist,
      isRecurring: initialData?.isRecurring || false,
      recurrencePattern: initialData?.recurrencePattern,
      recurrenceEndDate: initialData?.recurrenceEndDate || "",
    },
  });

  const registrationRequired = watch("registrationRequired");
  const allowWaitlist = watch("allowWaitlist");
  const isRecurring = watch("isRecurring");

  const onFormSubmit = (data: EventFormData) => {
    const eventData: CreateEventRequest = {
      ...data,
      capacity: data.capacity || undefined,
      registrationDeadline: data.registrationDeadline || undefined,
      maxWaitlist: data.maxWaitlist || undefined,
      recurrencePattern: data.recurrencePattern || undefined,
      recurrenceEndDate: data.recurrenceEndDate || undefined,
      resources: [],
      reminders: [],
    };
    onSubmit(eventData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
          <CardDescription>Basic details about the event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
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
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
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
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="registrationRequired"
              checked={registrationRequired}
              onCheckedChange={(checked) =>
                setValue("registrationRequired", checked)
              }
            />
            <Label htmlFor="registrationRequired">Registration Required</Label>
          </div>

          {registrationRequired && (
            <>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register("capacity", { valueAsNumber: true })}
                  placeholder="Maximum number of attendees"
                />
                {errors.capacity && (
                  <p className="text-sm text-red-600">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">
                  Registration Deadline
                </Label>
                <Input
                  id="registrationDeadline"
                  type="datetime-local"
                  {...register("registrationDeadline")}
                />
                {errors.registrationDeadline && (
                  <p className="text-sm text-red-600">
                    {errors.registrationDeadline.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowWaitlist"
                  checked={allowWaitlist}
                  onCheckedChange={(checked) =>
                    setValue("allowWaitlist", checked)
                  }
                />
                <Label htmlFor="allowWaitlist">Allow Waitlist</Label>
              </div>

              {allowWaitlist && (
                <div className="space-y-2">
                  <Label htmlFor="maxWaitlist">Max Waitlist Size</Label>
                  <Input
                    id="maxWaitlist"
                    type="number"
                    {...register("maxWaitlist", { valueAsNumber: true })}
                    placeholder="Maximum waitlist size"
                  />
                  {errors.maxWaitlist && (
                    <p className="text-sm text-red-600">
                      {errors.maxWaitlist.message}
                    </p>
                  )}
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
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setValue("isRecurring", checked)}
            />
            <Label htmlFor="isRecurring">This is a recurring event</Label>
          </div>

          {isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                <Select
                  value={watch("recurrencePattern") || ""}
                  onValueChange={(value) =>
                    setValue("recurrencePattern", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.recurrencePattern && (
                  <p className="text-sm text-red-600">
                    {errors.recurrencePattern.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrenceEndDate">End Date</Label>
                <Input
                  id="recurrenceEndDate"
                  type="date"
                  {...register("recurrenceEndDate")}
                />
                {errors.recurrenceEndDate && (
                  <p className="text-sm text-red-600">
                    {errors.recurrenceEndDate.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
