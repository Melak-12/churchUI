"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/auth/feature-guard";
import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";
import { AttendanceList } from "@/components/attendance/attendance-list";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, BarChart3, Calendar, CheckIn } from "lucide-react";
import { Attendance, CreateAttendanceRequest } from "@/types";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null
  );
  const { toast } = useToast();

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAttendance();
      setAttendance(response.attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleCreateAttendance = async (data: CreateAttendanceRequest) => {
    try {
      await apiClient.createAttendance(data);
      toast({
        title: "Success",
        description: "Attendance record created successfully",
      });
      setShowCreateForm(false);
      fetchAttendance();
    } catch (error) {
      console.error("Error creating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to create attendance record",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAttendance = async (
    id: string,
    data: Partial<CreateAttendanceRequest>
  ) => {
    try {
      await apiClient.updateAttendance(id, data);
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
      setEditingAttendance(null);
      fetchAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      await apiClient.deleteAttendance(id);
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });
      fetchAttendance();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to delete attendance record",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await apiClient.checkOutAttendance(id);
      toast({
        title: "Success",
        description: "Successfully checked out",
      });
      fetchAttendance();
    } catch (error) {
      console.error("Error checking out:", error);
      toast({
        title: "Error",
        description: "Failed to check out",
        variant: "destructive",
      });
    }
  };

  return (
    <FeatureGuard feature="attendance">
      <AuthGuard>
        <AppShell>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Attendance
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Track member attendance at services, events, and meetings
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Check In</span>
                  <span className="sm:hidden">Check In</span>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Records
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="checkin"
                  className="flex items-center gap-2"
                >
                  <CheckIn className="h-4 w-4" />
                  Quick Check-In
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <AttendanceList
                  attendance={attendance}
                  loading={loading}
                  onEdit={setEditingAttendance}
                  onDelete={handleDeleteAttendance}
                  onCheckOut={handleCheckOut}
                  onRefresh={fetchAttendance}
                />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4">
                <AttendanceDashboard />
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Service attendance tracking coming soon...
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="checkin" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Quick check-in interface coming soon...
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Create Attendance Dialog */}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Check In Member</DialogTitle>
                </DialogHeader>
                <AttendanceForm
                  onSubmit={handleCreateAttendance}
                  onCancel={() => setShowCreateForm(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Attendance Dialog */}
            <Dialog
              open={!!editingAttendance}
              onOpenChange={() => setEditingAttendance(null)}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Attendance Record</DialogTitle>
                </DialogHeader>
                {editingAttendance && (
                  <AttendanceForm
                    initialData={editingAttendance}
                    onSubmit={(data) =>
                      handleUpdateAttendance(editingAttendance.id, data)
                    }
                    onCancel={() => setEditingAttendance(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </AppShell>
      </AuthGuard>
    </FeatureGuard>
  );
}
