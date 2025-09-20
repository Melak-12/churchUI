"use client";

import { Event } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDocumentId } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  isFuture,
} from "date-fns";

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  compact?: boolean;
}

export function EventCard({
  event,
  showActions = true,
  compact = false,
}: EventCardProps) {
  // Get the event ID using the utility function
  const eventId = getDocumentId(event);
  const getEventTypeColor = (type: string) => {
    const colors = {
      SERVICE: "bg-blue-100 text-blue-800",
      MEETING: "bg-green-100 text-green-800",
      SPECIAL_OCCASION: "bg-purple-100 text-purple-800",
      CONFERENCE: "bg-orange-100 text-orange-800",
      SOCIAL: "bg-pink-100 text-pink-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getRelativeTime = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return "Today";
    if (isTomorrow(eventDate)) return "Tomorrow";
    if (isThisWeek(eventDate)) return "This week";
    if (isPast(eventDate)) return "Past";
    return "Upcoming";
  };

  const isUpcoming = isFuture(new Date(event.startDate));
  const isPast = isPast(new Date(event.startDate));

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {event.title}
                </h3>
                <Badge className={getEventTypeColor(event.type)} size="sm">
                  {event.type.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
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
              </div>
            </div>
            {showActions && (
              <div className="flex items-center space-x-1 ml-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/events/${eventId}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {event.title}
              </h3>
              <Badge className={getEventTypeColor(event.type)}>
                {event.type.replace("_", " ")}
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>

            {event.description && (
              <p className="text-gray-600 mb-3 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.registrationCount || 0}/{event.capacity} registered
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-400">
                {getRelativeTime(event.startDate)}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/events/${eventId}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/events/${eventId}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
