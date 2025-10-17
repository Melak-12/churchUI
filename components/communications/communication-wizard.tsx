"use client";

import { useState, useEffect, useRef } from "react";
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
  DollarSign,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Search,
} from "lucide-react";
import { apiClient } from "@/lib/api";

type AudienceType =
  | "ALL"
  | "ELIGIBLE"
  | "DELINQUENT_30"
  | "DELINQUENT_60"
  | "DELINQUENT_90"
  | "CUSTOM";

interface CommunicationData {
  name: string;
  audience: AudienceType;
  customAudience?: string[];
  body: string;
  scheduledAt?: string;
}

interface MemberStats {
  total: number;
  eligible: number;
  delinquentBreakdown: {
    "0-30": number;
    "31-60": number;
    "61-90": number;
    "90+": number;
  };
}

interface CommunicationWizardProps {
  step: number;
  data: CommunicationData;
  memberStats: MemberStats;
  onUpdate: (updates: Partial<CommunicationData>) => void;
  onPreview: () => void;
}

const audienceOptions = [
  {
    value: "ALL" as const,
    label: "All Members",
    description: "Every member in the database",
    icon: Users,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    value: "ELIGIBLE" as const,
    label: "Eligible Members",
    description: "Members who can vote (not delinquent > 90 days)",
    icon: CheckCircle2,
    color:
      "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400",
  },
  {
    value: "DELINQUENT_30" as const,
    label: "Delinquent (0-30 days)",
    description: "Recent payment issues",
    icon: AlertCircle,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400",
  },
  {
    value: "DELINQUENT_60" as const,
    label: "Delinquent (31-60 days)",
    description: "Moderate payment delay",
    icon: AlertCircle,
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400",
  },
  {
    value: "DELINQUENT_90" as const,
    label: "Delinquent (61-90 days)",
    description: "Significant payment delay",
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400",
  },
  {
    value: "CUSTOM" as const,
    label: "Custom Selection",
    description: "Choose specific members",
    icon: User,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400",
  },
];

const messageVariables = [
  {
    variable: "{{firstName}}",
    description: "Member's first name",
    example: "John",
  },
  {
    variable: "{{lastName}}",
    description: "Member's last name",
    example: "Smith",
  },
  {
    variable: "{{eligibility}}",
    description: "Eligible or Not Eligible",
    example: "Eligible",
  },
  {
    variable: "{{ballotLink}}",
    description: "Link to vote (if applicable)",
    example: "https://...",
  },
  {
    variable: "{{registerLink}}",
    description: "Link to update profile",
    example: "https://...",
  },
];

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export function CommunicationWizard({
  step,
  data,
  memberStats,
  onUpdate,
  onPreview,
}: CommunicationWizardProps) {
  const [customMembers, setCustomMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    data.customAudience || []
  );
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    data.scheduledAt ? new Date(data.scheduledAt) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState<string>("09:00");
  const [messagePreview, setMessagePreview] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleOption, setScheduleOption] = useState<"now" | "schedule">(
    data.scheduledAt ? "schedule" : "now"
  );

  // Ref for custom selection section
  const customSelectionRef = useRef<HTMLDivElement>(null);

  // Fetch members for custom selection
  useEffect(() => {
    if (
      step === 1 &&
      data.audience === "CUSTOM" &&
      customMembers.length === 0
    ) {
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
  }, [step, data.audience]);

  // Update custom audience when selection changes
  useEffect(() => {
    if (data.audience === "CUSTOM") {
      onUpdate({ customAudience: selectedMembers });
    }
  }, [selectedMembers, data.audience, onUpdate]);

  // Reset search when switching away from custom selection
  useEffect(() => {
    if (data.audience !== "CUSTOM") {
      setSearchQuery("");
    }
  }, [data.audience]);

  // Auto-scroll to custom selection when CUSTOM audience is selected
  useEffect(() => {
    if (data.audience === "CUSTOM" && customSelectionRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        customSelectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [data.audience]);

  // Update scheduled date
  useEffect(() => {
    if (scheduledDate) {
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const dateTime = new Date(scheduledDate);
      dateTime.setHours(hours, minutes, 0, 0);
      onUpdate({ scheduledAt: dateTime.toISOString() });
    }
  }, [scheduledDate, scheduledTime, onUpdate]);

  // Generate message preview
  useEffect(() => {
    if (data.body) {
      let preview = data.body;
      preview = preview.replace(/\{\{firstName\}\}/g, "John");
      preview = preview.replace(/\{\{lastName\}\}/g, "Smith");
      preview = preview.replace(/\{\{eligibility\}\}/g, "Eligible");
      preview = preview.replace(
        /\{\{ballotLink\}\}/g,
        "https://church.app/vote/123"
      );
      preview = preview.replace(
        /\{\{registerLink\}\}/g,
        "https://church.app/register"
      );
      setMessagePreview(preview);
    }
  }, [data.body]);

  const getMemberCount = (audience: AudienceType): number => {
    switch (audience) {
      case "ALL":
        return memberStats.total || 0;
      case "ELIGIBLE":
        return memberStats.eligible || 0;
      case "DELINQUENT_30":
        return memberStats.delinquentBreakdown?.["0-30"] || 0;
      case "DELINQUENT_60":
        return memberStats.delinquentBreakdown?.["31-60"] || 0;
      case "DELINQUENT_90":
        return memberStats.delinquentBreakdown?.["61-90"] || 0;
      case "CUSTOM":
        return selectedMembers.length;
      default:
        return 0;
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue =
        data.body.slice(0, start) + variable + data.body.slice(end);
      onUpdate({ body: newValue });

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length,
          start + variable.length
        );
      }, 0);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Filter members based on search query
  const filteredMembers = customMembers.filter((member) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.firstName?.toLowerCase().includes(query) ||
      member.lastName?.toLowerCase().includes(query) ||
      member.phone?.includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  const renderStep = () => {
    switch (step) {
      case 0: // Campaign Details
        return (
          <div className='space-y-6'>
            <div>
              <Label htmlFor='campaignName' className='text-base font-medium'>
                Campaign Name
              </Label>
              <Input
                id='campaignName'
                value={data.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder='e.g., Monthly Newsletter, Payment Reminder'
                className='mt-2 text-lg'
              />
            </div>
          </div>
        );

      case 1: // Audience Selection
        return (
          <div className='space-y-4'>
            <Label className='text-base font-medium'>
              Who should receive this message?
            </Label>
            <RadioGroup
              value={data.audience}
              onValueChange={(value) =>
                onUpdate({ audience: value as AudienceType })
              }
              className='space-y-2'
            >
              {audienceOptions.map((option) => {
                const Icon = option.icon;
                const memberCount = getMemberCount(option.value);

                return (
                  <div key={option.value} className='relative'>
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className='sr-only'
                    />
                    <Label
                      htmlFor={option.value}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800",
                        data.audience === option.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <div className='flex items-center space-x-3'>
                        <Icon className='h-4 w-4 text-gray-600' />
                        <span className='font-medium'>{option.label}</span>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        {memberCount}
                      </Badge>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {data.audience === "CUSTOM" && (
              <div
                ref={customSelectionRef}
                className='mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
              >
                <div className='flex items-center justify-between mb-3'>
                  <span className='font-medium text-sm'>Select Members</span>
                  <Badge variant='outline' className='text-xs'>
                    {selectedMembers.length} selected
                  </Badge>
                </div>

                {/* Search Bar */}
                <div className='relative mb-3'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search members by name, phone, or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10 text-sm'
                  />
                </div>

                <div className='h-48 overflow-y-auto space-y-2'>
                  {filteredMembers.length > 0 ? (
                    <div className='space-y-2'>
                      {filteredMembers.map((member) => {
                        const memberId = getDocumentId(member);
                        return (
                          <div
                            key={memberId}
                            className='flex items-center space-x-3 p-2 hover:bg-white rounded transition-colors'
                          >
                            <Checkbox
                              checked={selectedMembers.includes(memberId)}
                              onCheckedChange={() =>
                                toggleMemberSelection(memberId)
                              }
                            />
                            <div className='flex-1 min-w-0'>
                              <div className='font-medium text-sm truncate'>
                                {member.firstName} {member.lastName}
                              </div>
                              <div className='text-xs text-gray-500'>
                                {member.phone}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='flex items-center justify-center h-full text-sm text-gray-500'>
                      {searchQuery
                        ? "No members found matching your search"
                        : "No members available"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Message Composition
        return (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='messageBody' className='text-base font-medium'>
                Your Message
              </Label>
              <Textarea
                id='messageBody'
                value={data.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                placeholder='Type your message here...'
                className='mt-2 min-h-32 resize-none text-base'
                maxLength={1600}
              />
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 text-sm text-gray-500'>
                <span>{data.body.length}/1600 characters</span>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='whitespace-nowrap'>Variables:</span>
                  <div className='flex flex-wrap gap-1'>
                    {messageVariables.slice(0, 3).map((item) => (
                      <Button
                        key={item.variable}
                        variant='outline'
                        size='sm'
                        onClick={() => insertVariable(item.variable)}
                        className='text-xs h-6 px-2'
                      >
                        {item.variable}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {data.body && (
              <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Preview:
                </div>
                <div className='text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400'>
                  {messagePreview}
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Schedule & Send
        return (
          <div className='space-y-4'>
            <Label className='text-base font-medium'>
              When should this be sent?
            </Label>
            <RadioGroup
              value={scheduleOption}
              onValueChange={(value) => {
                setScheduleOption(value as "now" | "schedule");
                if (value === "now") {
                  onUpdate({ scheduledAt: undefined });
                  setScheduledDate(undefined);
                } else if (value === "schedule") {
                  // Set a default scheduled date if none exists
                  if (!scheduledDate) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setScheduledDate(tomorrow);
                  }
                }
              }}
              className='space-y-3'
            >
              <div className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800'>
                <RadioGroupItem value='now' id='now' />
                <Label htmlFor='now' className='flex-1 cursor-pointer'>
                  <div className='font-medium'>Send Now</div>
                  <div className='text-sm text-gray-500'>Send immediately</div>
                </Label>
              </div>

              <div className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800'>
                <RadioGroupItem value='schedule' id='schedule' />
                <Label htmlFor='schedule' className='flex-1 cursor-pointer'>
                  <div className='font-medium'>Schedule for Later</div>
                  <div className='text-sm text-gray-500'>
                    Choose date and time
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {scheduleOption === "schedule" && (
              <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium'>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {scheduledDate
                            ? format(scheduledDate, "MMM dd")
                            : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={scheduledDate}
                          onSelect={(date) => date && setScheduledDate(date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className='text-sm font-medium'>Time</Label>
                    <Select
                      value={scheduledTime}
                      onValueChange={setScheduledTime}
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {scheduledDate && (
                  <div className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                    <Clock className='h-4 w-4 mr-1 flex-shrink-0' />
                    <span className='break-words'>
                      {format(scheduledDate, "PPP")} at {scheduledTime}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4: // Preview & Confirm
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <h4 className='font-medium text-gray-900 dark:text-gray-100'>
                  Campaign Summary
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Name:
                    </span>
                    <span className='font-medium text-right break-words'>
                      {data.name}
                    </span>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Audience:
                    </span>
                    <span className='font-medium text-right'>
                      {
                        audienceOptions.find(
                          (opt) => opt.value === data.audience
                        )?.label
                      }
                    </span>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Recipients:
                    </span>
                    <span className='font-medium text-right'>
                      {getMemberCount(data.audience)} members
                    </span>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Timing:
                    </span>
                    <span className='font-medium text-right break-words'>
                      {data.scheduledAt
                        ? format(
                            new Date(data.scheduledAt),
                            "MMM dd 'at' HH:mm"
                          )
                        : "Send immediately"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <h4 className='font-medium text-gray-900 dark:text-gray-100'>
                  Message Preview
                </h4>
                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <div className='text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 break-words'>
                    {messagePreview || data.body}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <DollarSign className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span className='text-sm font-medium text-blue-900 dark:text-blue-300'>
                  Total Cost
                </span>
              </div>
              <span className='text-lg font-bold text-blue-900 dark:text-blue-300'>
                ${(getMemberCount(data.audience) * 0.0075).toFixed(2)}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
