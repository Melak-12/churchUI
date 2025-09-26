"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Ministry } from "@/types";
import { format } from "date-fns";

interface MinistryListProps {
  ministries: Ministry[];
  loading: boolean;
  onEdit: (ministry: Ministry) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function MinistryList({
  ministries,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: MinistryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMinistries = ministries.filter((ministry) => {
    const matchesSearch =
      ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ministry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || ministry.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || ministry.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      PLANNING: "bg-yellow-100 text-yellow-800",
    };
    return (
      colors[status as keyof typeof colors] || "bg-slate-100 text-slate-800"
    );
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading ministries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ministries</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search ministries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredMinistries.length === 0 ? (
        <Alert>
          <AlertDescription>
            {ministries.length === 0
              ? "No ministries found. Create your first ministry to get started."
              : "No ministries match your current filters."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMinistries.map((ministry) => (
            <Card
              key={ministry.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{ministry.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(ministry.category)}>
                        {ministry.category.replace("_", " ")}
                      </Badge>
                      <Badge className={getStatusColor(ministry.status)}>
                        {ministry.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(ministry)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(ministry.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {ministry.description && (
                  <CardDescription className="line-clamp-2">
                    {ministry.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Leader */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Leader:</span>
                  <span className="font-medium">
                    {ministry.leader.firstName} {ministry.leader.lastName}
                  </span>
                </div>

                {/* Members Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Members:</span>
                  <span className="font-medium">
                    {ministry.memberCount || ministry.members.length}
                  </span>
                </div>

                {/* Meeting Schedule */}
                {ministry.meetingSchedule && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Meets:</span>
                    <span className="font-medium">
                      {ministry.meetingSchedule.frequency
                        .replace("_", " ")
                        .toLowerCase()}
                      {ministry.meetingSchedule.dayOfWeek !== undefined && (
                        <span>
                          {" "}
                          on {getDayName(ministry.meetingSchedule.dayOfWeek)}
                        </span>
                      )}
                      {ministry.meetingSchedule.time && (
                        <span> at {ministry.meetingSchedule.time}</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Location */}
                {ministry.meetingSchedule?.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">
                      {ministry.meetingSchedule.location}
                    </span>
                  </div>
                )}

                {/* Budget */}
                {ministry.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        ministry.budget.allocated,
                        ministry.budget.currency
                      )}
                    </span>
                    {ministry.budget.spent > 0 && (
                      <span className="text-gray-500">
                        (Spent:{" "}
                        {formatCurrency(
                          ministry.budget.spent,
                          ministry.budget.currency
                        )}
                        )
                      </span>
                    )}
                  </div>
                )}

                {/* Goals */}
                {ministry.goals && ministry.goals.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">Goals:</span>
                    <div className="flex flex-wrap gap-1">
                      {ministry.goals.slice(0, 2).map((goal, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {goal}
                        </Badge>
                      ))}
                      {ministry.goals.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{ministry.goals.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
