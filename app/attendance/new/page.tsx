"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/auth/feature-guard";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CreateAttendanceRequest } from "@/types";
import apiClient from "@/lib/api";

export default function NewAttendancePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: CreateAttendanceRequest) => {
    try {
      await apiClient.createAttendance(data);
      toast({
        title: "Success",
        description: "Attendance record created successfully",
      });
      router.push("/attendance");
    } catch (error) {
      console.error("Error creating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to create attendance record",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push("/attendance");
  };

  return (
    <FeatureGuard feature='attendance'>
      <AuthGuard>
        <AppShell>
          <div className='space-y-6'>
            {/* Header Section */}
            <div className='bg-card rounded-xl p-6 border shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center space-x-3 mb-2'>
                    <div className='p-2 bg-emerald-500 rounded-lg'>
                      <UserCheck className='h-6 w-6 text-white' />
                    </div>
                    <h1 className='text-2xl font-bold text-foreground'>
                      Quick Check-In
                    </h1>
                  </div>
                  <p className='text-muted-foreground'>
                    Record member attendance for events, services, and
                    activities
                  </p>
                </div>
                <Button variant='outline' asChild>
                  <Link href='/attendance'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Back to Attendance
                  </Link>
                </Button>
              </div>
            </div>

            {/* Attendance Form */}
            <div className='bg-card rounded-xl border shadow-sm'>
              <AttendanceForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    </FeatureGuard>
  );
}
