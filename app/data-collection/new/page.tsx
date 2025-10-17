"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Send,
  Loader2,
  Link as LinkIcon,
  Users,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface Question {
  id: string;
  order: number;
  questionText: string;
  fieldMapping: string;
  fieldType: string;
  isActive: boolean;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
}

interface MemberField {
  field: string;
  label: string;
  type: string;
  required: boolean;
}

interface Recipient {
  member: string;
  phone: string;
  status: string;
  currentQuestionIndex: number;
}

export default function NewDataCollectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campaign data
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState<"SINGLE" | "BULK">("BULK");
  const [autoApprove, setAutoApprove] = useState(false);

  // Consent question
  const [consentQuestion, setConsentQuestion] = useState(
    "We'd like to update your information in our database. Reply YES to continue or NO to opt out."
  );

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [availableFields, setAvailableFields] = useState<MemberField[]>([]);

  // Recipients
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load available fields and members
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fieldsResponse, membersResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/data-collection/member-fields`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          ),
          apiClient.getMembers({ limit: 100 }),
        ]);

        const fieldsData = await fieldsResponse.json();
        setAvailableFields(fieldsData.data?.fields || []);
        setMembers(membersResponse.members);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, []);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      order: questions.length,
      questionText: "",
      fieldMapping: "",
      fieldType: "text",
      isActive: true,
      validationRules: {
        required: true,
      },
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [
        newQuestions[targetIndex],
        newQuestions[index],
      ];

      // Update order
      newQuestions.forEach((q, i) => {
        q.order = i;
      });

      setQuestions(newQuestions);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredMembers = members.filter(
    (member) =>
      member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.includes(searchQuery)
  );

  const handleSaveDraft = async () => {
    if (!campaignName.trim()) {
      setError("Campaign name is required");
      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Select at least one member");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recipients: Recipient[] = selectedMembers.map((memberId) => {
        const member = members.find((m) => m.id === memberId);
        return {
          member: memberId,
          phone: member?.phone || "",
          status: "PENDING",
          currentQuestionIndex: -1,
        };
      });

      const campaignData = {
        name: campaignName,
        description,
        type: campaignType,
        questions,
        consentQuestion,
        autoApprove,
        recipients,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data-collection/campaigns`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(campaignData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create campaign");
      }

      alert("Campaign saved as draft successfully!");
      router.push("/data-collection");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async () => {
    // First save the campaign
    await handleSaveDraft();

    // Then start it (you can enhance this later)
    alert("Campaign will be started!");
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              New Data Collection Campaign
            </h1>
            <p className="text-gray-500 mt-1">
              Create a campaign to collect and update member information via SMS
            </p>
          </div>
          <Link href="/data-collection">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Basic information about your data collection campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Member Info Update 2024"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Campaign Type</Label>
                <Select
                  value={campaignType}
                  onValueChange={(value: any) => setCampaignType(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BULK">
                      Bulk (Multiple Members)
                    </SelectItem>
                    <SelectItem value="SINGLE">Single Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional campaign description"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoApprove"
                checked={autoApprove}
                onCheckedChange={(checked) =>
                  setAutoApprove(checked as boolean)
                }
              />
              <Label
                htmlFor="autoApprove"
                className="text-sm font-normal cursor-pointer"
              >
                Auto-approve updates (apply changes immediately without review)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Consent Question */}
        <Card>
          <CardHeader>
            <CardTitle>Consent Question</CardTitle>
            <CardDescription>
              First message sent to members asking for permission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={consentQuestion}
              onChange={(e) => setConsentQuestion(e.target.value)}
              rows={3}
              placeholder="Consent question text"
            />
            <p className="text-sm text-gray-500 mt-2">
              Members must reply with YES, Y, SURE, OK, or similar to continue
            </p>
          </CardContent>
        </Card>

        {/* Questions Builder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Questions
                </CardTitle>
                <CardDescription>
                  Configure questions and map them to member fields
                </CardDescription>
              </div>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No questions added yet. Click "Add Question" to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(index, "down")}
                            disabled={index === questions.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Question Text *</Label>
                        <Textarea
                          value={question.questionText}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              questionText: e.target.value,
                            })
                          }
                          placeholder="e.g., What is your first name?"
                          rows={2}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            Map to Field *
                          </Label>
                          <Select
                            value={question.fieldMapping}
                            onValueChange={(value) =>
                              updateQuestion(question.id, {
                                fieldMapping: value,
                                fieldType:
                                  availableFields.find((f) => f.field === value)
                                    ?.type || "text",
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map((field) => (
                                <SelectItem
                                  key={field.field}
                                  value={field.field}
                                >
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Field Type</Label>
                          <Input
                            value={question.fieldType}
                            disabled
                            className="mt-1 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required_${question.id}`}
                          checked={question.validationRules?.required}
                          onCheckedChange={(checked) =>
                            updateQuestion(question.id, {
                              validationRules: {
                                ...question.validationRules,
                                required: checked as boolean,
                              },
                            })
                          }
                        />
                        <Label
                          htmlFor={`required_${question.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          Required field
                        </Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Recipients
            </CardTitle>
            <CardDescription>
              Choose which members should receive this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Search members by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{selectedMembers.length} member(s) selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedMembers(
                      selectedMembers.length === filteredMembers.length
                        ? []
                        : filteredMembers.map((m) => m.id)
                    )
                  }
                >
                  {selectedMembers.length === filteredMembers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMemberSelection(member.id)}
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/data-collection")}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button onClick={handleStartCampaign} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Create & Start Campaign
          </Button>
        </div>
      </div>
    </AppShell>
  );
}


