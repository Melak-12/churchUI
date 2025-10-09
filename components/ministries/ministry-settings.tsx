"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Save,
  Plus,
  X,
  DollarSign,
  Calendar,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";

// Settings schema
const ministrySettingsSchema = z.object({
  // General Settings
  requireApproval: z.boolean(),
  allowSelfRegistration: z.boolean(),
  maxMinistriesPerMember: z.number().min(1).max(10),
  defaultStatus: z.enum(["ACTIVE", "INACTIVE", "PLANNING"]),

  // Budget Settings
  enableBudgetTracking: z.boolean(),
  defaultCurrency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]),
  requireBudgetApproval: z.boolean(),
  budgetWarningThreshold: z.number().min(0).max(100),

  // Meeting Settings
  enableMeetingScheduling: z.boolean(),
  defaultMeetingFrequency: z.enum([
    "WEEKLY",
    "BIWEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "AS_NEEDED",
  ]),
  requireMeetingLocation: z.boolean(),
  allowVirtualMeetings: z.boolean(),

  // Notification Settings
  notifyOnNewMembers: z.boolean(),
  notifyOnBudgetExceeded: z.boolean(),
  notifyOnMeetingReminders: z.boolean(),
  reminderDaysBefore: z.number().min(1).max(30),

  // Custom Categories
  customCategories: z.array(z.string().min(1).max(50)),
});

type MinistrySettingsData = z.infer<typeof ministrySettingsSchema>;

interface MinistrySettingsProps {
  onSave?: (settings: MinistrySettingsData) => void;
}

export function MinistrySettings({ onSave }: MinistrySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const form = useForm<MinistrySettingsData>({
    resolver: zodResolver(ministrySettingsSchema),
    defaultValues: {
      // General Settings
      requireApproval: true,
      allowSelfRegistration: false,
      maxMinistriesPerMember: 3,
      defaultStatus: "ACTIVE",

      // Budget Settings
      enableBudgetTracking: true,
      defaultCurrency: "USD",
      requireBudgetApproval: true,
      budgetWarningThreshold: 80,

      // Meeting Settings
      enableMeetingScheduling: true,
      defaultMeetingFrequency: "WEEKLY",
      requireMeetingLocation: true,
      allowVirtualMeetings: true,

      // Notification Settings
      notifyOnNewMembers: true,
      notifyOnBudgetExceeded: true,
      notifyOnMeetingReminders: true,
      reminderDaysBefore: 3,

      // Custom Categories
      customCategories: [],
    },
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setInitialLoading(true);
        const settings = await apiClient.getMinistrySettings();

        if (settings) {
          form.reset(settings);
        }
      } catch (error) {
        console.error("Error loading ministry settings:", error);
        toast({
          title: "Error",
          description: "Failed to load ministry settings",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [form, toast]);

  const handleSubmit = async (data: MinistrySettingsData) => {
    setLoading(true);
    try {
      const savedSettings = await apiClient.updateMinistrySettings(data);

      if (onSave) {
        onSave(savedSettings);
      }

      toast({
        title: "Success",
        description: "Ministry settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save ministry settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomCategory = () => {
    if (newCategory.trim()) {
      const currentCategories = form.getValues("customCategories") || [];
      if (!currentCategories.includes(newCategory.trim())) {
        form.setValue("customCategories", [
          ...currentCategories,
          newCategory.trim(),
        ]);
        setNewCategory("");
      }
    }
  };

  const removeCustomCategory = (index: number) => {
    const currentCategories = form.getValues("customCategories") || [];
    form.setValue(
      "customCategories",
      currentCategories.filter((_, i) => i !== index)
    );
  };

  const predefinedCategories = [
    "WORSHIP",
    "CHILDREN",
    "YOUTH",
    "ADULTS",
    "SENIORS",
    "OUTREACH",
    "ADMINISTRATION",
    "OTHER",
  ];

  const handleReset = async () => {
    try {
      setLoading(true);
      const resetSettings = await apiClient.resetMinistrySettings();
      form.reset(resetSettings);

      toast({
        title: "Success",
        description: "Ministry settings reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset ministry settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 animate-spin" />
          <span>Loading ministry settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-500 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Ministry Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure ministry management preferences and defaults
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>
                Configure basic ministry management settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="requireApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Require Approval
                        </FormLabel>
                        <FormDescription>
                          New ministries must be approved before becoming active
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowSelfRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Self-Registration
                        </FormLabel>
                        <FormDescription>
                          Members can join ministries without invitation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxMinistriesPerMember"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Ministries Per Member</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of ministries a member can join
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="PLANNING">Planning</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default status for new ministries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Budget Settings</span>
              </CardTitle>
              <CardDescription>
                Configure budget tracking and financial management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="enableBudgetTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Budget Tracking
                        </FormLabel>
                        <FormDescription>
                          Track ministry budgets and spending
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireBudgetApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Require Budget Approval
                        </FormLabel>
                        <FormDescription>
                          Budget changes require admin approval
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
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
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">
                            GBP - British Pound
                          </SelectItem>
                          <SelectItem value="CAD">
                            CAD - Canadian Dollar
                          </SelectItem>
                          <SelectItem value="AUD">
                            AUD - Australian Dollar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default currency for ministry budgets
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetWarningThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Warning Threshold (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Send warning when budget usage exceeds this percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Meeting Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Meeting Settings</span>
              </CardTitle>
              <CardDescription>
                Configure meeting scheduling and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="enableMeetingScheduling"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Meeting Scheduling
                        </FormLabel>
                        <FormDescription>
                          Allow ministries to schedule regular meetings
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireMeetingLocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Require Meeting Location
                        </FormLabel>
                        <FormDescription>
                          Meeting location is mandatory
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowVirtualMeetings"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Virtual Meetings
                        </FormLabel>
                        <FormDescription>
                          Enable online/virtual meeting options
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultMeetingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Meeting Frequency</FormLabel>
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
                      <FormDescription>
                        Default frequency for new ministries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure ministry-related notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="notifyOnNewMembers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notify on New Members
                        </FormLabel>
                        <FormDescription>
                          Send notifications when members join ministries
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyOnBudgetExceeded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notify on Budget Exceeded
                        </FormLabel>
                        <FormDescription>
                          Send alerts when budget limits are exceeded
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyOnMeetingReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Meeting Reminders
                        </FormLabel>
                        <FormDescription>
                          Send reminders before scheduled meetings
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderDaysBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Days Before</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Days before meeting to send reminder
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Ministry Categories</span>
              </CardTitle>
              <CardDescription>
                Manage predefined and custom ministry categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Predefined Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Predefined Categories
                </Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {category.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Custom Categories
                </Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add custom category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomCategory();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomCategory} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.watch("customCategories") &&
                  form.watch("customCategories")!.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form
                        .watch("customCategories")!
                        .map((category, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {category}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeCustomCategory(index)}
                            />
                          </Badge>
                        ))}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
