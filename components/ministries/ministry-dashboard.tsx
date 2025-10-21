"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Ministry } from "@/types";
import apiClient from "@/lib/api";

interface MinistryStats {
  totalMinistries: number;
  totalMembers: number;
  totalBudget: number;
  totalSpent: number;
  byCategory: Array<{
    category: string;
    count: number;
    totalMembers: number;
    totalBudget: number;
    totalSpent: number;
  }>;
}

export function MinistryDashboard() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [stats, setStats] = useState<MinistryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ministriesResponse, statsResponse] = await Promise.all([
        apiClient.getMinistries(),
        apiClient.getMinistryStats(),
      ]);

      setMinistries(ministriesResponse?.ministries || []);
      setStats(statsResponse);
    } catch (error) {
      console.error("Error fetching ministry data:", error);
      setMinistries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMinistries =
    selectedCategory === "all"
      ? ministries || []
      : (ministries || []).filter(
          (ministry) => ministry.category === selectedCategory
        );

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      WORSHIP: "bg-blue-100 text-blue-800",
      CHILDREN: "bg-green-100 text-green-800",
      YOUTH: "bg-purple-100 text-purple-800",
      ADULTS: "bg-orange-100 text-orange-800",
      SENIORS: "bg-gray-100 text-gray-800",
      OUTREACH: "bg-red-100 text-red-800",
      ADMINISTRATION: "bg-yellow-100 text-yellow-800",
      OTHER: "bg-slate-100 text-slate-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-slate-100 text-slate-800"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading ministry dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ministries
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalMinistries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active church ministries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all ministries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalBudget || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Allocated across ministries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalBudget
                ? `${Math.round(
                    (stats.totalSpent / stats.totalBudget) * 100
                  )}% of budget`
                : "No budget allocated"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory && stats.byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ministries by Category</CardTitle>
            <CardDescription>
              Overview of ministries organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.byCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(category.category)}>
                      {category.category.replace("_", " ")}
                    </Badge>
                    <span className="text-sm font-medium">
                      {category.count}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span>{category.totalMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget:</span>
                      <span>{formatCurrency(category.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent:</span>
                      <span>{formatCurrency(category.totalSpent)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ministry List with Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ministries</CardTitle>
              <CardDescription>Detailed view of all ministries</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="WORSHIP">Worship</SelectItem>
                  <SelectItem value="CHILDREN">Children</SelectItem>
                  <SelectItem value="YOUTH">Youth</SelectItem>
                  <SelectItem value="ADULTS">Adults</SelectItem>
                  <SelectItem value="SENIORS">Seniors</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <Calendar className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMinistries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {ministries.length === 0
                  ? "No ministries found. Create your first ministry to get started."
                  : "No ministries match the selected category."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMinistries.map((ministry) => (
                <div
                  key={ministry.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{ministry.name}</h3>
                      <Badge className={getCategoryColor(ministry.category)}>
                        {ministry.category.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{ministry.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leader:{" "}
                      {ministry.leader
                        ? `${ministry.leader.firstName} ${ministry.leader.lastName}`
                        : "No leader assigned"}
                    </p>
                    {ministry.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ministry.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium">
                        {ministry.memberCount ||
                          (ministry.members ? ministry.members.length : 0)}
                      </div>
                      <div>Members</div>
                    </div>
                    {ministry.budget && ministry.budget.allocated && (
                      <div className="text-center">
                        <div className="font-medium">
                          {formatCurrency(
                            ministry.budget.allocated,
                            ministry.budget.currency || "USD"
                          )}
                        </div>
                        <div>Budget</div>
                      </div>
                    )}
                    {ministry.meetingSchedule && (
                      <div className="text-center">
                        <div className="font-medium">
                          {ministry.meetingSchedule.frequency.replace("_", " ")}
                        </div>
                        <div>Meetings</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
