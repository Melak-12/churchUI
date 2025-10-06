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
  UserCheck,
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
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading attendance records...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Modern Filters Card */}
      <Card className='border-none shadow-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-emerald-500 rounded-lg'>
                <Search className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle className='text-lg'>Search & Filter</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {filteredAttendance.length} of {attendance.length} records
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={onRefresh}
              disabled={loading}
              className='bg-white dark:bg-gray-800 shadow-sm'
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='🔍 Search by member, event, or ministry...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 bg-white dark:bg-gray-800 border-none shadow-sm'
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-full sm:w-48 bg-white dark:bg-gray-800 border-none shadow-sm'>
                <SelectValue placeholder='📋 All Types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>📋 All Types</SelectItem>
                <SelectItem value='service'>⛪ Services</SelectItem>
                <SelectItem value='event'>🎉 Events</SelectItem>
                <SelectItem value='ministry'>❤️ Ministries</SelectItem>
                <SelectItem value='smallGroup'>👥 Small Groups</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full sm:w-48 bg-white dark:bg-gray-800 border-none shadow-sm'>
                <SelectValue placeholder='✅ All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>✅ All Status</SelectItem>
                <SelectItem value='checked-in'>🟢 Checked In</SelectItem>
                <SelectItem value='checked-out'>🔵 Checked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAttendance.length === 0 ? (
        <Card className='border-dashed border-2'>
          <CardContent className='text-center py-12'>
            <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-4'>
              <UserCheck className='h-12 w-12 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>
              {attendance.length === 0 ? "No Records Yet" : "No Matches Found"}
            </h3>
            <p className='text-muted-foreground max-w-md mx-auto'>
              {attendance.length === 0
                ? "Check in your first member to get started tracking attendance! 📋"
                : "Try adjusting your search or filter criteria. 🔍"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {filteredAttendance.map((record) => (
            <Card
              key={record.id}
              className='group hover:shadow-md transition-all duration-300 overflow-hidden'
            >
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-4 flex-1'>
                    {/* Header with User Info */}
                    <div className='flex flex-wrap items-center gap-2'>
                      <div className='flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg'>
                        <User className='h-5 w-5 text-emerald-600' />
                        <span className='font-semibold text-lg'>
                          {record.member.firstName} {record.member.lastName}
                        </span>
                      </div>
                      <Badge
                        className={`${getTypeColor(
                          record
                        )} text-xs font-medium px-3 py-1`}
                      >
                        {getTypeLabel(record)}
                      </Badge>
                      <Badge
                        className={`${getMethodColor(
                          record.method
                        )} text-xs px-3 py-1`}
                      >
                        {record.method.replace("_", " ")}
                      </Badge>
                      {record.checkOutTime ? (
                        <Badge className='bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs px-3 py-1'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          Checked Out
                        </Badge>
                      ) : (
                        <Badge className='bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs px-3 py-1 animate-pulse'>
                          <Clock className='h-3 w-3 mr-1' />
                          Active
                        </Badge>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg'>
                      {/* Event/Service Details */}
                      <div className='space-y-2'>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
                          📍 Location
                        </p>
                        {record.event && (
                          <div className='flex items-start gap-2 text-sm'>
                            <Calendar className='h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                Event
                              </p>
                              <p className='font-medium'>
                                {record.event.title}
                              </p>
                            </div>
                          </div>
                        )}
                        {record.service && (
                          <div className='flex items-start gap-2 text-sm'>
                            <Calendar className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                Service
                              </p>
                              <p className='font-medium'>
                                {record.service.type.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        )}
                        {record.ministry && (
                          <div className='flex items-start gap-2 text-sm'>
                            <MapPin className='h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                Ministry
                              </p>
                              <p className='font-medium'>
                                {record.ministry.name}
                              </p>
                            </div>
                          </div>
                        )}
                        {record.smallGroup && (
                          <div className='flex items-start gap-2 text-sm'>
                            <MapPin className='h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                Small Group
                              </p>
                              <p className='font-medium'>
                                {record.smallGroup.name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Time Details */}
                      <div className='space-y-2'>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
                          ⏰ Timeline
                        </p>
                        <div className='flex items-start gap-2 text-sm'>
                          <Clock className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                          <div>
                            <p className='text-xs text-muted-foreground'>
                              Check In
                            </p>
                            <p className='font-medium'>
                              {format(
                                new Date(record.checkInTime),
                                "MMM dd, h:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                        {record.checkOutTime && (
                          <div className='flex items-start gap-2 text-sm'>
                            <Clock className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                Check Out
                              </p>
                              <p className='font-medium'>
                                {format(
                                  new Date(record.checkOutTime),
                                  "MMM dd, h:mm a"
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        {record.duration && (
                          <div className='flex items-start gap-2 text-sm'>
                            <Clock className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                Duration
                              </p>
                              <p className='font-medium font-mono'>
                                {formatDuration(record.duration)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className='space-y-2'>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
                          ℹ️ Details
                        </p>
                        <div className='flex items-start gap-2 text-sm'>
                          <User className='h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0' />
                          <div>
                            <p className='text-xs text-muted-foreground'>
                              Recorded by
                            </p>
                            <p className='font-medium'>
                              {record.recordedBy.firstName}{" "}
                              {record.recordedBy.lastName}
                            </p>
                          </div>
                        </div>
                        {record.notes && (
                          <div className='bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800'>
                            <p className='text-xs text-muted-foreground mb-1'>
                              📝 Notes:
                            </p>
                            <p className='text-sm font-medium'>
                              {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-start gap-2 ml-4'>
                    {!record.checkOutTime && (
                      <Button
                        size='sm'
                        className='bg-green-600 hover:bg-green-700 shadow-sm'
                        onClick={() => onCheckOut(record.id)}
                      >
                        <CheckCircle className='h-4 w-4 mr-2' />
                        Check Out
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='shadow-sm'
                        >
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40'>
                        <DropdownMenuItem
                          onClick={() => onEdit(record)}
                          className='cursor-pointer'
                        >
                          <Edit className='h-4 w-4 mr-2 text-blue-500' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(record.id)}
                          className='text-red-600 cursor-pointer'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
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
