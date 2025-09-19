'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export function TwilioTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [message, setMessage] = useState('Hello! This is a test message from the church management system.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!phoneNumber || !message) {
      setResult({ success: false, message: 'Please enter both phone number and message' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await apiClient.testTwilio(phoneNumber, message);
      setResult({ 
        success: true, 
        message: `Test SMS sent successfully! SID: ${response.result?.sid || 'N/A'}` 
      });
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || 'Failed to send test SMS' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setPhoneNumber('+1234567890');
    setMessage('Hello! This is a test message from the church management system.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
          <MessageSquare className="h-4 w-4 mr-2" />
          Test SMS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Twilio SMS</DialogTitle>
          <DialogDescription>
            Send a test SMS message to verify your Twilio configuration is working correctly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Use E.164 format (e.g., +1234567890)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Test Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your test message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              {message.length}/160 characters
            </p>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleTest} disabled={isLoading || !phoneNumber || !message}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test SMS'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
