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
  Download,
  Upload,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importing, setImporting] = useState(false);

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

  // Export functions
  const exportToCSV = (members: Member[]) => {
    const csvData = members.map((member) => ({
      "First Name": member.firstName || "",
      "Last Name": member.lastName || "",
      Phone: member.phone,
      Email: member.email || "",
      Address: member.address || "",
      Status: member.status,
      Eligibility: member.eligibility,
      "Eligibility Reason": member.eligibilityReason || "",
      "Delinquency Days": member.delinquencyDays,
      "Last Payment Date": member.lastPaymentDate || "",
      "Created At": new Date(member.createdAt).toLocaleDateString(),
      "Updated At": new Date(member.updatedAt).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `church-members-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (members: Member[]) => {
    const excelData = members.map((member) => ({
      "First Name": member.firstName || "",
      "Last Name": member.lastName || "",
      Phone: member.phone,
      Email: member.email || "",
      Address: member.address || "",
      Status: member.status,
      Eligibility: member.eligibility,
      "Eligibility Reason": member.eligibilityReason || "",
      "Delinquency Days": member.delinquencyDays,
      "Last Payment Date": member.lastPaymentDate || "",
      "Created At": new Date(member.createdAt).toLocaleDateString(),
      "Updated At": new Date(member.updatedAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(excelData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map((row) => String(row[key as keyof typeof row]).length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(
      workbook,
      `church-members-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Import functions
  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    }

    return data;
  };

  const normalizeFieldName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .replace(/firstname/g, "firstName")
      .replace(/lastname/g, "lastName")
      .replace(/phonenumber/g, "phone")
      .replace(/emailaddress/g, "email");
  };

  const mapImportData = (data: any[]): Partial<Member>[] => {
    return data
      .map((row) => {
        const member: Partial<Member> = {
          status: "PAID" as const,
          eligibility: "ELIGIBLE" as const,
          consent: true,
          delinquencyDays: 0,
        };

        // Map common field variations
        Object.keys(row).forEach((key) => {
          const normalizedKey = normalizeFieldName(key);
          const value = row[key]?.toString().trim();

          if (!value) return;

          if (
            normalizedKey.includes("firstname") ||
            key.toLowerCase().includes("first")
          ) {
            member.firstName = value;
          } else if (
            normalizedKey.includes("lastname") ||
            key.toLowerCase().includes("last")
          ) {
            member.lastName = value;
          } else if (
            normalizedKey.includes("phone") ||
            key.toLowerCase().includes("phone")
          ) {
            member.phone = value;
          } else if (
            normalizedKey.includes("email") ||
            key.toLowerCase().includes("email")
          ) {
            member.email = value;
          } else if (
            normalizedKey.includes("address") ||
            key.toLowerCase().includes("address")
          ) {
            member.address = value;
          }
        });

        return member;
      })
      .filter((member) => member.phone); // Only include members with phone numbers
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let importData: any[] = [];

      if (fileExtension === "csv") {
        const text = await file.text();
        importData = parseCSV(text);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        importData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        throw new Error(
          "Unsupported file format. Please use CSV or Excel files."
        );
      }

      if (importData.length === 0) {
        throw new Error("No data found in the file.");
      }

      const membersToImport = mapImportData(importData);

      if (membersToImport.length === 0) {
        throw new Error(
          "No valid members found. Make sure each member has at least a phone number."
        );
      }

      // Import members one by one
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const memberData of membersToImport) {
        try {
          // Ensure all required fields are present
          if (!memberData.phone) {
            throw new Error("Phone number is required");
          }

          const createData = {
            ...memberData,
            phone: memberData.phone,
            status: memberData.status || ("PAID" as const),
            eligibility: memberData.eligibility || ("ELIGIBLE" as const),
            consent: memberData.consent ?? true,
            delinquencyDays: memberData.delinquencyDays || 0,
            password: "temporary123", // Default password - users can change later
          };

          await apiClient.createMember(createData);
          successCount++;
        } catch (err: any) {
          errorCount++;
          const memberName =
            `${memberData.firstName || ""} ${
              memberData.lastName || ""
            }`.trim() ||
            memberData.phone ||
            "Unknown";
          errors.push(`${memberName}: ${err.message || "Failed to import"}`);
        }
      }

      // Show results
      if (successCount > 0) {
        await fetchMembers(); // Refresh the list
      }

      if (errorCount === 0) {
        alert(`Successfully imported ${successCount} members!`);
      } else {
        const message = `Import completed:\n${successCount} members imported successfully\n${errorCount} members failed\n\nErrors:\n${errors
          .slice(0, 5)
          .join("\n")}${errors.length > 5 ? "\n... and more" : ""}`;
        alert(message);
      }
    } catch (err: any) {
      console.error("Import error:", err);
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = "";
    }
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
              {members.length} member{members.length !== 1 ? "s" : ""}
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
            <div className='text-xs text-green-600 dark:text-green-300'>
              Paid
            </div>
          </div>
          <div className='bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 text-center'>
            <div className='text-lg font-bold text-orange-700 dark:text-orange-400'>
              {members.filter((m) => m.status === "DELINQUENT").length}
            </div>
            <div className='text-xs text-orange-600 dark:text-orange-300'>
              Behind
            </div>
          </div>
          <div className='bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center'>
            <div className='text-lg font-bold text-blue-700 dark:text-blue-400'>
              {
                members.filter((m) => {
                  const joinDate = new Date(m.createdAt);
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  return joinDate >= oneMonthAgo;
                }).length
              }
            </div>
            <div className='text-xs text-blue-600 dark:text-blue-300'>New</div>
          </div>
        </div>

        {/* Search, Filter, and Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
          <div className='flex flex-1 gap-2 w-full sm:w-auto'>
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

          {/* Export/Import Buttons */}
          <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8 text-xs'>
                  <Download className='h-3 w-3 mr-1' />
                  <span className='hidden sm:inline'>Export</span>
                  <ChevronDown className='h-3 w-3 ml-1' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => exportToCSV(filteredMembers)}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportToExcel(filteredMembers)}
                >
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant='outline'
              size='sm'
              onClick={() => document.getElementById("file-import")?.click()}
              disabled={importing}
              className='h-8 text-xs'
            >
              {importing ? (
                <Loader2 className='h-3 w-3 mr-1 animate-spin' />
              ) : (
                <Upload className='h-3 w-3 mr-1' />
              )}
              <span className='hidden sm:inline'>
                {importing ? "Importing..." : "Import"}
              </span>
            </Button>

            <input
              id='file-import'
              type='file'
              accept='.csv,.xlsx,.xls'
              onChange={handleFileImport}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Compact Members List */}
        <div className='space-y-2'>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className='bg-card border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer group'
            >
              <Link href={`/members/${member.id}`} className='block'>
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
                          {member.status.charAt(0) +
                            member.status.slice(1).toLowerCase()}
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
                  <div
                    className='flex items-center space-x-1 ml-2'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
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
                        className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                        asChild
                      >
                        <Link href={`mailto:${member.email}`}>
                          <Mail className='h-4 w-4' />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className='text-center py-8'>
            <Users className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
            <h3 className='font-semibold text-foreground mb-1'>
              {search || statusFilter !== "all"
                ? "No Members Found"
                : "No Members Yet"}
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
