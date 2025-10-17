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
  Download,
  Upload,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import * as XLSX from "xlsx";

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

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='bg-card rounded-xl p-6 border shadow-sm'>
          <div className='flex flex-col gap-4'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-2 bg-muted rounded-lg'>
                  <Users className='h-6 w-6 text-muted-foreground' />
                </div>
                <h1 className='text-2xl font-bold text-foreground'>
                  Community Members
                </h1>
              </div>
              <p className='text-muted-foreground'>
                Connect with your church family •
                <span className='font-semibold ml-1'>
                  {members.length} members
                </span>{" "}
                total
              </p>
            </div>
            <Button asChild className='shadow-sm w-full sm:w-auto'>
              <Link href='/members/new'>
                <UserPlus className='h-4 w-4 mr-2' />
                Add Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='border shadow-sm'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>
                    Paid Members
                  </p>
                  <p className='text-3xl font-bold'>
                    {members.filter((m) => m.status === "PAID").length}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Active & Current
                  </p>
                </div>
                <div className='p-3 bg-green-500 rounded-lg shadow-md'>
                  <Heart className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border shadow-sm'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>
                    Need Follow-up
                  </p>
                  <p className='text-3xl font-bold'>
                    {members.filter((m) => m.status === "DELINQUENT").length}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Requires Attention
                  </p>
                </div>
                <div className='p-3 bg-orange-500 rounded-lg shadow-md'>
                  <AlertCircle className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border shadow-sm'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>
                    New This Month
                  </p>
                  <p className='text-3xl font-bold'>
                    {
                      members.filter((m) => {
                        const joinDate = new Date(m.createdAt);
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        return joinDate >= oneMonthAgo;
                      }).length
                    }
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Recent Joins
                  </p>
                </div>
                <div className='p-3 bg-blue-500 rounded-lg shadow-md'>
                  <UserPlus className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border shadow-sm'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>
                    Total Members
                  </p>
                  <p className='text-3xl font-bold'>{members.length}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Our Community
                  </p>
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
                    placeholder='Search by name, email, or phone...'
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
                    <SelectItem value='all'>All Members</SelectItem>
                    <SelectItem value='PAID'>Paid</SelectItem>
                    <SelectItem value='DELINQUENT'>Need Follow-up</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center space-x-2'>
                {/* Export/Import Buttons */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='shadow-sm'>
                      <Download className='h-4 w-4 mr-2' />
                      <span className='hidden sm:inline'>Export</span>
                      <ChevronDown className='h-3 w-3 ml-1' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => exportToCSV(filteredMembers)}
                    >
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
                  onClick={() =>
                    document.getElementById("file-import")?.click()
                  }
                  disabled={importing}
                  className='shadow-sm'
                >
                  {importing ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Upload className='h-4 w-4 mr-2' />
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

                {/* View Mode Buttons */}
                <div className='border-l pl-2 ml-2'>
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
                    className='shadow-sm ml-2'
                  >
                    <List className='h-4 w-4 mr-2' />
                    <span className='hidden sm:inline'>List</span>
                  </Button>
                </div>
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
                    <Avatar className='h-16 w-16 border-2 border-muted shadow-sm'>
                      <AvatarFallback className='bg-muted text-foreground font-bold text-lg'>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between mb-2'>
                        <h3 className='font-bold text-lg text-foreground truncate'>
                          {member.firstName || ""} {member.lastName || ""}
                        </h3>
                        <Badge
                          className={`${getStatusColor(
                            member.status
                          )} text-xs px-2 py-1 shadow-sm`}
                        >
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
                      <div className='p-1.5 bg-muted rounded'>
                        <Mail className='h-3.5 w-3.5 text-muted-foreground' />
                      </div>
                      <span className='text-sm truncate flex-1'>
                        {member.email || "No email"}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 p-2 rounded-lg'>
                      <div className='p-1.5 bg-muted rounded'>
                        <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                      </div>
                      <span className='text-sm font-medium'>
                        {member.phone}
                      </span>
                    </div>
                    {member.address && (
                      <div className='flex items-center space-x-3 p-2 rounded-lg'>
                        <div className='p-1.5 bg-muted rounded'>
                          <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                        </div>
                        <span className='text-sm truncate flex-1'>
                          {member.address}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center space-x-3 p-2 rounded-lg'>
                      <div className='p-1.5 bg-muted rounded'>
                        <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                      </div>
                      <span className='text-sm'>
                        Joined{" "}
                        {new Date(member.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className='pt-3 border-t flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 shadow-sm'
                      asChild
                    >
                      <Link href={`/members/${member.id}`}>View Profile</Link>
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='shadow-sm'
                      asChild
                    >
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
                              {member.firstName || ""} {member.lastName || ""}
                            </h3>
                            <Badge
                              className={`${getStatusColor(
                                member.status
                              )} text-xs px-2.5 py-0.5`}
                            >
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
                              Joined{" "}
                              {new Date(member.createdAt).toLocaleDateString(
                                "en-US",
                                { month: "short", year: "numeric" }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2 ml-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='shadow-sm'
                          asChild
                        >
                          <Link href={`/members/${member.id}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='shadow-sm'
                          asChild
                        >
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
                {search || statusFilter !== "all"
                  ? "No Members Found"
                  : "No Members Yet"}
              </h3>
              <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filters to find the members you're looking for."
                  : "Start building your community by adding your first member!"}
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
