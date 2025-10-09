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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface TestResult {
  success: boolean;
  message: string;
  results?: any[];
  error?: string;
}

export default function TestBulkSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState("+18777804236");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testMessages = [
    {
      id: 1,
      name: "Person 1",
      message:
        "Hello Person 1! This is a test message from the church bulk SMS system. Hope you are doing well!",
    },
    {
      id: 2,
      name: "Person 2",
      message:
        "Hi Person 2! Testing our new bulk messaging system. This should be faster and more reliable!",
    },
    {
      id: 3,
      name: "Person 3",
      message:
        "Greetings Person 3! This is the third test message to verify our Twilio Messaging Services integration.",
    },
  ];

  const handleTestBulkSMS = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("Starting bulk SMS test...");
      const response = await apiClient.testBulkSms(phoneNumber, testMessages);

      console.log("Bulk SMS test response:", response);

      setResult({
        success: true,
        message: "Bulk SMS test completed successfully!",
        results: response.data?.results || [],
      });
    } catch (error: any) {
      console.error("Bulk SMS test failed:", error);
      setResult({
        success: false,
        message: "Bulk SMS test failed",
        error: error.message || "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSingleSMS = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("Starting single SMS test...");
      const response = await apiClient.post("/api/communications/test-twilio", {
        phoneNumber,
        message: "Hello! This is a single SMS test from the church system.",
      });

      console.log("Single SMS test response:", response);

      setResult({
        success: true,
        message: "Single SMS test completed successfully!",
        results: [response.data?.result],
      });
    } catch (error: any) {
      console.error("Single SMS test failed:", error);
      setResult({
        success: false,
        message: "Single SMS test failed",
        error: error.message || "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bulk SMS Test Page
            </h1>
            <p className="text-gray-500 mt-1">
              Test the new Twilio Messaging Services integration
            </p>
          </div>
        </div>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Test Configuration
            </CardTitle>
            <CardDescription>
              Configure the test parameters for bulk SMS testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                All test messages will be sent to this number
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Messages Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Test Messages Preview
            </CardTitle>
            <CardDescription>
              These messages will be sent as part of the bulk SMS test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{msg.name}</Badge>
                    <span className="text-sm text-gray-500">
                      Message {msg.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>
              Run tests to verify the bulk SMS functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleTestBulkSMS}
                disabled={loading || !phoneNumber}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Test Bulk SMS (3 Messages)
              </Button>

              <Button
                onClick={handleTestSingleSMS}
                disabled={loading || !phoneNumber}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Test Single SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {result.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">
                    Error Details:
                  </h4>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}

              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Message Results:
                  </h4>
                  <div className="space-y-2">
                    {result.results.map((res, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              res.status === "sent" || res.status === "queued"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {res.status || "unknown"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Message {index + 1}
                          </span>
                        </div>
                        {res.sid && (
                          <p className="text-xs text-gray-600">
                            SID: {res.sid}
                          </p>
                        )}
                        {res.errorMessage && (
                          <p className="text-xs text-red-600">
                            Error: {res.errorMessage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Bulk SMS Test:</strong> Sends 3 different messages to
                the same phone number to test the new Twilio Messaging Services
                integration.
              </p>
              <p>
                <strong>Single SMS Test:</strong> Sends one message using the
                traditional SMS method for comparison.
              </p>
              <p>
                <strong>Expected Results:</strong> You should receive 3
                different messages on your phone (+18777804236) when running the
                bulk test.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
