"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/auth/feature-guard";
import { MinistryDashboard } from "@/components/ministries/ministry-dashboard";
import { MinistryList } from "@/components/ministries/ministry-list";
import { MinistryForm } from "@/components/ministries/ministry-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, BarChart3, Settings } from "lucide-react";
import { Ministry, CreateMinistryRequest } from "@/types";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function MinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const { toast } = useToast();

  const fetchMinistries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMinistries();
      setMinistries(response.ministries);
    } catch (error) {
      console.error("Error fetching ministries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ministries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMinistries();
  }, [fetchMinistries]);

  const handleCreateMinistry = async (data: CreateMinistryRequest) => {
    try {
      await apiClient.createMinistry(data);
      toast({
        title: "Success",
        description: "Ministry created successfully",
      });
      setShowCreateForm(false);
      fetchMinistries();
    } catch (error) {
      console.error("Error creating ministry:", error);
      toast({
        title: "Error",
        description: "Failed to create ministry",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMinistry = async (
    id: string,
    data: Partial<CreateMinistryRequest>
  ) => {
    try {
      await apiClient.updateMinistry(id, data);
      toast({
        title: "Success",
        description: "Ministry updated successfully",
      });
      setEditingMinistry(null);
      fetchMinistries();
    } catch (error) {
      console.error("Error updating ministry:", error);
      toast({
        title: "Error",
        description: "Failed to update ministry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMinistry = async (id: string) => {
    try {
      await apiClient.deleteMinistry(id);
      toast({
        title: "Success",
        description: "Ministry deleted successfully",
      });
      fetchMinistries();
    } catch (error) {
      console.error("Error deleting ministry:", error);
      toast({
        title: "Error",
        description: "Failed to delete ministry",
        variant: "destructive",
      });
    }
  };

  return (
    <FeatureGuard feature="ministries">
      <AuthGuard>
        <AppShell>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Ministries
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Manage church ministries and small groups
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Ministry</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ministries
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <MinistryList
                  ministries={ministries}
                  loading={loading}
                  onEdit={setEditingMinistry}
                  onDelete={handleDeleteMinistry}
                  onRefresh={fetchMinistries}
                />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4">
                <MinistryDashboard />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Ministry settings coming soon...
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Create Ministry Dialog */}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Ministry</DialogTitle>
                </DialogHeader>
                <MinistryForm
                  onSubmit={handleCreateMinistry}
                  onCancel={() => setShowCreateForm(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Ministry Dialog */}
            <Dialog
              open={!!editingMinistry}
              onOpenChange={() => setEditingMinistry(null)}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Ministry</DialogTitle>
                </DialogHeader>
                {editingMinistry && (
                  <MinistryForm
                    initialData={editingMinistry}
                    onSubmit={(data) =>
                      handleUpdateMinistry(editingMinistry.id, data)
                    }
                    onCancel={() => setEditingMinistry(null)}
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
