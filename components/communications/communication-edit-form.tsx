"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getDocumentId } from "@/lib/utils";
import { format } from "date-fns";
import {
  Users,
  MessageSquare,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Search,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Communication, Member } from "@/types";

interface CommunicationEditFormProps {
  initialData: {
    name: string;
    audience: string;
    customAudience: string[];
    body: string;
    scheduledAt?: string;
  };
  onSave: (data: Partial<Communication>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface MemberStats {
  total: number;
  eligible: number;
  delinquent30: number;
  delinquent60: number;
  delinquent90: number;
}

const audienceOptions = [
  {
    value: "ALL" as const,
    label: "All Members",
    description: "Every member in the database",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "ELIGIBLE" as const,
    label: "Eligible Members",
    description: "Members who can vote",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "DELINQUENT_30" as const,
    label: "30 Days Delinquent",
    description: "Members 0-30 days overdue",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "DELINQUENT_60" as const,
    label: "60 Days Delinquent",
    description: "Members 31-60 days overdue",
    icon: Clock,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "DELINQUENT_90" as const,
    label: "90 Days Delinquent",
    description: "Members 61-90 days overdue",
    icon: AlertCircle,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "CUSTOM" as const,
    label: "Custom Selection",
    description: "Choose specific members",
    icon: User,
    color: "bg-purple-100 text-purple-800",
  },
];

export function CommunicationEditForm({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: CommunicationEditFormProps) {
  const [data, setData] = useState(initialData);
  const [memberStats, setMemberStats] = useState<MemberStats>({
    total: 0,
    eligible: 0,
    delinquent30: 0,
    delinquent60: 0,
    delinquent90: 0,
  });
  const [customMembers, setCustomMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch member stats
  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const stats = await apiClient.getMemberStats();
        setMemberStats({
          total: stats.total,
          eligible: stats.eligible,
          delinquent30: stats.delinquentBreakdown["0-30"],
          delinquent60: stats.delinquentBreakdown["31-60"],
          delinquent90: stats.delinquentBreakdown["61-90"],
        });
      } catch (error) {
        console.error("Error fetching member stats:", error);
      }
    };

    fetchMemberStats();
  }, []);

  // Fetch members for custom selection
  useEffect(() => {
    if (data.audience === "CUSTOM" && customMembers.length === 0) {
      const fetchMembers = async () => {
        try {
          const response = await apiClient.getMembers({ limit: 100 });
          setCustomMembers(response.members);
        } catch (error) {
          console.error("Error fetching members:", error);
        }
      };
      fetchMembers();
    }
  }, [data.audience, customMembers.length]);

  const updateData = (updates: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear errors when user makes changes
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      newErrors.name = "Campaign name is required";
    }

    if (!data.body.trim()) {
      newErrors.body = "Message body is required";
    }

    if (data.body.length > 1600) {
      newErrors.body = "Message body cannot exceed 1600 characters";
    }

    if (data.audience === "CUSTOM" && data.customAudience.length === 0) {
      newErrors.customAudience = "Please select at least one member";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const saveData: Partial<Communication> = {
      name: data.name,
      audience: data.audience as any,
      body: data.body,
      customAudience:
        data.audience === "CUSTOM" ? data.customAudience : undefined,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt).toISOString()
        : undefined,
    };

    onSave(saveData);
  };

  const getAudienceCount = () => {
    switch (data.audience) {
      case "ALL":
        return memberStats.total;
      case "ELIGIBLE":
        return memberStats.eligible;
      case "DELINQUENT_30":
        return memberStats.delinquent30;
      case "DELINQUENT_60":
        return memberStats.delinquent60;
      case "DELINQUENT_90":
        return memberStats.delinquent90;
      case "CUSTOM":
        return data.customAudience.length;
      default:
        return 0;
    }
  };

  const filteredMembers = customMembers.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const toggleMemberSelection = (memberId: string) => {
    const isSelected = data.customAudience.includes(memberId);
    if (isSelected) {
      updateData({
        customAudience: data.customAudience.filter((id) => id !== memberId),
      });
    } else {
      updateData({
        customAudience: [...data.customAudience, memberId],
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Campaign Details
          </CardTitle>
          <CardDescription>
            Update your SMS campaign information
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Campaign Name</Label>
            <Input
              id='name'
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder='Enter campaign name'
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className='text-sm text-red-600'>{errors.name}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='body'>Message Body</Label>
            <Textarea
              id='body'
              value={data.body}
              onChange={(e) => updateData({ body: e.target.value })}
              placeholder='Enter your message...'
              rows={4}
              className={errors.body ? "border-red-500" : ""}
            />
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Supports variables: {`{{firstName}}, {{lastName}}`}</span>
              <span className={data.body.length > 1600 ? "text-red-600" : ""}>
                {data.body.length}/1600 characters
              </span>
            </div>
            {errors.body && (
              <p className='text-sm text-red-600'>{errors.body}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audience Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Target Audience
          </CardTitle>
          <CardDescription>
            Choose who will receive this message
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <RadioGroup
            value={data.audience}
            onValueChange={(value) =>
              updateData({ audience: value, customAudience: [] })
            }
            className='space-y-3'
          >
            {audienceOptions.map((option) => {
              const Icon = option.icon;
              const count =
                option.value === "CUSTOM"
                  ? data.customAudience.length
                  : option.value === "ALL"
                  ? memberStats.total
                  : option.value === "ELIGIBLE"
                  ? memberStats.eligible
                  : option.value === "DELINQUENT_30"
                  ? memberStats.delinquent30
                  : option.value === "DELINQUENT_60"
                  ? memberStats.delinquent60
                  : option.value === "DELINQUENT_90"
                  ? memberStats.delinquent90
                  : 0;

              return (
                <div key={option.value} className='flex items-center space-x-3'>
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className='flex-1 cursor-pointer'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Icon className='h-5 w-5 text-gray-500' />
                        <div>
                          <div className='font-medium'>{option.label}</div>
                          <div className='text-sm text-gray-500'>
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <Badge variant='outline' className={option.color}>
                        {count} members
                      </Badge>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {/* Custom Member Selection */}
          {data.audience === "CUSTOM" && (
            <div className='space-y-4 border-t pt-4'>
              <div className='space-y-2'>
                <Label>Select Members</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search members...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                {errors.customAudience && (
                  <p className='text-sm text-red-600'>
                    {errors.customAudience}
                  </p>
                )}
              </div>

              <div className='max-h-60 overflow-y-auto space-y-2'>
                {filteredMembers.map((member) => {
                  const isSelected = data.customAudience.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => toggleMemberSelection(member.id)}
                    >
                      <Checkbox checked={isSelected} />
                      <div className='flex-1'>
                        <div className='font-medium'>
                          {member.firstName} {member.lastName}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center gap-2'>
                          <Phone className='h-3 w-3' />
                          {member.phone}
                          {member.email && (
                            <>
                              <Mail className='h-3 w-3 ml-2' />
                              {member.email}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5' />
            Scheduling
          </CardTitle>
          <CardDescription>Choose when to send this message</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <input
                type='radio'
                id='sendNow'
                name='schedule'
                checked={!data.scheduledAt}
                onChange={() => updateData({ scheduledAt: undefined })}
                className='h-4 w-4'
              />
              <Label htmlFor='sendNow' className='cursor-pointer'>
                Send immediately
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <input
                type='radio'
                id='schedule'
                name='schedule'
                checked={!!data.scheduledAt}
                onChange={() => {
                  if (!data.scheduledAt) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    updateData({ scheduledAt: tomorrow.toISOString() });
                  }
                }}
                className='h-4 w-4'
              />
              <Label htmlFor='schedule' className='cursor-pointer'>
                Schedule for later
              </Label>
            </div>
          </div>

          {data.scheduledAt && (
            <div className='space-y-2'>
              <Label>Schedule Date & Time</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.scheduledAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {data.scheduledAt
                      ? format(new Date(data.scheduledAt), "PPP 'at' p")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={
                      data.scheduledAt ? new Date(data.scheduledAt) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const currentTime = data.scheduledAt
                          ? new Date(data.scheduledAt)
                          : new Date();
                        const newDateTime = new Date(date);
                        newDateTime.setHours(
                          currentTime.getHours(),
                          currentTime.getMinutes(),
                          0,
                          0
                        );
                        updateData({ scheduledAt: newDateTime.toISOString() });
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end space-x-3'>
        <Button variant='outline' onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
