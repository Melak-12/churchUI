"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FeatureGuard } from "@/components/feature-guard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  Play,
  Eye,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: "SINGLE" | "BULK";
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  stats: {
    totalRecipients: number;
    consentGiven: number;
    inProgress: number;
    completed: number;
    failed: number;
    pendingApproval: number;
  };
  createdAt: string;
  startedAt?: string;
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusIcons = {
  DRAFT: Clock,
  ACTIVE: Play,
  PAUSED: Pause,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
};

export default function DataCollectionPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data-collection/campaigns`
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
      setCampaigns(data.data?.campaigns || []);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompletionRate = (campaign: Campaign) => {
    if (campaign.stats.totalRecipients === 0) return 0;
    return Math.round(
      (campaign.stats.completed / campaign.stats.totalRecipients) * 100
    );
  };

  const getResponseRate = (campaign: Campaign) => {
    if (campaign.stats.totalRecipients === 0) return 0;
    return Math.round(
      (campaign.stats.consentGiven / campaign.stats.totalRecipients) * 100
    );
  };

  return (
    <FeatureGuard feature="dataCollection">
      <AppShell>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Data Collection Campaigns
              </h1>
              <p className="text-gray-500 mt-1">
                Collect and update member information via SMS conversations
              </p>
            </div>
            <Link href="/data-collection/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold">
                      {campaigns.filter((c) => c.status === "ACTIVE").length}
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">
                      {campaigns.filter((c) => c.status === "COMPLETED").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Approval</p>
                    <p className="text-2xl font-bold">
                      {campaigns.reduce(
                        (sum, c) => sum + c.stats.pendingApproval,
                        0
                      )}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
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
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first data collection campaign to get started
                  </p>
                  <Link href="/data-collection/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => {
                const StatusIcon = statusIcons[campaign.status];
                return (
                  <Card
                    key={campaign.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {campaign.name}
                            </h3>
                            <Badge className={statusColors[campaign.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline">{campaign.type}</Badge>
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-gray-500">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                        <Link href={`/data-collection/${campaign.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Recipients</p>
                          <p className="text-lg font-semibold flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {campaign.stats.totalRecipients}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Consent Given</p>
                          <p className="text-lg font-semibold text-green-600">
                            {campaign.stats.consentGiven}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getResponseRate(campaign)}% rate
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">In Progress</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {campaign.stats.inProgress}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-lg font-semibold text-green-600">
                            {campaign.stats.completed}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getCompletionRate(campaign)}% rate
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Failed</p>
                          <p className="text-lg font-semibold text-red-600">
                            {campaign.stats.failed}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Pending Approval
                          </p>
                          <p className="text-lg font-semibold text-yellow-600">
                            {campaign.stats.pendingApproval}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {campaign.stats.totalRecipients > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Completion Progress</span>
                            <span>{getCompletionRate(campaign)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${getCompletionRate(campaign)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </FeatureGuard>
  );
}
