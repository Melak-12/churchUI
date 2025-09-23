"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { mockSettings } from "@/lib/mock-data";
import {
  Save,
  Upload,
  Palette,
  MessageSquare,
  Shield,
  Phone,
  Smartphone,
  ToggleLeft,
} from "lucide-react";
import { useFeatures } from "@/contexts/features-context";

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const { features, updateFeatures } = useFeatures();

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Configure your organization and platform settings
          </p>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="twilio">Twilio</TabsTrigger>
            <TabsTrigger value="android-sms">Android SMS</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Branding Settings</span>
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={settings.organizationName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        organizationName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Palette className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      placeholder="#3B82F6"
                      className="font-mono"
                    />
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Branding
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ToggleLeft className="h-5 w-5" />
                  <span>Feature Management</span>
                </CardTitle>
                <CardDescription>
                  Enable or disable features for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="events-toggle">Events Management</Label>
                      <p className="text-sm text-muted-foreground">Manage church events, registrations, and volunteers</p>
                    </div>
                    <Switch
                      id="events-toggle"
                      checked={features.events}
                      onCheckedChange={(checked) => updateFeatures({ events: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="financial-toggle">Financial Management</Label>
                      <p className="text-sm text-muted-foreground">Track payments, transactions, and budgets</p>
                    </div>
                    <Switch
                      id="financial-toggle"
                      checked={features.financial}
                      onCheckedChange={(checked) => updateFeatures({ financial: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="communications-toggle">Communications</Label>
                      <p className="text-sm text-muted-foreground">Send SMS and manage member communications</p>
                    </div>
                    <Switch
                      id="communications-toggle"
                      checked={features.communications}
                      onCheckedChange={(checked) => updateFeatures({ communications: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voting-toggle">Voting System</Label>
                      <p className="text-sm text-muted-foreground">Create and manage member voting</p>
                    </div>
                    <Switch
                      id="voting-toggle"
                      checked={features.voting}
                      onCheckedChange={(checked) => updateFeatures({ voting: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="member-portal-toggle">Member Portal</Label>
                      <p className="text-sm text-muted-foreground">Family management and document library</p>
                    </div>
                    <Switch
                      id="member-portal-toggle"
                      checked={features.memberPortal}
                      onCheckedChange={(checked) => updateFeatures({ memberPortal: checked })}
                    />
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Feature Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Communication Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure consent text and message footers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="consentText">Consent Text</Label>
                  <Textarea
                    id="consentText"
                    value={settings.consentText}
                    onChange={(e) =>
                      setSettings({ ...settings, consentText: e.target.value })
                    }
                    rows={3}
                    placeholder="Text shown during registration to get SMS consent..."
                  />
                </div>

                <div>
                  <Label htmlFor="smsFooter">SMS Footer</Label>
                  <Textarea
                    id="smsFooter"
                    value={settings.smsFooter}
                    onChange={(e) =>
                      setSettings({ ...settings, smsFooter: e.target.value })
                    }
                    rows={2}
                    placeholder="Text automatically added to all SMS messages..."
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Communication Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="twilio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Twilio Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure SMS and voice calling settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="senderId">Sender ID / Phone Number</Label>
                  <Input
                    id="senderId"
                    value={settings.twilioSenderId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        twilioSenderId: e.target.value,
                      })
                    }
                    placeholder="+1234567890"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountSid">Account SID</Label>
                    <Input
                      id="accountSid"
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="authToken">Auth Token</Label>
                    <Input
                      id="authToken"
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••••••"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rateLimit">
                    Rate Limit (messages per minute)
                  </Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    defaultValue="60"
                    min="1"
                    max="1000"
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Twilio Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="android-sms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Android SMS Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure Android SMS settings for sending messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="androidSenderId">
                    Sender ID / Phone Number
                  </Label>
                  <Input
                    id="androidSenderId"
                    value={settings.androidSenderId || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        androidSenderId: e.target.value,
                      })
                    }
                    placeholder="+1234567890"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="androidApiKey">API Key</Label>
                    <Input
                      id="androidApiKey"
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="androidSecret">Secret Key</Label>
                    <Input
                      id="androidSecret"
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••••••"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="androidRateLimit">
                    Rate Limit (messages per minute)
                  </Label>
                  <Input
                    id="androidRateLimit"
                    type="number"
                    defaultValue="60"
                    min="1"
                    max="1000"
                  />
                </div>

                <div>
                  <Label htmlFor="androidEndpoint">API Endpoint</Label>
                  <Input
                    id="androidEndpoint"
                    placeholder="https://api.androidsms.com/v1/send"
                    defaultValue="https://api.androidsms.com/v1/send"
                  />
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    Android SMS Features
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Direct Android device integration</li>
                    <li>• Lower cost per message</li>
                    <li>• Real-time delivery status</li>
                    <li>• Two-way messaging support</li>
                  </ul>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Android SMS Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Legal & Compliance</span>
                </CardTitle>
                <CardDescription>
                  Privacy policy and legal compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="privacyPolicy">Privacy Policy URL</Label>
                  <Input
                    id="privacyPolicy"
                    value={settings.privacyPolicyUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        privacyPolicyUrl: e.target.value,
                      })
                    }
                    placeholder="https://yourchurch.com/privacy"
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Compliance Notes
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All SMS messages include opt-out instructions</li>
                    <li>• Member consent is required for communications</li>
                    <li>• Voting eligibility is automatically enforced</li>
                    <li>• Data retention follows best practices</li>
                  </ul>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Legal Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
