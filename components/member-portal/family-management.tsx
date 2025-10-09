"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Home,
  Phone,
  Mail,
  Calendar,
  MapPin,
  UserPlus,
  Edit,
  Loader2,
  Heart,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/lib/api";

interface FamilyMember {
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  relationship: string;
  isPrimary: boolean;
}

interface Family {
  _id: string;
  familyName: string;
  headOfHousehold: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  members: FamilyMember[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  homePhone?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  anniversary?: string;
  notes?: string;
  createdAt: string;
}

export function FamilyManagement() {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get<{ family: any }>("/api/member-portal/family");

      if (response.success && response.data) {
        setFamily((response.data as { family: any }).family);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load family information"
      );
    } finally {
      setLoading(false);
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case "spouse":
        return "💑";
      case "child":
        return "👶";
      case "parent":
        return "👨‍👩‍👧‍👦";
      case "sibling":
        return "👫";
      case "grandparent":
        return "👴";
      case "grandchild":
        return "👶";
      default:
        return "👤";
    }
  };

  const formatAddress = (address?: Family["address"]) => {
    if (!address) return "No address provided";

    const parts = [
      address.street,
      address.city,
      address.state && address.zipCode
        ? `${address.state} ${address.zipCode}`
        : address.state || address.zipCode,
      address.country !== "USA" ? address.country : undefined,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!family) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Information
          </CardTitle>
          <CardDescription>No family information found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Family Found</h3>
            <p className="text-gray-600 mb-4">
              You are not currently associated with any family group.
            </p>
            <p className="text-sm text-gray-500">
              Contact the church administrator if you believe this is an error.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Family Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                {family.familyName}
              </CardTitle>
              <CardDescription>
                Family established{" "}
                {new Date(family.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {family.members.length}{" "}
              {family.members.length === 1 ? "Member" : "Members"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Head of Household */}
          <div>
            <h3 className="font-semibold mb-3">Head of Household</h3>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarFallback>
                  {getInitials(
                    family.headOfHousehold.firstName,
                    family.headOfHousehold.lastName
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">
                  {family.headOfHousehold.firstName}{" "}
                  {family.headOfHousehold.lastName}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {family.headOfHousehold.phone}
                  </div>
                  {family.headOfHousehold.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {family.headOfHousehold.email}
                    </div>
                  )}
                </div>
              </div>
              <Badge>Head</Badge>
            </div>
          </div>

          <Separator />

          {/* Family Members */}
          <div>
            <h3 className="font-semibold mb-3">Family Members</h3>
            <div className="grid gap-3">
              {family.members.map((familyMember, index) => (
                <div
                  key={familyMember.member._id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {getInitials(
                        familyMember.member.firstName,
                        familyMember.member.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {familyMember.member.firstName}{" "}
                      {familyMember.member.lastName}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {familyMember.member.phone}
                      </div>
                      {familyMember.member.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {familyMember.member.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {getRelationshipIcon(familyMember.relationship)}{" "}
                      {familyMember.relationship}
                    </Badge>
                    {familyMember.isPrimary && (
                      <Badge variant="outline" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Family Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </h3>
              <p className="text-gray-600">{formatAddress(family.address)}</p>
            </div>

            {/* Home Phone */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Home Phone
              </h3>
              <p className="text-gray-600">
                {family.homePhone || "Not provided"}
              </p>
            </div>

            {/* Anniversary */}
            {family.anniversary && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Anniversary
                </h3>
                <p className="text-gray-600">
                  {new Date(family.anniversary).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Emergency Contact */}
            {family.emergencyContact && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Emergency Contact
                </h3>
                <div className="text-gray-600">
                  <p className="font-medium">{family.emergencyContact.name}</p>
                  <p className="text-sm">{family.emergencyContact.phone}</p>
                  {family.emergencyContact.relationship && (
                    <p className="text-sm text-gray-500">
                      {family.emergencyContact.relationship}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {family.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {family.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




