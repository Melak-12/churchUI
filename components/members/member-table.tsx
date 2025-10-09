"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  Upload,
  Download,
  Mail,
  Users,
  Trash2,
  Loader2,
} from "lucide-react";
import { StatusBadge, EligibilityBadge } from "@/components/ui/status-badge";
import { Member } from "@/types";
import apiClient from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import Link from "next/link";

interface MemberTableProps {
  members: Member[];
  onMemberDeleted?: () => void;
}

export function MemberTable({ members, onMemberDeleted }: MemberTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${memberName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(memberId);
      await apiClient.deleteMember(memberId);
      if (onMemberDeleted) {
        onMemberDeleted();
      }
    } catch (error) {
      console.error("Failed to delete member:", error);
      alert("Failed to delete member. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
      (member.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search) ||
      member.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && member.status === "PAID") ||
      (statusFilter === "delinquent-30" &&
        member.status === "DELINQUENT" &&
        member.delinquencyDays <= 30) ||
      (statusFilter === "delinquent-60" &&
        member.status === "DELINQUENT" &&
        member.delinquencyDays > 30 &&
        member.delinquencyDays <= 60) ||
      (statusFilter === "delinquent-90" &&
        member.status === "DELINQUENT" &&
        member.delinquencyDays > 60 &&
        member.delinquencyDays <= 90) ||
      (statusFilter === "delinquent-over" &&
        member.status === "DELINQUENT" &&
        member.delinquencyDays > 90);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Members</h1>
          <p className='text-gray-600'>
            Manage community member profiles and status
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <div className='flex items-center space-x-1'>
            <Button
              size='sm'
              variant='outline'
              className='px-2'
              title='Import CSV'
            >
              <Upload className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='px-2'
              title='Export Data'
            >
              <Download className='h-4 w-4' />
            </Button>
          </div>
          <div className='h-4 w-px bg-gray-300'></div>
          <Button size='sm' asChild>
            <Link href='/members/new'>
              <Plus className='h-4 w-4 mr-2' />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search members...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full md:w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Members</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='delinquent-30'>
                  Delinquent (0-30 days)
                </SelectItem>
                <SelectItem value='delinquent-60'>
                  Delinquent (31-60 days)
                </SelectItem>
                <SelectItem value='delinquent-90'>
                  Delinquent (61-90 days)
                </SelectItem>
                <SelectItem value='delinquent-over'>
                  Delinquent (&gt;90 days)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className='hidden md:block'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => {
              // Ensure member has a valid ID
              const memberId = getDocumentId(member);
              if (!memberId) {
                console.error("Member missing ID:", member);
                return null;
              }

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>
                        {member.firstName || ""} {member.lastName || ""}
                      </div>
                      {member.email && (
                        <div className='text-sm text-gray-500'>
                          {member.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <StatusBadge status={member.status} />
                    {member.status === "DELINQUENT" && (
                      <div className='text-xs text-gray-500 mt-1'>
                        {member.delinquencyDays} days
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <EligibilityBadge
                      eligibility={member.eligibility}
                      reason={member.eligibilityReason}
                    />
                  </TableCell>
                  <TableCell>
                    {member.lastPaymentDate
                      ? new Date(member.lastPaymentDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end space-x-2'>
                      <Button size='sm' variant='outline' asChild>
                        <Link href={`/members/${memberId}`}>Edit</Link>
                      </Button>
                      <Button size='sm' variant='outline'>
                        <Mail className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          handleDeleteMember(
                            memberId,
                            `${member.firstName || ""} ${member.lastName || ""}`
                          )
                        }
                        disabled={deletingId === memberId}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        {deletingId === memberId ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className='md:hidden space-y-4'>
        {filteredMembers.map((member) => {
          // Ensure member has a valid ID
          const memberId = getDocumentId(member);
          if (!memberId) {
            console.error("Mobile Member missing ID:", member);
            return null;
          }

          return (
            <Card key={memberId}>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>
                    {member.firstName || ""} {member.lastName || ""}
                  </CardTitle>
                  <StatusBadge status={member.status} />
                </div>
                <div className='text-sm text-gray-600'>{member.phone}</div>
                {member.email && (
                  <div className='text-sm text-gray-500'>{member.email}</div>
                )}
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between mb-3'>
                  <EligibilityBadge
                    eligibility={member.eligibility}
                    reason={member.eligibilityReason}
                  />
                  {member.status === "DELINQUENT" && (
                    <Badge variant='outline' className='text-xs'>
                      {member.delinquencyDays} days overdue
                    </Badge>
                  )}
                </div>
                <div className='flex space-x-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='flex-1'
                    asChild
                  >
                    <Link href={`/members/${memberId}`}>Edit</Link>
                  </Button>
                  <Button size='sm' variant='outline'>
                    <Mail className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() =>
                      handleDeleteMember(
                        memberId,
                        `${member.firstName || ""} ${member.lastName || ""}`
                      )
                    }
                    disabled={deletingId === memberId}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  >
                    {deletingId === memberId ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash2 className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No members found
            </h3>
            <p className='text-gray-500 mb-6'>
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by importing a CSV or adding your first member."}
            </p>
            <Button asChild>
              <Link href='/members/new'>
                <Plus className='h-4 w-4 mr-2' />
                Add Member
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
