"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FeatureGuard } from "@/components/feature-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { CommunicationCard } from "@/components/communications/communication-card";
import { TwilioTest } from "@/components/communications/twilio-test";
import { apiClient } from "@/lib/api";
import { Communication } from "@/types";
import {
  Plus,
  MessageSquare,
  AlertCircle,
  Filter,
  CheckCircle,
  Send,
  Users,
  Calendar,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function CommunicationsPage() {
  const searchParams = useSearchParams();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filteredCommunications, setFilteredCommunications] = useState<
    Communication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [communicationToDelete, setCommunicationToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle success messages from URL parameters and localStorage fallback
  useEffect(() => {
    const message = searchParams.get("message");
    const localStorageMessage = localStorage.getItem("communicationSuccess");

    console.log("URL search params:", searchParams.toString());
    console.log("Message parameter:", message);
    console.log("localStorage message:", localStorageMessage);

    const finalMessage = message || localStorageMessage;

    if (finalMessage === "scheduled") {
      console.log("Setting scheduled success message");
      setSuccessMessage(
        "Communication scheduled successfully! It will be sent at the specified time."
      );
      // Clear localStorage
      localStorage.removeItem("communicationSuccess");
    } else if (finalMessage === "sent") {
      console.log("Setting sent success message");
      setSuccessMessage("Communication sent successfully!");
      // Clear localStorage
      localStorage.removeItem("communicationSuccess");
    } else if (finalMessage === "updated") {
      console.log("Setting updated success message");
      setSuccessMessage("Communication updated successfully!");
    }

    // Clear success message after 5 seconds
    if (finalMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getCommunications();
        setCommunications(data.communications);
        setFilteredCommunications(data.communications);
      } catch (err: any) {
        setError(err.message || "Failed to load communications");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  // Filter communications based on status
  useEffect(() => {
    console.log(
      "Filter useEffect running - communications count:",
      communications.length,
      "statusFilter:",
      statusFilter
    );
    console.log(
      "Communication IDs:",
      communications.map((c) => c.id)
    );
    console.log(
      "Communication names:",
      communications.map((c) => c.name)
    );

    if (statusFilter === "ALL") {
      setFilteredCommunications(communications);
      console.log(
        "Set filteredCommunications to all communications:",
        communications.length
      );
    } else {
      const filtered = communications.filter(
        (comm) => comm.status === statusFilter
      );
      setFilteredCommunications(filtered);
      console.log("Set filteredCommunications to filtered:", filtered.length);
      console.log(
        "Filtered communication IDs:",
        filtered.map((c) => c.id)
      );
      console.log(
        "Filtered communication names:",
        filtered.map((c) => c.name)
      );
    }
  }, [communications, statusFilter]);

  const handleSend = async (id: string) => {
    try {
      await apiClient.sendCommunication(id);
      // Refresh the list
      const data = await apiClient.getCommunications();
      setCommunications(data.communications);
    } catch (err: any) {
      setError(err.message || "Failed to send communication");
    }
  };

  const handleDeleteClick = (id: string) => {
    setCommunicationToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!communicationToDelete || isDeleting) return;

    // Find the communication being deleted for debugging
    const communicationToDeleteObj = communications.find(
      (c) => c.id === communicationToDelete
    );
    console.log("Deleting communication:", {
      id: communicationToDelete,
      name: communicationToDeleteObj?.name,
      status: communicationToDeleteObj?.status,
      createdAt: communicationToDeleteObj?.createdAt,
    });
    console.log("Current communications count:", communications.length);
    console.log(
      "Current filtered communications count:",
      filteredCommunications.length
    );

    setIsDeleting(true);
    try {
      await apiClient.deleteCommunication(communicationToDelete);
      console.log("Delete API call successful");

      // Small delay to ensure backend has processed the deletion
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force a complete refresh by refetching from API with cache busting
      console.log("Refetching communications after delete...");
      const response = await apiClient.getCommunications({ cacheBust: true });
      const freshCommunications = response.communications || [];

      console.log("Fresh communications count:", freshCommunications.length);
      console.log(
        "Fresh communication IDs:",
        freshCommunications.map((c) => c.id)
      );

      // Update state with fresh data
      setCommunications(freshCommunications);

      // Force re-render with a more aggressive approach
      setRefreshKey(Date.now());
      console.log(
        "Communications refreshed and refresh key set to:",
        Date.now()
      );

      // Close modal and clear selection
      setDeleteModalOpen(false);
      setCommunicationToDelete(null);

      console.log("State updated successfully");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete communication");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCommunicationToDelete(null);
  };

  if (loading) {
    return (
      <AppShell>
        <div className='space-y-6'>
          <div className='space-y-6'>
            <div className='flex items-start justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Communications
                </h1>
                <p className='text-gray-600 mt-1'>
                  Manage SMS campaigns and member outreach
                </p>
              </div>
              <Skeleton className='h-9 w-32' />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-2 flex-1'>
                      <Skeleton className='h-6 w-3/4' />
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-2/3' />
                    </div>
                    <Skeleton className='h-6 w-16' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                  <Skeleton className='h-2 w-full' />
                  <div className='flex space-x-2'>
                    <Skeleton className='h-8 w-20' />
                    <Skeleton className='h-8 w-16' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <FeatureGuard feature='communications'>
      <AppShell>
        <div className='space-y-4 sm:space-y-6'>
          {/* Header Section */}
          <div className='flex flex-col gap-3 sm:gap-4'>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold'>
                Communications
              </h1>
              <p className='text-sm text-muted-foreground'>
                Stay connected with your community through SMS campaigns
              </p>
            </div>
            <div className='flex flex-col sm:flex-row gap-2'>
              <TwilioTest />
              <Button asChild className='w-full sm:w-auto sm:max-w-fit'>
                <Link href='/communications/new'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Campaign
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Filter className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Filter by status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue placeholder='All' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All</SelectItem>
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='SCHEDULED'>Scheduled</SelectItem>
                    <SelectItem value='SENDING'>Sending</SelectItem>
                    <SelectItem value='SENT'>Sent</SelectItem>
                    <SelectItem value='FAILED'>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className='border-green-200 bg-green-50 text-green-800'>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Communications Grid */}
          {filteredCommunications.length > 0 ? (
            <div
              key={`grid-${refreshKey}`}
              className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            >
              {filteredCommunications.map((communication, index) => (
                <CommunicationCard
                  key={`comm-${communication.id}-${communication.status}-${communication.createdAt}-${index}`}
                  communication={communication}
                  onSend={handleSend}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <Card className='border-dashed border-2 border-gray-200 dark:border-gray-700'>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-4'>
                  <MessageSquare className='h-8 w-8 text-purple-500' />
                </div>
                <h3 className='text-lg font-medium text-foreground mb-2'>
                  {statusFilter === "ALL"
                    ? "Ready to connect?"
                    : `No ${statusFilter.toLowerCase()} campaigns found`}
                </h3>
                <p className='text-muted-foreground text-center mb-6 max-w-md'>
                  {statusFilter === "ALL"
                    ? "Start reaching your community with personalized SMS campaigns. From event reminders to prayer requests!"
                    : `No campaigns found with "${statusFilter.toLowerCase()}" status. Try adjusting your filter or create a new campaign.`}
                </p>
                <Button className='shadow-sm' asChild>
                  <Link href='/communications/new'>
                    <Plus className='h-4 w-4 mr-2' />
                    {statusFilter === "ALL"
                      ? "Create Your First Campaign"
                      : "Create New Campaign"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title='Delete Communication'
            description='Are you sure you want to delete this communication? This action cannot be undone.'
            confirmText='Delete'
            cancelText='Cancel'
            variant='danger'
            icon='communication'
            isLoading={isDeleting}
          />
        </div>
      </AppShell>
    </FeatureGuard>
  );
}
