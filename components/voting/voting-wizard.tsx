"use client";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Users, Info } from "lucide-react";

interface VoteFormData {
  title: string;
  description?: string;
  type: "SINGLE_CHOICE" | "YES_NO";
  options: string[];
  startAt: string;
  endAt: string;
  anonymous: boolean;
}

interface VotingWizardProps {
  step: number;
  data: VoteFormData;
  onUpdate: (updates: Partial<VoteFormData>) => void;
  eligibleMembersCount: number;
  errors: { [key: string]: any };
}

export function VotingWizard({
  step,
  data,
  onUpdate,
  eligibleMembersCount,
  errors,
}: VotingWizardProps) {
  const addOption = () => {
    onUpdate({ options: [...data.options, `Option ${data.options.length + 1}`] });
  };

  const removeOption = (index: number) => {
    if (data.options.length > 2) {
      onUpdate({ options: data.options.filter((_, i) => i !== index) });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Vote Title
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="title" className="text-base sm:text-lg font-medium">
              What are you voting on?
            </Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Board Member Election 2024"
              className="h-10 sm:h-11 text-base w-full"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
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
              placeholder="Provide context and instructions for voters..."
              rows={4}
              className="resize-none text-base w-full"
            />
          </div>
        );

      case 2: // Start Date
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="startAt" className="text-base sm:text-lg font-medium">
              When should voting start?
            </Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={data.startAt}
              onChange={(e) => onUpdate({ startAt: e.target.value })}
              className="h-10 sm:h-11 text-base w-full"
            />
            {errors.startAt && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.startAt.message}
              </p>
            )}
          </div>
        );

      case 3: // End Date
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="endAt" className="text-base sm:text-lg font-medium">
              When should voting end?
            </Label>
            <Input
              id="endAt"
              type="datetime-local"
              value={data.endAt}
              onChange={(e) => onUpdate({ endAt: e.target.value })}
              className="h-10 sm:h-11 text-base w-full"
            />
            {errors.endAt && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.endAt.message}
              </p>
            )}
            {/* Eligibility Info */}
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-300 mb-1">
                    Only members who are not delinquent for more than 90 days can vote.
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300">
                      Eligible Voters:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {eligibleMembersCount} members
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Vote Type
        return (
          <div className="space-y-2 w-full">
            <Label htmlFor="type" className="text-base sm:text-lg font-medium">
              What type of vote is this?
            </Label>
            <Select
              value={data.type}
              onValueChange={(value: "SINGLE_CHOICE" | "YES_NO") => {
                onUpdate({ type: value });
                if (value === "YES_NO") {
                  onUpdate({ options: ["Yes", "No"] });
                } else if (
                  data.options.length === 2 &&
                  data.options[0] === "Yes" &&
                  data.options[1] === "No"
                ) {
                  onUpdate({ options: ["Option 1", "Option 2"] });
                }
              }}
            >
              <SelectTrigger className="h-10 sm:h-11 text-base w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_CHOICE">
                  Single Choice (Election)
                </SelectItem>
                <SelectItem value="YES_NO">Yes/No (Approval)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 5: // Options (only for SINGLE_CHOICE)
        return data.type === "SINGLE_CHOICE" ? (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label className="text-base sm:text-lg font-medium">
                What are the options?
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {data.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="h-9 text-base w-full"
                  />
                  {data.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="h-9 px-3"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.options && (
                <p className="text-xs sm:text-sm text-red-600">
                  {errors.options.message}
                </p>
              )}
            </div>
          </div>
        ) : null;

      case 6: // Anonymous setting
        return (
          <div className="space-y-3 w-full">
            <Label className="text-base sm:text-lg font-medium">
              Should votes be anonymous?
            </Label>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Switch
                id="anonymous"
                checked={data.anonymous}
                onCheckedChange={(checked) => onUpdate({ anonymous: checked })}
              />
              <Label htmlFor="anonymous" className="text-sm sm:text-base cursor-pointer">
                Make votes anonymous
              </Label>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {data.anonymous
                ? "Voters' names will not be visible to anyone"
                : "Administrators will be able to see who voted"}
            </p>
          </div>
        );

      case 7: // Review & Confirm

        return (
          <div className="space-y-4 w-full">
            <div className="space-y-3">
              <h3 className="font-semibold text-base sm:text-lg">Vote Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Title:</span>
                  <span className="font-medium text-right">{data.title}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-right">
                    {data.type === "SINGLE_CHOICE"
                      ? "Single Choice (Election)"
                      : "Yes/No (Approval)"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Start Date:
                  </span>
                  <span className="font-medium text-right">
                    {data.startAt
                      ? new Date(data.startAt).toLocaleString()
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    End Date:
                  </span>
                  <span className="font-medium text-right">
                    {data.endAt
                      ? new Date(data.endAt).toLocaleString()
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Anonymous:
                  </span>
                  <span className="font-medium text-right">
                    {data.anonymous ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Eligible Voters:
                  </span>
                  <span className="font-medium text-right">
                    {eligibleMembersCount} members
                  </span>
                </div>
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

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Options</h4>
              <div className="space-y-1">
                {data.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}

