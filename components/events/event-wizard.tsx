"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CreateEventRequest } from "@/types";
import { Plus, Trash2, Calendar, Users } from "lucide-react";

interface EventWizardProps {
  step: number;
  data: CreateEventRequest;
  onUpdate: (updates: Partial<CreateEventRequest>) => void;
}

export function EventWizard({ step, data, onUpdate }: EventWizardProps) {
  const handleResourceAdd = () => {
    onUpdate({
      resources: [
        ...(data.resources || []),
        {
          resource: "",
          startTime: "",
          endTime: "",
          notes: "",
        },
      ],
    });
  };

  const handleResourceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newResources =
      data.resources?.map((resource, i) =>
        i === index ? { ...resource, [field]: value } : resource
      ) || [];
    onUpdate({ resources: newResources });
  };

  const handleResourceRemove = (index: number) => {
    onUpdate({
      resources: data.resources?.filter((_, i) => i !== index) || [],
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Event Title
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="title" className="text-base sm:text-lg font-medium">
              What is the event name?
            </Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Sunday Morning Service"
              className="h-10 sm:h-11 text-base w-full"
              autoFocus
            />
          </div>
        );

      case 1: // Description
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="description" className="text-base sm:text-lg font-medium">
              Add a description (optional)
            </Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Tell people what this event is about..."
              rows={4}
              className="resize-none text-base w-full"
            />
          </div>
        );

      case 2: // Event Type
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="type" className="text-base sm:text-lg font-medium">
              What type of event is this?
            </Label>
            <Select
              value={data.type}
              onValueChange={(value) => onUpdate({ type: value as Event['type'] })}
            >
              <SelectTrigger className="h-10 sm:h-11 text-base w-full">
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
          </div>
        );

      case 3: // Location
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="location" className="text-base sm:text-lg font-medium">
              Where will it take place?
            </Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="e.g., Main Sanctuary"
              className="h-10 sm:h-11 text-base w-full"
            />
          </div>
        );

      case 4: // Start Date & Time
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="startDate" className="text-base sm:text-lg font-medium">
              When does it start?
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={data.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
              className="h-10 sm:h-11 text-base w-full"
            />
          </div>
        );

      case 5: // End Date & Time
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="endDate" className="text-base sm:text-lg font-medium">
              When does it end?
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={data.endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              className="h-10 sm:h-11 text-base w-full"
            />
          </div>
        );

      case 6: // Registration Settings
        return (
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="flex items-center space-x-2">
              <Switch
                id="registrationRequired"
                checked={data.registrationRequired}
                onCheckedChange={(checked) =>
                  onUpdate({ registrationRequired: checked })
                }
              />
              <Label htmlFor="registrationRequired" className="text-sm sm:text-base">
                Registration Required
              </Label>
            </div>

            {data.registrationRequired && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-sm sm:text-base font-medium">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={data.capacity || ""}
                    onChange={(e) =>
                      onUpdate({
                        capacity: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Maximum number of attendees"
                    className="h-9 sm:h-10 w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="registrationDeadline" className="text-sm sm:text-base font-medium">
                    Registration Deadline
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={data.registrationDeadline || ""}
                    onChange={(e) =>
                      onUpdate({ registrationDeadline: e.target.value })
                    }
                    className="h-9 sm:h-10 w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowWaitlist"
                    checked={data.allowWaitlist}
                    onCheckedChange={(checked) =>
                      onUpdate({ allowWaitlist: checked })
                    }
                  />
                  <Label htmlFor="allowWaitlist" className="text-sm sm:text-base">
                    Allow Waitlist
                  </Label>
                </div>

                {data.allowWaitlist && (
                  <div className="space-y-1.5">
                    <Label htmlFor="maxWaitlist" className="text-sm sm:text-base font-medium">
                      Max Waitlist Size
                    </Label>
                    <Input
                      id="maxWaitlist"
                      type="number"
                      value={data.maxWaitlist || ""}
                      onChange={(e) =>
                        onUpdate({
                          maxWaitlist: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Maximum waitlist size"
                      className="h-9 sm:h-10 w-full"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 7: // Recurring Events
        return (
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={data.isRecurring}
                onCheckedChange={(checked) => onUpdate({ isRecurring: checked })}
              />
              <Label htmlFor="isRecurring" className="text-sm sm:text-base">
                This is a recurring event
              </Label>
            </div>

            {data.isRecurring && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div className="space-y-1.5">
                  <Label htmlFor="recurrencePattern" className="text-sm sm:text-base font-medium">
                    Recurrence Pattern
                  </Label>
                  <Select
                    value={data.recurrencePattern || ""}
                    onValueChange={(value) =>
                      onUpdate({ recurrencePattern: value as Event['recurrencePattern'] })
                    }
                  >
                    <SelectTrigger className="h-9 sm:h-10 w-full">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recurrenceEndDate" className="text-sm sm:text-base font-medium">
                    End Date
                  </Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={data.recurrenceEndDate || ""}
                    onChange={(e) =>
                      onUpdate({ recurrenceEndDate: e.target.value })
                    }
                    className="h-9 sm:h-10 w-full"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 8: // Resources
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Add equipment, rooms, or other resources needed for this event (optional)
            </div>

            {data.resources?.map((resource, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Resource {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResourceRemove(index)}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`resource-${index}`} className="text-xs sm:text-sm">
                      Resource Name
                    </Label>
                    <Input
                      id={`resource-${index}`}
                      value={resource.resource}
                      onChange={(e) =>
                        handleResourceChange(index, "resource", e.target.value)
                      }
                      placeholder="e.g., Sound System"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`notes-${index}`} className="text-xs sm:text-sm">
                      Notes
                    </Label>
                    <Input
                      id={`notes-${index}`}
                      value={resource.notes || ""}
                      onChange={(e) =>
                        handleResourceChange(index, "notes", e.target.value)
                      }
                      placeholder="Additional details"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`startTime-${index}`} className="text-xs sm:text-sm">
                      Start Time
                    </Label>
                    <Input
                      id={`startTime-${index}`}
                      type="datetime-local"
                      value={resource.startTime}
                      onChange={(e) =>
                        handleResourceChange(index, "startTime", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`endTime-${index}`} className="text-xs sm:text-sm">
                      End Time
                    </Label>
                    <Input
                      id={`endTime-${index}`}
                      type="datetime-local"
                      value={resource.endTime}
                      onChange={(e) =>
                        handleResourceChange(index, "endTime", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleResourceAdd}
              className="w-full h-9"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        );

      case 9: // Review & Confirm
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-base sm:text-lg">Event Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Title:</span>
                  <span className="font-medium text-right">{data.title}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-right">{data.type}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium text-right">{data.location}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-medium text-right">{data.status}</span>
                </div>
                {data.startDate && data.endDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium text-right">
                      {Math.round(
                        (new Date(data.endDate).getTime() -
                          new Date(data.startDate).getTime()) /
                          (1000 * 60 * 60)
                      )}{" "}
                      hours
                    </span>
                  </div>
                )}
                {data.capacity && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                    <span className="font-medium text-right">{data.capacity} people</span>
                  </div>
                )}
                {data.isRecurring && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Recurring:</span>
                    <span className="font-medium text-right">{data.recurrencePattern}</span>
                  </div>
                )}
              </div>
            </div>

            {data.description && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {data.description}
                </p>
              </div>
            )}

            {data.resources && data.resources.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Resources</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {data.resources.length} resource(s) added
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}

