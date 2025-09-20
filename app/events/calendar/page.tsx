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
      SERVICE: "bg-blue-500",
      MEETING: "bg-green-500",
      SPECIAL_OCCASION: "bg-purple-500",
      CONFERENCE: "bg-orange-500",
      SOCIAL: "bg-pink-500",
      OTHER: "bg-gray-500",
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
            <p className="text-gray-600">
              View and manage church events by date
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/events">
                <CalendarIcon className="h-4 w-4 mr-2" />
                List View
              </Link>
            </Button>
            <Button asChild>
              <Link href="/events/new">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Calendar Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Select
                  value={viewMode}
                  onValueChange={(value: "month" | "week") =>
                    setViewMode(value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {/* Day Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={dayIdx}
                    className={`bg-white p-2 min-h-[120px] ${
                      !isCurrentMonth ? "text-gray-400" : "text-gray-900"
                    } ${isToday ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isToday ? "text-blue-600" : ""
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, eventIdx) => (
                        <div
                          key={eventIdx}
                          className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(
                            event.type
                          )} text-white`}
                          onClick={() =>
                            (window.location.href = `/events/${getDocumentId(
                              event
                            )}`)
                          }
                        >
                          {format(new Date(event.startDate), "h:mm a")}{" "}
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <CardDescription>
              Color coding for different event types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { type: "SERVICE", label: "Service", color: "bg-blue-500" },
                { type: "MEETING", label: "Meeting", color: "bg-green-500" },
                {
                  type: "SPECIAL_OCCASION",
                  label: "Special Occasion",
                  color: "bg-purple-500",
                },
                {
                  type: "CONFERENCE",
                  label: "Conference",
                  color: "bg-orange-500",
                },
                { type: "SOCIAL", label: "Social", color: "bg-pink-500" },
                { type: "OTHER", label: "Other", color: "bg-gray-500" },
              ].map(({ type, label, color }) => (
                <div key={type} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${color}`}></div>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            {events
              .filter((event) => new Date(event.startDate) > new Date())
              .slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {events
                  .filter((event) => new Date(event.startDate) > new Date())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={getDocumentId(event)}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getEventTypeColor(
                          event.type
                        )}`}
                      ></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {event.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(event.startDate),
                                "MMM d, h:mm a"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${getDocumentId(event)}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming events
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first event to get started
                </p>
                <Button asChild>
                  <Link href="/events/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
