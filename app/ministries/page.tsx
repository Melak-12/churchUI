"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/feature-guard";
import { MinistryDashboard } from "@/components/ministries/ministry-dashboard";
import { MinistryList } from "@/components/ministries/ministry-list";
import { MinistryForm } from "@/components/ministries/ministry-form";
import { MinistrySettings } from "@/components/ministries/ministry-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, BarChart3, Settings, Heart, Zap } from "lucide-react";
import {
  Ministry,
  CreateMinistryRequest,
  UpdateMinistryRequest,
} from "@/types";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function MinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const { toast } = useToast();

  const fetchMinistries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMinistries();
      setMinistries(response?.ministries || []);
    } catch (error) {
      console.error("Error fetching ministries:", error);
      setMinistries([]); // Set empty array on error
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

  const handleUpdateMinistry = async (
    id: string,
    data: Partial<CreateMinistryRequest>
  ) => {
    try {
      // Ensure budget has required spent field if budget is provided
      const updateData = {
        ...data,
        budget: data.budget
          ? {
              allocated: data.budget.allocated,
              currency: data.budget.currency,
              spent: 0, // Default spent to 0 for updates
            }
          : undefined,
      } as UpdateMinistryRequest;

      await apiClient.updateMinistry(id, updateData);
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
            {/* Header Section */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Ministry Hub
                    </h1>
                  </div>
                  <p className="text-muted-foreground">
                    Serving our community together through various ministries
                  </p>
                </div>
                <Button className="shadow-sm" asChild>
                  <Link href="/ministries/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Ministry
                  </Link>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
              <div className="bg-card rounded-xl p-4 border">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Ministries</span>
                    <span className="sm:hidden">List</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="dashboard"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                    <span className="sm:hidden">Config</span>
                  </TabsTrigger>
                </TabsList>
              </div>

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
                <MinistrySettings />
              </TabsContent>
            </Tabs>

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
