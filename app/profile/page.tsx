"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

export default function ProfilePage() {
  const user = getCurrentUser();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Email not available</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>Phone not available</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>User ID: {user.id}</span>
            </div>
            {user.role === "ADMIN" && (
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Administrator privileges</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
