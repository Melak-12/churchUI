"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/auth/feature-guard";
import { MinistryForm } from "@/components/ministries/ministry-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CreateMinistryRequest } from "@/types";
import apiClient from "@/lib/api";

export default function NewMinistryPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: CreateMinistryRequest) => {
    try {
      await apiClient.createMinistry(data);
      toast({
        title: "Success",
        description: "Ministry created successfully",
      });
      router.push("/ministries");
    } catch (error) {
      console.error("Error creating ministry:", error);
      toast({
        title: "Error",
        description: "Failed to create ministry",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push("/ministries");
  };

  return (
    <FeatureGuard feature='ministries'>
      <AuthGuard>
        <AppShell>
          <div className='space-y-6'>
            {/* Header Section */}
            <div className='bg-card rounded-xl p-6 border shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center space-x-3 mb-2'>
                    <div className='p-2 bg-green-500 rounded-lg'>
                      <Heart className='h-6 w-6 text-white' />
                    </div>
                    <h1 className='text-2xl font-bold text-foreground'>
                      Create New Ministry
                    </h1>
                  </div>
                  <p className='text-muted-foreground'>
                    Add a new ministry to serve our community together
                  </p>
                </div>
                <Button variant='outline' asChild>
                  <Link href='/ministries'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Back to Ministries
                  </Link>
                </Button>
              </div>
            </div>

            {/* Ministry Form */}
            <div className='bg-card rounded-xl border shadow-sm'>
              <MinistryForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    </FeatureGuard>
  );
}
