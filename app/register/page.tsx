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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Check className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Registration Complete!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Thank you for registering. Your profile has been created and
              you&apos;ll receive updates based on your preferences.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              You can update your information anytime by clicking the link in
              future messages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
          </div>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            {mockSettings.organizationName}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete your member registration to stay connected with our
            community
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">Mobile Phone *</Label>
                <PhoneInput
                  id="phone"
                  required
                  value={formData.phone}
                  onValueChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-xs sm:text-sm">Address (Optional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={2}
                placeholder="Street address, city, state, zip code"
                className="text-sm"
              />
            </div>

            {/* Consent */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, consent: checked as boolean })
                    }
                    required
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5"
                  />
                  <div className="grid gap-1 sm:gap-1.5 leading-none">
                    <Label
                      htmlFor="consent"
                      className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Communication Consent *
                    </Label>
                    <p className="text-[10px] sm:text-xs text-blue-700">
                      {mockSettings.consentText}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-sm"
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
              <p className="text-[10px] sm:text-xs text-gray-500">{mockSettings.smsFooter}</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
