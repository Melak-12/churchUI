"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  MessageSquare,
  Loader2,
  Search,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataUpdate {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  questionText?: string;
}

interface Approval {
  id: string;
  campaign: {
    id: string;
    name: string;
  };
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
  };
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";
  dataUpdates: DataUpdate[];
  responses: {
    questionText: string;
    answer: string;
    answeredAt: string;
  }[];
  createdAt: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, [statusFilter]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data-collection/approvals`
      );
      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      setApprovals(data.data?.approvals || []);
    } catch (error) {
      console.error("Error loading approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data-collection/approvals/${approvalId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ notes: reviewNotes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve");
      }

      // Refresh the list
      await loadApprovals();
      setSelectedApproval(null);
      setReviewNotes("");
      alert("Updates approved and applied successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!reviewNotes.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data-collection/approvals/${approvalId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ notes: reviewNotes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject");
      }

      // Refresh the list
      await loadApprovals();
      setSelectedApproval(null);
      setReviewNotes("");
      alert("Updates rejected successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredApprovals = approvals.filter((approval) =>
    `${approval.member.firstName} ${approval.member.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    AUTO_APPROVED: "bg-blue-100 text-blue-800",
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Data Update Approvals
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve member data updates from SMS campaigns
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold">
                    {approvals.filter((a) => a.status === "PENDING").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold">
                    {approvals.filter((a) => a.status === "APPROVED").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold">
                    {approvals.filter((a) => a.status === "REJECTED").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Auto-Approved</p>
                  <p className="text-2xl font-bold">
                    {
                      approvals.filter((a) => a.status === "AUTO_APPROVED")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by member name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="AUTO_APPROVED">Auto-Approved</SelectItem>
                  <SelectItem value="all">All Statuses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Approvals List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No approvals found
                </h3>
                <p className="text-gray-500">
                  {statusFilter === "PENDING"
                    ? "All caught up! No pending approvals."
                    : "No approvals match your current filter."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApprovals.map((approval) => (
              <Card
                key={approval.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedApproval(approval)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {approval.member.firstName} {approval.member.lastName}
                        </h3>
                        <Badge className={statusColors[approval.status]}>
                          {approval.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {approval.member.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {approval.campaign.name}
                        </span>
                        <span>
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Data Updates Preview */}
                      <div className="space-y-2">
                        {approval.dataUpdates.slice(0, 3).map((update, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-gray-500">
                              {update.fieldLabel}:
                            </span>
                            <span className="text-gray-400">
                              {update.oldValue || "(empty)"}
                            </span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-green-600">
                              {update.newValue}
                            </span>
                          </div>
                        ))}
                        {approval.dataUpdates.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{approval.dataUpdates.length - 3} more updates
                          </p>
                        )}
                      </div>
                    </div>

                    {approval.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApproval(approval);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog
          open={!!selectedApproval}
          onOpenChange={() => {
            setSelectedApproval(null);
            setReviewNotes("");
            setError(null);
          }}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Data Updates</DialogTitle>
              <DialogDescription>
                Review and approve or reject the following updates
              </DialogDescription>
            </DialogHeader>

            {selectedApproval && (
              <div className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Member Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <h4 className="font-medium">Member Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{" "}
                      {selectedApproval.member.firstName}{" "}
                      {selectedApproval.member.lastName}
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{" "}
                      {selectedApproval.member.phone}
                    </div>
                    {selectedApproval.member.email && (
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        {selectedApproval.member.email}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Campaign:</span>{" "}
                      {selectedApproval.campaign.name}
                    </div>
                  </div>
                </div>

                {/* Data Updates */}
                <div>
                  <h4 className="font-medium mb-3">Proposed Updates</h4>
                  <div className="space-y-3">
                    {selectedApproval.dataUpdates.map((update, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-white">
                        <div className="font-medium text-sm mb-2">
                          {update.fieldLabel}
                        </div>
                        {update.questionText && (
                          <div className="text-xs text-gray-500 mb-2">
                            Q: {update.questionText}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">
                              Current Value
                            </p>
                            <p className="text-sm text-gray-600">
                              {update.oldValue || "(empty)"}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">
                              New Value
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              {update.newValue}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Notes */}
                {selectedApproval.status === "PENDING" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Review Notes (Optional for approval, required for
                      rejection)
                    </label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes about this review..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                {selectedApproval.status === "PENDING" && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedApproval(null);
                        setReviewNotes("");
                        setError(null);
                      }}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedApproval.id)}
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedApproval.id)}
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve & Apply
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}


