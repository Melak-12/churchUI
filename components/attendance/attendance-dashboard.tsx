"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  LineChart,
  Clock,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { Attendance } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AttendanceStats {
  totalAttendance: number;
  todayAttendance: number;
  weeklyAverage: number;
  monthlyAverage: number;
  attendanceTrend: number;
  topAttendees: Array<{
    member: {
      firstName: string;
      lastName: string;
      phone: string;
    };
    attendanceCount: number;
  }>;
  serviceBreakdown: Array<{
    serviceType: string;
    count: number;
  }>;
  weeklyData: Array<{
    date: string;
    count: number;
  }>;
  monthlyData: Array<{
    month: string;
    count: number;
  }>;
}

export function AttendanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [dateRange, setDateRange] = useState("week");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const { toast } = useToast();

  useEffect(() => {
    loadAttendanceData();
  }, [dateRange, serviceFilter]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const params: any = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      if (serviceFilter !== "all") {
        params.serviceType = serviceFilter;
      }

      const [attendanceResponse, statsResponse] = await Promise.all([
        apiClient.getAttendance(params),
        apiClient.getAttendanceStats(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
      ]);

      setAttendance(attendanceResponse.attendance || []);
      setStats(statsResponse);
    } catch (error) {
      console.error("Error loading attendance data:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      // This would typically generate and download a CSV/Excel file
      toast({
        title: "Export Started",
        description: "Attendance report is being generated...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export attendance data",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceTypeLabel = (type: string) => {
    const labels = {
      SUNDAY_SERVICE: "Sunday Service",
      WEDNESDAY_SERVICE: "Wednesday Service",
      SPECIAL_SERVICE: "Special Service",
      OTHER: "Other",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "QR_CODE":
        return "📱";
      case "MOBILE_APP":
        return "📲";
      case "KIOSK":
        return "🖥️";
      default:
        return "✋";
    }
  };

  // Chart data
  const chartData = {
    labels: stats?.weeklyData?.map(item => formatDate(item.date)) || [],
    datasets: [
      {
        label: 'Attendance',
        data: stats?.weeklyData?.map(item => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Attendance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading attendance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
            <div>
            <h2 className="text-xl font-semibold">Attendance Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Track and analyze member attendance
            </p>
          </div>
            </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
                </SelectTrigger>
                <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="SUNDAY_SERVICE">Sunday Service</SelectItem>
              <SelectItem value="WEDNESDAY_SERVICE">Wednesday Service</SelectItem>
              <SelectItem value="SPECIAL_SERVICE">Special Service</SelectItem>
                </SelectContent>
              </Select>
          
          <Button variant="outline" onClick={loadAttendanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
          
          <Button onClick={exportAttendance}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Todays Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date().toISOString())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.weeklyAverage || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyAverage || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
                  Attendance over the selected time period
            </CardDescription>
                  </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  <LineChart className="h-4 w-4" />
                </Button>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
            {chartType === "bar" ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
            <CardDescription>
              Attendance by service type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.serviceBreakdown?.map((service) => (
                <div key={service.serviceType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">
                      {getServiceTypeLabel(service.serviceType)}
                    </span>
                    </div>
                  <Badge variant="secondary">{service.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Attendees */}
        <Card>
          <CardHeader>
          <CardTitle>Top Attendees</CardTitle>
            <CardDescription>
            Members with highest attendance rates
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Attendance Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.topAttendees?.slice(0, 10).map((attendee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {attendee.member.firstName} {attendee.member.lastName}
                  </TableCell>
                  <TableCell>{attendee.member.phone}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{attendee.attendanceCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Regular
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardContent>
        </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>
            Latest attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.slice(0, 20).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {record.member.firstName} {record.member.lastName}
            </div>
                      <div className="text-sm text-muted-foreground">
                        {record.member.phone}
                    </div>
                  </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getServiceTypeLabel(record.service?.type || 'OTHER')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(record.service?.date || record.checkInTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(record.checkInTime)}</span>
                  </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{getMethodIcon(record.method)}</span>
                      <span className="capitalize">{record.method.replace('_', ' ')}</span>
                </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Present
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
