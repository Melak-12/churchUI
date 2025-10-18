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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import { mockSettings } from "@/lib/mock-data";
import { UserPlus, Check } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    consent: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally submit to API
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="text-center py-8 px-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Registration Complete!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Thank you for registering. Your profile has been created and
              you&apos;ll receive updates based on your preferences.
            </p>
            <p className="text-xs text-muted-foreground">
              You can update your information anytime by clicking the link in
              future messages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {mockSettings.organizationName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your member registration to stay connected with our community
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Mobile Phone *</Label>
                  <PhoneInput
                    id="phone"
                    required
                    value={formData.phone}
                    onValueChange={(value) =>
                      setFormData({ ...formData, phone: value })
                    }
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-11 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium">Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  placeholder="Street address, city, state, zip code"
                  className="text-base"
                />
              </div>

              {/* Consent */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, consent: checked as boolean })
                      }
                      required
                      className="h-4 w-4 mt-0.5"
                    />
                    <div className="space-y-2 leading-none">
                      <Label
                        htmlFor="consent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Communication Consent *
                      </Label>
                      <p className="text-xs text-blue-700">
                        {mockSettings.consentText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.phone ||
                  !formData.consent
                }
              >
                Complete Registration
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">{mockSettings.smsFooter}</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
