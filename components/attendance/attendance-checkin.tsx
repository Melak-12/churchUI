"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  UserPlus,
  MapPin,
  Smartphone,
  Monitor,
  Scan,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { Member, Attendance } from "@/types";

// Check-in form schema
const checkInSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  serviceType: z.enum(["SUNDAY_SERVICE", "WEDNESDAY_SERVICE", "SPECIAL_SERVICE", "OTHER"]),
  serviceTime: z.string().optional(),
  notes: z.string().optional(),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

interface AttendanceCheckInProps {
  onAttendanceRecorded?: (attendance: Attendance) => void;
}

export function AttendanceCheckIn({ onAttendanceRecorded }: AttendanceCheckInProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("SUNDAY_SERVICE");
  const [qrCodeActive, setQrCodeActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      memberId: "",
      serviceType: "SUNDAY_SERVICE",
      serviceTime: "",
      notes: "",
    },
  });

  // Load members and recent attendance
  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersResponse, attendanceResponse] = await Promise.all([
          apiClient.getMembers(),
          apiClient.getAttendance({
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
          }),
        ]);

        setMembers(membersResponse.members);
        setRecentAttendance(attendanceResponse.attendance || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  // Filter members based on search term
  const filteredMembers = members.filter((member) =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  const handleCheckIn = async (data: CheckInFormData) => {
    setLoading(true);
    try {
      const attendanceData = {
        member: data.memberId,
        service: {
          date: new Date().toISOString().split('T')[0],
          type: data.serviceType,
          time: data.serviceTime,
        },
        checkInTime: new Date().toISOString(),
        method: "MANUAL" as const,
        notes: data.notes,
      };

      const attendance = await apiClient.createAttendance(attendanceData);
      
      // Refresh recent attendance
      const attendanceResponse = await apiClient.getAttendance({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
      setRecentAttendance(attendanceResponse.attendance || []);

      form.reset();
      setSearchTerm("");

      if (onAttendanceRecorded) {
        onAttendanceRecorded(attendance);
      }

      toast({
        title: "Success",
        description: "Member checked in successfully",
      });
    } catch (error) {
      console.error("Error checking in member:", error);
      toast({
        title: "Error",
        description: "Failed to check in member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async (memberId: string) => {
    setLoading(true);
    try {
      const attendanceData = {
        member: memberId,
        service: {
          date: new Date().toISOString().split('T')[0],
          type: selectedService as any,
        },
        checkInTime: new Date().toISOString(),
        method: "MANUAL" as const,
      };

      const attendance = await apiClient.createAttendance(attendanceData);
      
      // Refresh recent attendance
      const attendanceResponse = await apiClient.getAttendance({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
      setRecentAttendance(attendanceResponse.attendance || []);

      if (onAttendanceRecorded) {
        onAttendanceRecorded(attendance);
      }

      toast({
        title: "Success",
        description: "Member checked in successfully",
      });
    } catch (error) {
      console.error("Error checking in member:", error);
      toast({
        title: "Error",
        description: "Failed to check in member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setQrCodeActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Error",
        description: "Unable to access camera for QR scanning",
        variant: "destructive",
      });
    }
  };

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setQrCodeActive(false);
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
        return <QrCode className="h-4 w-4" />;
      case "MOBILE_APP":
        return <Smartphone className="h-4 w-4" />;
      case "KIOSK":
        return <Monitor className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Attendance Check-in</h2>
            <p className="text-sm text-muted-foreground">
              Check in members for today's service
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUNDAY_SERVICE">Sunday Service</SelectItem>
              <SelectItem value="WEDNESDAY_SERVICE">Wednesday Service</SelectItem>
              <SelectItem value="SPECIAL_SERVICE">Special Service</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={startQRScanner}>
                <QrCode className="h-4 w-4 mr-2" />
                QR Scanner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>QR Code Scanner</DialogTitle>
                <DialogDescription>
                  Scan a member's QR code to check them in
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {qrCodeActive ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Scan className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={stopQRScanner}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Check-in</TabsTrigger>
          <TabsTrigger value="recent">Recent Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Manual Check-in Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Manual Check-in</span>
                </CardTitle>
                <CardDescription>
                  Check in a member manually using the form below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCheckIn)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="memberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.firstName} {member.lastName} - {member.phone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SUNDAY_SERVICE">Sunday Service</SelectItem>
                              <SelectItem value="WEDNESDAY_SERVICE">Wednesday Service</SelectItem>
                              <SelectItem value="SPECIAL_SERVICE">Special Service</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Time (Optional)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Additional notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Checking in...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check In Member
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Quick Member Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Quick Check-in</span>
                </CardTitle>
                <CardDescription>
                  Search and quickly check in members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredMembers.slice(0, 10).map((member) => {
                    const isCheckedIn = recentAttendance.some(
                      (attendance) => 
                        attendance.member._id === member.id && 
                        attendance.service?.date === new Date().toISOString().split('T')[0]
                    );

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.phone}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCheckedIn ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Checked In
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleQuickCheckIn(member.id)}
                              disabled={loading}
                            >
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Today's Check-ins</span>
                  </CardTitle>
                  <CardDescription>
                    Recent attendance records for today
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No check-ins recorded today</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAttendance.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {attendance.member.firstName} {attendance.member.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {attendance.member.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {getServiceTypeLabel(attendance.service?.type || 'OTHER')}
                              </div>
                              {attendance.service?.time && (
                                <div className="text-sm text-muted-foreground">
                                  {attendance.service.time}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(attendance.checkInTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(attendance.method)}
                            <span className="capitalize">{attendance.method.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Present
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
