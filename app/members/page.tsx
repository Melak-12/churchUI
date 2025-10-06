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
  Grid,
  List,
  Heart,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      member.firstName.toLowerCase().includes(search.toLowerCase()) ||
      member.lastName.toLowerCase().includes(search.toLowerCase()) ||
      member.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search);

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500 text-white";
      case "DELINQUENT":
        return "bg-red-500 text-white";
      case "PENDING":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              Oops! Something went wrong
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
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='bg-card rounded-xl p-6 border shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-2 bg-blue-500 rounded-lg shadow-md'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <h1 className='text-2xl font-bold text-foreground'>
                  Community Members 👥
                </h1>
              </div>
              <p className='text-muted-foreground'>
                Connect with your church family • 
                <span className='font-semibold text-blue-600 dark:text-blue-400 ml-1'>
                  {members.length} members
                </span> total
              </p>
            </div>
            <Button asChild className='shadow-sm'>
              <Link href='/members/new'>
                <UserPlus className='h-4 w-4 mr-2' />
                Add Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='border border-green-100 dark:border-green-900 shadow-md'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>💚 Paid Members</p>
                  <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
                    {members.filter((m) => m.status === "PAID").length}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>Active & Current</p>
                </div>
                <div className='p-3 bg-green-500 rounded-lg shadow-md'>
                  <Heart className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-orange-100 dark:border-orange-900 shadow-md'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>⚠️ Need Follow-up</p>
                  <p className='text-3xl font-bold text-orange-600 dark:text-orange-400'>
                    {members.filter((m) => m.status === "DELINQUENT").length}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>Requires Attention</p>
                </div>
                <div className='p-3 bg-orange-500 rounded-lg shadow-md'>
                  <AlertCircle className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-blue-100 dark:border-blue-900 shadow-md'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>🆕 New This Month</p>
                  <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                    {
                      members.filter((m) => {
                        const joinDate = new Date(m.createdAt);
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        return joinDate >= oneMonthAgo;
                      }).length
                    }
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>Recent Joins</p>
                </div>
                <div className='p-3 bg-blue-500 rounded-lg shadow-md'>
                  <UserPlus className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-purple-100 dark:border-purple-900 shadow-md'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>👨‍👩‍👧‍👦 Total Members</p>
                  <p className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                    {members.length}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>Our Community</p>
                </div>
                <div className='p-3 bg-purple-500 rounded-lg shadow-md'>
                  <Users className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className='border-none shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
              <div className='flex flex-1 items-center space-x-4 w-full md:w-auto'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
                  <Input
                    placeholder='🔍 Search by name, email, or phone...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='pl-10 bg-white dark:bg-gray-800 border-none shadow-sm'
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-48 bg-white dark:bg-gray-800 border-none shadow-sm'>
                    <Filter className='h-4 w-4 mr-2' />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>📊 All Members</SelectItem>
                    <SelectItem value='PAID'>💚 Paid</SelectItem>
                    <SelectItem value='DELINQUENT'>⚠️ Need Follow-up</SelectItem>
                    <SelectItem value='PENDING'>⏳ Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setViewMode("grid")}
                  className='shadow-sm'
                >
                  <Grid className='h-4 w-4 mr-2' />
                  <span className='hidden sm:inline'>Grid</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setViewMode("list")}
                  className='shadow-sm'
                >
                  <List className='h-4 w-4 mr-2' />
                  <span className='hidden sm:inline'>List</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Display */}
        {viewMode === "grid" ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className='group hover:shadow-lg transition-all duration-300 overflow-hidden'
              >
                <div className='bg-muted/50 p-4'>
                  <div className='flex items-start space-x-4'>
                    <Avatar className='h-16 w-16 border-4 border-white dark:border-gray-800 shadow-sm'>
                      <AvatarFallback className='bg-primary text-white font-bold text-lg'>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between mb-2'>
                        <h3 className='font-bold text-lg text-foreground truncate'>
                          {member.firstName} {member.lastName}
                        </h3>
                        <Badge className={`${getStatusColor(member.status)} text-xs px-2 py-1 shadow-sm`}>
                          {member.status.charAt(0) +
                            member.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className='p-5 space-y-3'>
                  <div className='space-y-2.5'>
                    <div className='flex items-center space-x-3 p-2 rounded-lg'>
                      <div className='p-1.5 bg-blue-500 rounded'>
                        <Mail className='h-3.5 w-3.5 text-white' />
                      </div>
                      <span className='text-sm truncate flex-1'>
                        {member.email || "No email"}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 p-2 rounded-lg'>
                      <div className='p-1.5 bg-green-500 rounded'>
                        <Phone className='h-3.5 w-3.5 text-white' />
                      </div>
                      <span className='text-sm font-medium'>{member.phone}</span>
                    </div>
                    {member.address && (
                      <div className='flex items-center space-x-3 p-2 rounded-lg'>
                        <div className='p-1.5 bg-purple-500 rounded'>
                          <MapPin className='h-3.5 w-3.5 text-white' />
                        </div>
                        <span className='text-sm truncate flex-1'>{member.address}</span>
                      </div>
                    )}
                    <div className='flex items-center space-x-3 p-2 rounded-lg'>
                      <div className='p-1.5 bg-orange-500 rounded'>
                        <Calendar className='h-3.5 w-3.5 text-white' />
                      </div>
                      <span className='text-sm'>
                        Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className='pt-3 border-t flex gap-2'>
                    <Button
                      size='sm'
                      className='flex-1 shadow-sm'
                      asChild
                    >
                      <Link href={`/members/${member.id}`}>
                        👤 View Profile
                      </Link>
                    </Button>
                    <Button size='sm' variant='outline' className='shadow-sm' asChild>
                      <Link href={`mailto:${member.email}`}>
                        <Mail className='h-4 w-4' />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View - More compact for quick scanning
          <Card className='overflow-hidden shadow-sm'>
            <CardContent className='p-0'>
              <div className='divide-y'>
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='p-5 hover:bg-muted/50 transition-all duration-200 group'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4 flex-1'>
                        <Avatar className='h-12 w-12 border-2 border-blue-200 dark:border-blue-800 shadow-md'>
                          <AvatarFallback className='bg-primary text-white font-semibold'>
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center space-x-3 mb-1'>
                            <h3 className='font-semibold text-foreground text-lg'>
                              {member.firstName} {member.lastName}
                            </h3>
                            <Badge className={`${getStatusColor(member.status)} text-xs px-2.5 py-0.5`}>
                              {member.status.charAt(0) +
                                member.status.slice(1).toLowerCase()}
                            </Badge>
                          </div>
                          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Mail className='h-3.5 w-3.5' />
                              {member.email || "No email"}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Phone className='h-3.5 w-3.5' />
                              {member.phone}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='h-3.5 w-3.5' />
                              Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2 ml-4'>
                        <Button size='sm' className='shadow-sm' asChild>
                          <Link href={`/members/${member.id}`}>
                            👤 View Profile
                          </Link>
                        </Button>
                        <Button size='sm' variant='outline' className='shadow-sm' asChild>
                          <Link href={`mailto:${member.email}`}>
                            <Mail className='h-4 w-4' />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredMembers.length === 0 && (
          <Card className='border-dashed border-2'>
            <CardContent className='p-12 text-center'>
              <div className='p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4'>
                <Users className='h-16 w-16 text-blue-500' />
              </div>
              <h3 className='text-xl font-bold text-foreground mb-2'>
                {search || statusFilter !== "all" ? "No Members Found" : "No Members Yet"}
              </h3>
              <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filters to find the members you're looking for. 🔍"
                  : "Start building your community by adding your first member! 🎉"}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild className='shadow-sm'>
                  <Link href='/members/new'>
                    <UserPlus className='h-4 w-4 mr-2' />
                    Add First Member
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
