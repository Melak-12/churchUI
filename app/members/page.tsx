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
        <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-2 bg-blue-500 rounded-lg'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <h1 className='text-2xl font-bold text-foreground'>
                  Community Members
                </h1>
              </div>
              <p className='text-muted-foreground'>
                Connect with your church family • {members.length} members total
              </p>
            </div>
            <Button asChild className='shadow-lg'>
              <Link href='/members/new'>
                <UserPlus className='h-4 w-4 mr-2' />
                Add Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='border-l-4 border-l-green-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Paid Members</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {members.filter((m) => m.status === "PAID").length}
                  </p>
                </div>
                <Heart className='h-8 w-8 text-green-500' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-orange-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Need Follow-up
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {members.filter((m) => m.status === "DELINQUENT").length}
                  </p>
                </div>
                <AlertCircle className='h-8 w-8 text-orange-500' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-blue-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    New This Month
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {
                      members.filter((m) => {
                        const joinDate = new Date(m.createdAt);
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        return joinDate >= oneMonthAgo;
                      }).length
                    }
                  </p>
                </div>
                <UserPlus className='h-8 w-8 text-blue-500' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-purple-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Members</p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {members.length}
                  </p>
                </div>
                <Users className='h-8 w-8 text-purple-500' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
              <div className='flex flex-1 items-center space-x-4'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search members by name, email, or phone...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-40'>
                    <Filter className='h-4 w-4 mr-2' />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Members</SelectItem>
                    <SelectItem value='PAID'>Paid</SelectItem>
                    <SelectItem value='DELINQUENT'>Need Follow-up</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setViewMode("list")}
                >
                  <List className='h-4 w-4' />
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
                className='hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 group'
              >
                <CardContent className='p-6'>
                  <div className='flex items-start space-x-4'>
                    <Avatar className='h-12 w-12 border-2 border-primary/20'>
                      <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='font-semibold text-foreground truncate'>
                          {member.firstName} {member.lastName}
                        </h3>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status.charAt(0) +
                            member.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>

                      <div className='space-y-2 text-sm text-muted-foreground'>
                        <div className='flex items-center space-x-2'>
                          <Mail className='h-4 w-4' />
                          <span className='truncate'>
                            {member.email || "No email"}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Phone className='h-4 w-4' />
                          <span>{member.phone}</span>
                        </div>
                        {member.address && (
                          <div className='flex items-center space-x-2'>
                            <MapPin className='h-4 w-4' />
                            <span className='truncate'>{member.address}</span>
                          </div>
                        )}
                        <div className='flex items-center space-x-2'>
                          <Calendar className='h-4 w-4' />
                          <span>
                            Joined{" "}
                            {new Date(member.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className='mt-4 pt-4 border-t'>
                        <div className='flex space-x-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex-1'
                            asChild
                          >
                            <Link href={`/members/${member.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button size='sm' variant='outline' asChild>
                            <Link href={`mailto:${member.email}`}>
                              <Mail className='h-4 w-4' />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View - More compact for quick scanning
          <Card>
            <CardContent className='p-0'>
              <div className='divide-y'>
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='p-4 hover:bg-accent/50 transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <Avatar className='h-10 w-10'>
                          <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='flex items-center space-x-3'>
                            <h3 className='font-medium text-foreground'>
                              {member.firstName} {member.lastName}
                            </h3>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status.charAt(0) +
                                member.status.slice(1).toLowerCase()}
                            </Badge>
                          </div>
                          <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                            <span>{member.email}</span>
                            <span>{member.phone}</span>
                            <span>
                              Joined{" "}
                              {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Button size='sm' variant='outline' asChild>
                          <Link href={`/members/${member.id}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button size='sm' variant='outline' asChild>
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
          <Card>
            <CardContent className='p-12 text-center'>
              <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                No members found
              </h3>
              <p className='text-muted-foreground mb-4'>
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first member"}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
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
