"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event } from "@/types";
import apiClient from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Grid3x3,
  List,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await apiClient.getCalendarEvents(
        format(start, "yyyy-MM-dd"),
        format(end, "yyyy-MM-dd")
      );

      setEvents(response);
    } catch (err: any) {
      setError(err.message || "Failed to load calendar events");
      console.error("Calendar events fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startDate), date));
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      SERVICE: "bg-blue-500 border-blue-600",
      MEETING: "bg-green-500 border-green-600",
      SPECIAL_OCCASION: "bg-purple-500 border-purple-600",
      CONFERENCE: "bg-orange-500 border-orange-600",
      SOCIAL: "bg-pink-500 border-pink-600",
      OTHER: "bg-gray-500 border-gray-600",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const getEventTypeColorLight = (type: string) => {
    const colors = {
      SERVICE: "bg-blue-50 text-blue-700 border-blue-200",
      MEETING: "bg-green-50 text-green-700 border-green-200",
      SPECIAL_OCCASION: "bg-purple-50 text-purple-700 border-purple-200",
      CONFERENCE: "bg-orange-50 text-orange-700 border-orange-200",
      SOCIAL: "bg-pink-50 text-pink-700 border-pink-200",
      OTHER: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading calendar...</span>
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
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchEvents} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        {/* Google Calendar-like Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Calendar
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    Church Events
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                asChild
              >
                <Link href="/events">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create</span>
                  <span className="sm:hidden">New</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {format(currentDate, "MMMM yyyy")}
              </h2>

              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-xs sm:text-sm"
              >
                Today
              </Button>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="h-7 px-3 text-xs"
                >
                  <Grid3x3 className="h-3 w-3 mr-1" />
                  Month
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="h-7 px-3 text-xs"
                >
                  <List className="h-3 w-3 mr-1" />
                  Week
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowSidebar(false)}
              />
              <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Upcoming Events</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 overflow-y-auto">
                  <UpcomingEventsList events={events} />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:w-80 lg:border-r lg:border-gray-200 lg:bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <UpcomingEventsList events={events} />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 bg-white overflow-auto">
            <div className="min-w-full">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <div
                      key={day}
                      className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  )
                )}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, dayIdx) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={dayIdx}
                      className={`
                        relative border-r border-b border-gray-200 last:border-r-0
                        min-h-[80px] sm:min-h-[120px] lg:min-h-[140px] p-1 sm:p-2
                        ${
                          !isCurrentMonth
                            ? "bg-gray-50 text-gray-400"
                            : "bg-white text-gray-900"
                        }
                        ${isToday ? "bg-blue-50 border-blue-300" : ""}
                        hover:bg-gray-50 transition-colors cursor-pointer
                      `}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`
                            text-xs sm:text-sm font-medium
                            ${
                              isToday
                                ? "bg-blue-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                                : ""
                            }
                          `}
                        >
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="text-xs text-gray-500 hidden sm:block">
                            {dayEvents.length}
                          </div>
                        )}
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {dayEvents
                          .slice(0, viewMode === "month" ? 2 : 4)
                          .map((event, eventIdx) => (
                            <div
                              key={eventIdx}
                              className={`
                              text-xs rounded-md px-1 py-0.5 sm:px-2 sm:py-1 cursor-pointer
                              truncate border-l-2 transition-all hover:shadow-sm
                              ${getEventTypeColorLight(event.type)}
                            `}
                              onClick={() => {
                                setSelectedEvent(event);
                                window.open(
                                  `/events/${getDocumentId(event)}`,
                                  "_blank"
                                );
                              }}
                            >
                              <div className="font-medium truncate">
                                {event.title}
                              </div>
                              <div className="text-xs opacity-75 hidden sm:block">
                                {format(new Date(event.startDate), "h:mm a")}
                              </div>
                            </div>
                          ))}
                        {dayEvents.length > (viewMode === "month" ? 2 : 4) && (
                          <div className="text-xs text-gray-500 px-1 hover:text-gray-700 cursor-pointer">
                            +{dayEvents.length - (viewMode === "month" ? 2 : 4)}{" "}
                            more
                          </div>
                        )}
                      </div>

                      {/* Mobile Event Indicator */}
                      {dayEvents.length > 0 && (
                        <div className="sm:hidden absolute bottom-1 right-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// Upcoming Events List Component
function UpcomingEventsList({ events }: { events: Event[] }) {
  const upcomingEvents = events
    .filter((event) => new Date(event.startDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    .slice(0, 10);

  const getEventTypeColorLight = (type: string) => {
    const colors = {
      SERVICE: "bg-blue-50 text-blue-700 border-blue-200",
      MEETING: "bg-green-50 text-green-700 border-green-200",
      SPECIAL_OCCASION: "bg-purple-50 text-purple-700 border-purple-200",
      CONFERENCE: "bg-orange-50 text-orange-700 border-orange-200",
      SOCIAL: "bg-pink-50 text-pink-700 border-pink-200",
      OTHER: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">
          No upcoming events
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Create your first event to get started
        </p>
        <Button size="sm" asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Event Type Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Event Types</h4>
        <div className="grid grid-cols-1 gap-2">
          {[
            { type: "SERVICE", label: "Service", color: "bg-blue-500" },
            { type: "MEETING", label: "Meeting", color: "bg-green-500" },
            {
              type: "SPECIAL_OCCASION",
              label: "Special",
              color: "bg-purple-500",
            },
            { type: "CONFERENCE", label: "Conference", color: "bg-orange-500" },
            { type: "SOCIAL", label: "Social", color: "bg-pink-500" },
            { type: "OTHER", label: "Other", color: "bg-gray-500" },
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Next {upcomingEvents.length} Events
        </h4>
        <div className="space-y-2">
          {upcomingEvents.map((event) => (
            <Link
              key={getDocumentId(event)}
              href={`/events/${getDocumentId(event)}`}
              className="block"
            >
              <div
                className={`
                p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer
                ${getEventTypeColorLight(event.type)}
              `}
              >
                <div className="flex items-start justify-between mb-1">
                  <h5 className="font-medium text-sm truncate pr-2">
                    {event.title}
                  </h5>
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 shrink-0"
                  >
                    {event.type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs opacity-75">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(event.startDate), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {event.registrationCount || 0}/{event.capacity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
