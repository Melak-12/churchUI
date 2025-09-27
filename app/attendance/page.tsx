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
import {
  Plus,
  Users,
  BarChart3,
  Calendar,
  Check,
  Clock,
  UserCheck,
} from "lucide-react";
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
    <FeatureGuard feature='attendance'>
      <AuthGuard>
        <AppShell>
          <div className='space-y-6'>
            {/* Header Section */}
            <div className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center space-x-3 mb-2'>
                    <div className='p-2 bg-emerald-500 rounded-lg'>
                      <UserCheck className='h-6 w-6 text-white' />
                    </div>
                    <h1 className='text-2xl font-bold text-foreground'>
                      Attendance Tracker 📋
                    </h1>
                  </div>
                  <p className='text-muted-foreground'>
                    Keep track of member participation and engagement
                  </p>
                </div>
                <Button
                  className='shadow-lg'
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Quick Check-In
                </Button>
              </div>
            </div>

            <Tabs defaultValue='list' className='space-y-6'>
              <div className='bg-card rounded-xl p-4 border'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='list' className='flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    <span className='hidden sm:inline'>Records</span>
                    <span className='sm:hidden'>List</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='dashboard'
                    className='flex items-center gap-2'
                  >
                    <BarChart3 className='h-4 w-4' />
                    <span className='hidden sm:inline'>Analytics</span>
                    <span className='sm:hidden'>Stats</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='services'
                    className='flex items-center gap-2'
                  >
                    <Calendar className='h-4 w-4' />
                    <span className='hidden sm:inline'>Services</span>
                    <span className='sm:hidden'>Services</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='checkin'
                    className='flex items-center gap-2'
                  >
                    <Check className='h-4 w-4' />
                    <span className='hidden sm:inline'>Check-In</span>
                    <span className='sm:hidden'>Check</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value='list' className='space-y-4'>
                <AttendanceList
                  attendance={attendance}
                  loading={loading}
                  onEdit={setEditingAttendance}
                  onDelete={handleDeleteAttendance}
                  onCheckOut={handleCheckOut}
                  onRefresh={fetchAttendance}
                />
              </TabsContent>

              <TabsContent value='dashboard' className='space-y-4'>
                <AttendanceDashboard />
              </TabsContent>

              <TabsContent value='services' className='space-y-4'>
                <div className='bg-card rounded-xl border'>
                  <div className='text-center py-12'>
                    <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 w-fit mx-auto'>
                      <Calendar className='h-8 w-8 text-blue-500' />
                    </div>
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      Service Tracking Coming Soon! 🎯
                    </h3>
                    <p className='text-muted-foreground max-w-md mx-auto'>
                      Enhanced service attendance tracking with automated
                      check-ins and detailed analytics is in development.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='checkin' className='space-y-4'>
                <div className='bg-card rounded-xl border'>
                  <div className='text-center py-12'>
                    <div className='p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4 w-fit mx-auto'>
                      <Check className='h-8 w-8 text-emerald-500' />
                    </div>
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      Quick Check-In Interface! ⚡
                    </h3>
                    <p className='text-muted-foreground max-w-md mx-auto'>
                      A streamlined check-in experience for faster member
                      registration at events and services is coming soon.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Create Attendance Dialog */}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogContent className='max-w-2xl'>
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
              <DialogContent className='max-w-2xl'>
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
