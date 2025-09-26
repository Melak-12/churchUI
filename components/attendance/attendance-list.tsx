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
  Clock,
  MapPin,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Attendance } from "@/types";
import { format, formatDistanceToNow } from "date-fns";

interface AttendanceListProps {
  attendance: Attendance[];
  loading: boolean;
  onEdit: (attendance: Attendance) => void;
  onDelete: (id: string) => void;
  onCheckOut: (id: string) => void;
  onRefresh: () => void;
}

export function AttendanceList({
  attendance,
  loading,
  onEdit,
  onDelete,
  onCheckOut,
  onRefresh,
}: AttendanceListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.member.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.event?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ministry?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.smallGroup?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "service" && record.service) ||
      (typeFilter === "event" && record.event) ||
      (typeFilter === "ministry" && record.ministry) ||
      (typeFilter === "smallGroup" && record.smallGroup);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checked-in" && !record.checkOutTime) ||
      (statusFilter === "checked-out" && record.checkOutTime);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (record: Attendance) => {
    if (record.service) return "bg-blue-100 text-blue-800";
    if (record.event) return "bg-green-100 text-green-800";
    if (record.ministry) return "bg-purple-100 text-purple-800";
    if (record.smallGroup) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (record: Attendance) => {
    if (record.service)
      return `Service - ${record.service.type.replace("_", " ")}`;
    if (record.event) return "Event";
    if (record.ministry) return "Ministry";
    if (record.smallGroup) return "Small Group";
    return "Other";
  };

  const getMethodColor = (method: string) => {
    const colors = {
      MANUAL: "bg-gray-100 text-gray-800",
      QR_CODE: "bg-blue-100 text-blue-800",
      MOBILE_APP: "bg-green-100 text-green-800",
      KIOSK: "bg-purple-100 text-purple-800",
    };
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading attendance records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Attendance Records</span>
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
                  placeholder="Search by member, event, or ministry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="ministry">Ministries</SelectItem>
                <SelectItem value="smallGroup">Small Groups</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAttendance.length === 0 ? (
        <Alert>
          <AlertDescription>
            {attendance.length === 0
              ? "No attendance records found. Check in your first member to get started."
              : "No attendance records match your current filters."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredAttendance.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {record.member.firstName} {record.member.lastName}
                        </span>
                      </div>
                      <Badge className={getTypeColor(record)}>
                        {getTypeLabel(record)}
                      </Badge>
                      <Badge className={getMethodColor(record.method)}>
                        {record.method.replace("_", " ")}
                      </Badge>
                      {record.checkOutTime ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Checked Out
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-blue-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Checked In
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {/* Event/Service Details */}
                      <div className="space-y-2">
                        {record.event && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Event:</span>
                            <span className="font-medium">
                              {record.event.title}
                            </span>
                          </div>
                        )}
                        {record.service && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Service:</span>
                            <span className="font-medium">
                              {record.service.type.replace("_", " ")}
                            </span>
                          </div>
                        )}
                        {record.ministry && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Ministry:</span>
                            <span className="font-medium">
                              {record.ministry.name}
                            </span>
                          </div>
                        )}
                        {record.smallGroup && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Small Group:</span>
                            <span className="font-medium">
                              {record.smallGroup.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Time Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Checked In:</span>
                          <span className="font-medium">
                            {format(
                              new Date(record.checkInTime),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                        {record.checkOutTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Checked Out:</span>
                            <span className="font-medium">
                              {format(
                                new Date(record.checkOutTime),
                                "MMM dd, yyyy 'at' h:mm a"
                              )}
                            </span>
                          </div>
                        )}
                        {record.duration && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">
                              {formatDuration(record.duration)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Recorded by:</span>
                          <span className="font-medium">
                            {record.recordedBy.firstName}{" "}
                            {record.recordedBy.lastName}
                          </span>
                        </div>
                        {record.notes && (
                          <div className="text-sm">
                            <span className="text-gray-600">Notes: </span>
                            <span className="font-medium">{record.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {!record.checkOutTime && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCheckOut(record.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(record.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
