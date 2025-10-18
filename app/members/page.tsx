"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Member } from "@/types";
import apiClient from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";


export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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


  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
      (member.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
      (member.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (member.phone || "").includes(search);

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/50 font-normal";
      case "DELINQUENT":
        return "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/50 font-normal";
      case "PENDING":
        return "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50 font-normal";
      default:
        return "bg-muted font-normal";
    }
  };
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = (firstName || "").charAt(0);
    const last = (lastName || "").charAt(0);
    return `${first}${last}`.toUpperCase() || "??";
  };

  if (loading) {
    return (
      <AppShell>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-6 w-6 animate-spin text-primary' />
            <span className='text-muted-foreground'>
              Loading your community members...
            </span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              Something went wrong
            </h3>
            <p className='text-muted-foreground mb-6'>{error}</p>
            <Button onClick={fetchMembers} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className='space-y-3'>
        {/* Compact Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-semibold'>Members</h1>
            <p className='text-xs text-muted-foreground'>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size='sm' asChild>
            <Link href='/members/new'>
              <UserPlus className='h-4 w-4 mr-1' />
              Add
            </Link>
          </Button>
        </div>

        {/* Compact Stats Row */}
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center'>
            <div className='text-lg font-bold text-green-700 dark:text-green-400'>
              {members.filter((m) => m.status === "PAID").length}
            </div>
            <div className='text-xs text-green-600 dark:text-green-300'>Paid</div>
          </div>
          <div className='bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 text-center'>
            <div className='text-lg font-bold text-orange-700 dark:text-orange-400'>
              {members.filter((m) => m.status === "DELINQUENT").length}
            </div>
            <div className='text-xs text-orange-600 dark:text-orange-300'>Behind</div>
          </div>
          <div className='bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center'>
            <div className='text-lg font-bold text-blue-700 dark:text-blue-400'>
              {members.filter((m) => {
                const joinDate = new Date(m.createdAt);
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                return joinDate >= oneMonthAgo;
              }).length}
            </div>
            <div className='text-xs text-blue-600 dark:text-blue-300'>New</div>
          </div>
        </div>

        {/* Compact Search and Filter */}
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search members...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-8 h-8 text-sm'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-24 h-8 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='PAID'>Paid</SelectItem>
              <SelectItem value='DELINQUENT'>Behind</SelectItem>
              <SelectItem value='PENDING'>Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compact Members List */}
        <div className='space-y-2'>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className='bg-card border rounded-lg p-3 hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3 flex-1 min-w-0'>
                  <Avatar className='h-10 w-10 flex-shrink-0'>
                    <AvatarFallback className='bg-primary text-white text-sm font-semibold'>
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <h3 className='font-semibold text-sm truncate'>
                        {member.firstName || ""} {member.lastName || ""}
                      </h3>
                      <Badge
                        className={`${getStatusColor(
                          member.status
                        )} text-xs px-1.5 py-0.5`}
                      >
                        {member.status.charAt(0) + member.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <div className='flex items-center space-x-3 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Phone className='h-3 w-3' />
                        {member.phone}
                      </span>
                      {member.email && (
                        <span className='flex items-center gap-1'>
                          <Mail className='h-3 w-3' />
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex items-center space-x-1 ml-2'>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-8 w-8 p-0'
                    asChild
                  >
                    <Link href={`/members/${member.id}`}>
                      <User className='h-4 w-4' />
                    </Link>
                  </Button>
                  {member.email && (
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0'
                      asChild
                    >
                      <Link href={`mailto:${member.email}`}>
                        <Mail className='h-4 w-4' />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className='text-center py-8'>
            <Users className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
            <h3 className='font-semibold text-foreground mb-1'>
              {search || statusFilter !== "all" ? "No Members Found" : "No Members Yet"}
            </h3>
            <p className='text-sm text-muted-foreground mb-4'>
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start building your community"}
            </p>
            {!search && statusFilter === "all" && (
              <Button size='sm' asChild>
                <Link href='/members/new'>
                  <UserPlus className='h-4 w-4 mr-2' />
                  Add First Member
                </Link>
              </Button>
            )}
          </div>
        )}

      </div>
    </AppShell>
  );
}
