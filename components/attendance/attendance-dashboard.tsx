"use client";

import { useState, useEffect, useCallback } from "react";
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
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Attendance } from "@/types";
import apiClient from "@/lib/api";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

interface AttendanceStats {
  totalAttendance: number;
  uniqueMemberCount: number;
  byServiceType: Array<{
    serviceType: string;
    count: number;
  }>;
  byMinistry: Array<{
    ministry: string;
    count: number;
  }>;
  bySmallGroup: Array<{
    smallGroup: string;
    count: number;
  }>;
}

export function AttendanceDashboard() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("week");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date range based on selection
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      switch (timeRange) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "week":
          startDate = startOfWeek(new Date());
          endDate = endOfWeek(new Date());
          break;
        case "month":
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        case "last30days":
          endDate = new Date();
          startDate = subDays(endDate, 30);
          break;
      }

      const [attendanceResponse, statsResponse] = await Promise.all([
        apiClient.getAttendance({
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }),
        apiClient.getAttendanceStats({
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }),
      ]);

      setAttendance(attendanceResponse.attendance);
      setStats(statsResponse);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [timeRange, fetchData]);

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      SUNDAY_SERVICE: "bg-blue-100 text-blue-800",
      WEDNESDAY_SERVICE: "bg-green-100 text-green-800",
      SPECIAL_SERVICE: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return (
      colors[serviceType as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
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

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "last30days":
        return "Last 30 Days";
      default:
        return "This Week";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading attendance dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>
                Statistics for {getTimeRangeLabel().toLowerCase()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Check-ins
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAttendance || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTimeRangeLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.uniqueMemberCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different members attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.filter((a) => a.checkOutTime).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalAttendance
                ? `${Math.round(
                    (attendance.filter((a) => a.checkOutTime).length /
                      stats.totalAttendance) *
                      100
                  )}% of check-ins`
                : "No check-ins"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const checkedOut = attendance.filter((a) => a.duration);
                if (checkedOut.length === 0) return "N/A";
                const avgDuration =
                  checkedOut.reduce((sum, a) => sum + (a.duration || 0), 0) /
                  checkedOut.length;
                return formatDuration(Math.round(avgDuration));
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              For checked-out members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Service Type */}
      {stats?.byServiceType && stats.byServiceType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Service Type</CardTitle>
            <CardDescription>
              Breakdown of attendance by different service types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.byServiceType.map((service) => (
                <div key={service.serviceType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getServiceTypeColor(service.serviceType)}>
                      {service.serviceType.replace("_", " ")}
                    </Badge>
                    <span className="text-sm font-medium">{service.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.totalAttendance > 0
                            ? (service.count / stats.totalAttendance) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown by Ministry */}
      {stats?.byMinistry && stats.byMinistry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Ministry</CardTitle>
            <CardDescription>
              Ministry meeting attendance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byMinistry.map((ministry) => (
                <div
                  key={ministry.ministry}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ministry.ministry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {ministry.count} check-ins
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalAttendance > 0
                              ? (ministry.count / stats.totalAttendance) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown by Small Group */}
      {stats?.bySmallGroup && stats.bySmallGroup.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Small Group</CardTitle>
            <CardDescription>
              Small group meeting attendance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.bySmallGroup.map((group) => (
                <div
                  key={group.smallGroup}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{group.smallGroup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {group.count} check-ins
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalAttendance > 0
                              ? (group.count / stats.totalAttendance) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Latest attendance activity</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No attendance records found for the selected time range.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendance.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {record.member.firstName} {record.member.lastName}
                      </span>
                      {record.service && (
                        <Badge
                          className={getServiceTypeColor(record.service.type)}
                        >
                          {record.service.type.replace("_", " ")}
                        </Badge>
                      )}
                      {record.event && (
                        <Badge className="bg-green-100 text-green-800">
                          Event
                        </Badge>
                      )}
                      {record.ministry && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Ministry
                        </Badge>
                      )}
                      {record.smallGroup && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Small Group
                        </Badge>
                      )}
                      <Badge className={getMethodColor(record.method)}>
                        {record.method.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {format(
                          new Date(record.checkInTime),
                          "MMM dd, yyyy 'at' h:mm a"
                        )}
                      </span>
                      {record.duration && (
                        <span>Duration: {formatDuration(record.duration)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
