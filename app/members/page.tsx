"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MemberTable } from "@/components/members/member-table";
import { Member } from "@/types";
import apiClient from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await apiClient.getMembers({
        _t: Date.now(), // Cache busting parameter
      } as any);

      // Transform member data to ensure proper ID format
      const transformedMembers = response.members
        .map((member) => ({
          ...member,
          id: getDocumentId(member),
        }))
        .filter((member) => member.id); // Filter out members without valid IDs

      setMembers(transformedMembers);
    } catch (err: any) {
      setError(err.message || "Failed to load members");
      console.error("Members fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleMemberDeleted = () => {
    fetchMembers(); // Refresh the list after deletion
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading members...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <MemberTable members={members} onMemberDeleted={handleMemberDeleted} />
    </AppShell>
  );
}
