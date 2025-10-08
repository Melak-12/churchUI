"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Ministry } from "@/types";
import { format } from "date-fns";

interface MinistryListProps {
  ministries: Ministry[];
  loading: boolean;
  onEdit: (ministry: Ministry) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function MinistryList({
  ministries,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: MinistryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMinistries = (ministries || []).filter((ministry) => {
    const matchesSearch =
      (ministry?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ministry?.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || ministry?.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || ministry?.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      WORSHIP: "bg-blue-100 text-blue-800",
      CHILDREN: "bg-green-100 text-green-800",
      YOUTH: "bg-purple-100 text-purple-800",
      ADULTS: "bg-orange-100 text-orange-800",
      SENIORS: "bg-gray-100 text-gray-800",
      OUTREACH: "bg-red-100 text-red-800",
      ADMINISTRATION: "bg-yellow-100 text-yellow-800",
      OTHER: "bg-slate-100 text-slate-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-slate-100 text-slate-800"
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      PLANNING: "bg-yellow-100 text-yellow-800",
    };
    return (
      colors[status as keyof typeof colors] || "bg-slate-100 text-slate-800"
    );
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading ministries...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Modern Filters Card */}
      <Card className='border-none shadow-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-orange-500 rounded-lg'>
                <Search className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle className='text-lg'>Find Ministries</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {filteredMinistries.length} of {(ministries || []).length}{" "}
                  ministries
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={onRefresh}
              disabled={loading}
              className='bg-white dark:bg-gray-800 shadow-sm'
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='🔍 Search ministries by name...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 bg-white dark:bg-gray-800 border-none shadow-sm'
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-full sm:w-48 bg-white dark:bg-gray-800 border-none shadow-sm'>
                <SelectValue placeholder='📂 Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>📂 All Categories</SelectItem>
                <SelectItem value='WORSHIP'>🎵 Worship</SelectItem>
                <SelectItem value='CHILDREN'>👶 Children</SelectItem>
                <SelectItem value='YOUTH'>🎓 Youth</SelectItem>
                <SelectItem value='ADULTS'>👔 Adults</SelectItem>
                <SelectItem value='SENIORS'>👴 Seniors</SelectItem>
                <SelectItem value='OUTREACH'>🌍 Outreach</SelectItem>
                <SelectItem value='ADMINISTRATION'>
                  💼 Administration
                </SelectItem>
                <SelectItem value='OTHER'>📌 Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full sm:w-48 bg-white dark:bg-gray-800 border-none shadow-sm'>
                <SelectValue placeholder='🎯 Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>🎯 All Status</SelectItem>
                <SelectItem value='ACTIVE'>✅ Active</SelectItem>
                <SelectItem value='INACTIVE'>⏸️ Inactive</SelectItem>
                <SelectItem value='PLANNING'>📋 Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredMinistries.length === 0 ? (
        <Card className='border-dashed border-2'>
          <CardContent className='text-center py-12'>
            <div className='p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit mx-auto mb-4'>
              <Users className='h-12 w-12 text-orange-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>
              {ministries.length === 0
                ? "No Ministries Yet"
                : "No Matches Found"}
            </h3>
            <p className='text-muted-foreground max-w-md mx-auto'>
              {ministries.length === 0
                ? "Create your first ministry to start serving the community! ❤️"
                : "Try adjusting your search or filter criteria. 🔍"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredMinistries.map((ministry) => (
            <Card
              key={ministry.id}
              className='group hover:shadow-2xl transition-all duration-300 overflow-hidden'
            >
              <CardHeader className='pb-3 bg-muted/50'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-2 flex-1'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <span>❤️</span>
                      <span>{ministry.name}</span>
                    </CardTitle>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge
                        className={`${getCategoryColor(
                          ministry.category
                        )} text-xs font-medium px-2 py-1`}
                      >
                        {ministry.category.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={`${getStatusColor(
                          ministry.status
                        )} text-xs px-2 py-1`}
                      >
                        {ministry.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='hover:bg-white dark:hover:bg-gray-800'
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuItem
                        onClick={() => onEdit(ministry)}
                        className='cursor-pointer'
                      >
                        <Edit className='h-4 w-4 mr-2 text-blue-500' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(ministry.id)}
                        className='text-red-600 cursor-pointer'
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {ministry.description && (
                  <CardDescription className='line-clamp-2 mt-2 text-sm'>
                    {ministry.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className='space-y-3 pt-4'>
                {/* Leader */}
                <div className='flex items-center gap-2 text-sm p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg'>
                  <Users className='h-4 w-4 text-blue-600' />
                  <span className='text-muted-foreground'>Leader:</span>
                  <span className='font-semibold'>
                    {ministry.leader.firstName} {ministry.leader.lastName}
                  </span>
                </div>

                {/* Members Count */}
                <div className='flex items-center gap-2 text-sm p-2 bg-green-50 dark:bg-green-950/30 rounded-lg'>
                  <Users className='h-4 w-4 text-green-600' />
                  <span className='text-muted-foreground'>Members:</span>
                  <span className='font-semibold'>
                    {ministry.memberCount || ministry.members.length}
                  </span>
                </div>

                {/* Meeting Schedule */}
                {ministry.meetingSchedule && (
                  <div className='flex items-center gap-2 text-sm p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg'>
                    <Calendar className='h-4 w-4 text-purple-600' />
                    <div className='flex-1'>
                      <span className='text-muted-foreground'>Meets: </span>
                      <span className='font-semibold'>
                        {ministry.meetingSchedule.frequency
                          .replace("_", " ")
                          .toLowerCase()}
                        {ministry.meetingSchedule.dayOfWeek !== undefined && (
                          <span>
                            {" "}
                            on {getDayName(ministry.meetingSchedule.dayOfWeek)}
                          </span>
                        )}
                        {ministry.meetingSchedule.time && (
                          <span> at {ministry.meetingSchedule.time}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Location */}
                {ministry.meetingSchedule?.location && (
                  <div className='flex items-center gap-2 text-sm p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg'>
                    <MapPin className='h-4 w-4 text-amber-600' />
                    <span className='text-muted-foreground'>Location:</span>
                    <span className='font-semibold truncate'>
                      {ministry.meetingSchedule.location}
                    </span>
                  </div>
                )}

                {/* Budget */}
                {ministry.budget && (
                  <div className='bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg'>
                    <div className='flex items-center gap-2 text-sm mb-1'>
                      <DollarSign className='h-4 w-4 text-emerald-600' />
                      <span className='text-muted-foreground'>Budget:</span>
                      <span className='font-bold text-emerald-700 dark:text-emerald-400'>
                        {formatCurrency(
                          ministry.budget.allocated,
                          ministry.budget.currency
                        )}
                      </span>
                    </div>
                    {ministry.budget.spent > 0 && (
                      <div className='text-xs text-muted-foreground ml-6'>
                        Spent:{" "}
                        <span className='font-medium'>
                          {formatCurrency(
                            ministry.budget.spent,
                            ministry.budget.currency
                          )}
                        </span>
                        {" • "}
                        <span className='text-amber-600 dark:text-amber-400 font-medium'>
                          {Math.round(
                            (ministry.budget.spent /
                              ministry.budget.allocated) *
                              100
                          )}
                          % used
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Goals */}
                {ministry.goals && ministry.goals.length > 0 && (
                  <div className='space-y-2'>
                    <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                      🎯 Goals
                    </span>
                    <div className='flex flex-wrap gap-1.5'>
                      {ministry.goals.slice(0, 2).map((goal, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        >
                          {goal}
                        </Badge>
                      ))}
                      {ministry.goals.length > 2 && (
                        <Badge
                          variant='outline'
                          className='text-xs bg-gray-50 dark:bg-gray-900'
                        >
                          +{ministry.goals.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
