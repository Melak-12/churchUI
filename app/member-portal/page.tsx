"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/auth/feature-guard";
import { FamilyManagement } from "@/components/member-portal/family-management";
import { DocumentLibrary } from "@/components/member-portal/document-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Calendar, CreditCard } from "lucide-react";

export default function MemberPortalPage() {
  return (
    <FeatureGuard feature="memberPortal">
      <AuthGuard>
        <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Member Portal</h1>
            <p className="text-gray-600">
              Manage your family information and access church resources
            </p>
          </div>

          <Tabs defaultValue="family" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="family" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Family Information
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Document Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="family" className="space-y-4">
              <FamilyManagement />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <DocumentLibrary />
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </AuthGuard>
    </FeatureGuard>
  );
}




