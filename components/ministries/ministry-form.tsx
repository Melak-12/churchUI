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
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Ministry, CreateMinistryRequest, Member } from "@/types";
import apiClient from "@/lib/api";

const ministrySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  category: z.enum([
    "WORSHIP",
    "CHILDREN",
    "YOUTH",
    "ADULTS",
    "SENIORS",
    "OUTREACH",
    "ADMINISTRATION",
    "OTHER",
  ]),
  leader: z.string().min(1, "Leader is required"),
  coLeaders: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  meetingSchedule: z
    .object({
      frequency: z
        .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "AS_NEEDED"])
        .optional(),
      dayOfWeek: z.number().min(0).max(6).optional(),
      time: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
        .optional(),
      location: z
        .string()
        .max(200, "Location cannot exceed 200 characters")
        .optional(),
      notes: z
        .string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional(),
    })
    .optional(),
  goals: z
    .array(z.string().max(200, "Goal cannot exceed 200 characters"))
    .optional(),
  budget: z
    .object({
      allocated: z.number().min(0, "Budget cannot be negative").optional(),
      currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).optional(),
    })
    .optional(),
});

type MinistryFormData = z.infer<typeof ministrySchema>;

interface MinistryFormProps {
  initialData?: Ministry;
  onSubmit: (data: CreateMinistryRequest) => void;
  onCancel: () => void;
}

export function MinistryForm({
  initialData,
  onSubmit,
  onCancel,
}: MinistryFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const form = useForm<MinistryFormData>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "OTHER",
      leader: initialData?.leader._id || "",
      coLeaders: initialData?.coLeaders?.map((cl) => cl._id) || [],
      members: initialData?.members?.map((m) => m._id) || [],
      meetingSchedule: {
        frequency: initialData?.meetingSchedule?.frequency || undefined,
        dayOfWeek: initialData?.meetingSchedule?.dayOfWeek || undefined,
        time: initialData?.meetingSchedule?.time || "",
        location: initialData?.meetingSchedule?.location || "",
        notes: initialData?.meetingSchedule?.notes || "",
      },
      goals: initialData?.goals || [],
      budget: {
        allocated: initialData?.budget?.allocated || 0,
        currency: initialData?.budget?.currency || "USD",
      },
    },
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await apiClient.getMembers();
        setMembers(response.members);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  const handleSubmit = async (data: MinistryFormData) => {
    setLoading(true);
    try {
      // Clean up the data
      const submitData: CreateMinistryRequest = {
        name: data.name,
        description: data.description,
        category: data.category,
        leader: data.leader,
        coLeaders: data.coLeaders?.filter(Boolean),
        members: data.members?.filter(Boolean),
        meetingSchedule: data.meetingSchedule?.frequency
          ? {
              frequency: data.meetingSchedule.frequency,
              dayOfWeek: data.meetingSchedule.dayOfWeek,
              time: data.meetingSchedule.time,
              location: data.meetingSchedule.location,
              notes: data.meetingSchedule.notes,
            }
          : undefined,
        goals: data.goals?.filter(Boolean),
        budget: data.budget?.allocated
          ? {
              allocated: data.budget.allocated,
              currency: data.budget.currency || "USD",
            }
          : undefined,
      };

      onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const currentGoals = form.getValues("goals") || [];
      form.setValue("goals", [...currentGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    const currentGoals = form.getValues("goals") || [];
    form.setValue(
      "goals",
      currentGoals.filter((_, i) => i !== index)
    );
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ministry Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ministry name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter ministry description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WORSHIP">Worship</SelectItem>
                        <SelectItem value="CHILDREN">Children</SelectItem>
                        <SelectItem value="YOUTH">Youth</SelectItem>
                        <SelectItem value="ADULTS">Adults</SelectItem>
                        <SelectItem value="SENIORS">Seniors</SelectItem>
                        <SelectItem value="OUTREACH">Outreach</SelectItem>
                        <SelectItem value="ADMINISTRATION">
                          Administration
                        </SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Leadership */}
          <Card>
            <CardHeader>
              <CardTitle>Leadership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="leader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leader *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leader" />
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
                name="coLeaders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Co-Leaders</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentCoLeaders = field.value || [];
                        if (!currentCoLeaders.includes(value)) {
                          field.onChange([...currentCoLeaders, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Add co-leader" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members
                          .filter(
                            (member) => member.id !== form.getValues("leader")
                          )
                          .map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((coLeaderId, index) => {
                          const member = members.find(
                            (m) => m.id === coLeaderId
                          );
                          return member ? (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {member.firstName} {member.lastName}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const newCoLeaders =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newCoLeaders);
                                }}
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Meeting Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="meetingSchedule.frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="AS_NEEDED">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingSchedule.dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {getDayName(day)}
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
                name="meetingSchedule.time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingSchedule.location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="meetingSchedule.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional meeting notes"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Goals and Budget */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGoal();
                    }
                  }}
                />
                <Button type="button" onClick={addGoal} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.watch("goals") && form.watch("goals")!.length > 0 && (
                <div className="space-y-2">
                  {form.watch("goals")!.map((goal, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {goal}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeGoal(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="budget.allocated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocated Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : initialData
              ? "Update Ministry"
              : "Create Ministry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
