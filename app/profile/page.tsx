'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/phone-input';
import { StatusBadge, EligibilityBadge } from '@/components/ui/status-badge';
import { mockMembers } from '@/lib/mock-data';
import { Save, User } from 'lucide-react';

export default function ProfilePage() {
  // Mock: assume current user is first member
  const currentMember = mockMembers[0];
  
  const [formData, setFormData] = useState({
    firstName: currentMember.firstName,
    lastName: currentMember.lastName,
    phone: currentMember.phone,
    email: currentMember.email || '',
    address: currentMember.address || '',
    consent: currentMember.consent
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Update your contact information and preferences</p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Payment Status</div>
              <StatusBadge status={currentMember.status} />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Voting Eligibility</div>
              <EligibilityBadge 
                eligibility={currentMember.eligibility}
                reason={currentMember.eligibilityReason}
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Member Since</div>
              <div className="text-sm font-medium">
                {new Date(currentMember.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Last Updated</div>
              <div className="text-sm font-medium">
                {new Date(currentMember.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Keep your information current to receive important updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onValueChange={(value) => setFormData({ ...formData, phone: value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData({ ...formData, consent: checked })}
              />
              <Label htmlFor="consent">
                I consent to receive SMS and voice communications
              </Label>
            </div>

            <Button className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}