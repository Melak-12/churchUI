"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/feature-guard";
import { AttendanceCheckIn } from "@/components/attendance/attendance-checkin";
import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  BarChart3,
  QrCode,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Attendance } from "@/types";

export default function AttendancePage() {
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);

  const handleAttendanceRecorded = (attendance: Attendance) => {
    setRecentAttendance((prev) => [attendance, ...prev.slice(0, 9)]);
  };

  return (
    <FeatureGuard feature="attendance">
      <AuthGuard>
        <AppShell>
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Attendance Management
                    </h1>
                  </div>
                  <p className="text-muted-foreground">
                    Track member attendance and service participation
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Service
                  </Button>
                  <Button size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Codes
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">
                      Today's Check-ins
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">
                      Total Members
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0%</div>
                    <div className="text-sm text-muted-foreground">
                      Attendance Rate
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">
                      Services This Week
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="checkin" className="space-y-6">
              <div className="bg-card rounded-xl p-4 border">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="checkin"
                    className="flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Check-in</span>
                    <span className="sm:hidden">Check-in</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="dashboard"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="checkin" className="space-y-4">
                <AttendanceCheckIn
                  onAttendanceRecorded={handleAttendanceRecorded}
                />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4">
                <AttendanceDashboard />
              </TabsContent>
            </Tabs>

            {/* Recent Activity Sidebar */}
            {recentAttendance.length > 0 && (
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
                <div className="space-y-3">
                  {recentAttendance.slice(0, 5).map((attendance) => (
                    <div
                      key={attendance.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {attendance.member.firstName}{" "}
                            {attendance.member.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attendance.service?.type?.replace("_", " ") ||
                              "Service"}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(attendance.checkInTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AppShell>
      </AuthGuard>
    </FeatureGuard>
  );
}
