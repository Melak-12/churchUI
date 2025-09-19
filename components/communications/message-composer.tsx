'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MessageSquare, Eye, Clock, DollarSign, AlertCircle } from 'lucide-react';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onPreview: () => void;
  onSchedule: () => void;
  characterCount: number;
  estimatedCost?: string;
  recipientCount?: number;
}

const messageVariables = [
  { variable: '{{firstName}}', description: 'Member\'s first name', example: 'John' },
  { variable: '{{lastName}}', description: 'Member\'s last name', example: 'Smith' },
  { variable: '{{eligibility}}', description: 'Eligible or Not Eligible', example: 'Eligible' },
  { variable: '{{ballotLink}}', description: 'Link to vote (if applicable)', example: 'https://...' },
  { variable: '{{registerLink}}', description: 'Link to update profile', example: 'https://...' }
];

const smsLengths = [
  { max: 160, segments: 1, description: 'Single SMS' },
  { max: 320, segments: 2, description: '2 SMS segments' },
  { max: 480, segments: 3, description: '3 SMS segments' },
  { max: 1600, segments: 10, description: '10 SMS segments (max)' }
];

export function MessageComposer({ 
  value, 
  onChange, 
  onPreview, 
  onSchedule, 
  characterCount,
  estimatedCost,
  recipientCount = 0
}: MessageComposerProps) {
  const [messagePreview, setMessagePreview] = useState('');

  // Generate message preview
  useEffect(() => {
    if (value) {
      let preview = value;
      preview = preview.replace(/\{\{firstName\}\}/g, 'John');
      preview = preview.replace(/\{\{lastName\}\}/g, 'Smith');
      preview = preview.replace(/\{\{eligibility\}\}/g, 'Eligible');
      preview = preview.replace(/\{\{ballotLink\}\}/g, 'https://church.app/vote/123');
      preview = preview.replace(/\{\{registerLink\}\}/g, 'https://church.app/register');
      setMessagePreview(preview);
    }
  }, [value]);

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = value.slice(0, start) + variable + value.slice(end);
      onChange(newValue);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const getSmsSegments = (length: number) => {
    if (length <= 160) return 1;
    if (length <= 320) return 2;
    if (length <= 480) return 3;
    return Math.ceil(length / 160);
  };

  const getSegmentInfo = (length: number) => {
    const segments = getSmsSegments(length);
    const info = smsLengths.find(s => s.segments === segments) || smsLengths[smsLengths.length - 1];
    return {
      segments,
      description: info.description,
      color: segments === 1 ? 'text-green-600' : segments <= 3 ? 'text-yellow-600' : 'text-red-600'
    };
  };

  const segmentInfo = getSegmentInfo(characterCount);
  const totalCost = recipientCount * segmentInfo.segments * 0.0075;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Compose Message</span>
        </CardTitle>
        <CardDescription>
          Write your message using variables to personalize content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message Variables */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Available Variables</Label>
          <div className="flex flex-wrap gap-2">
            {messageVariables.map((item) => (
              <Button
                key={item.variable}
                variant="outline"
                size="sm"
                onClick={() => insertVariable(item.variable)}
                title={`${item.description} (e.g., ${item.example})`}
                className="text-xs"
              >
                {item.variable}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click any variable to insert it at your cursor position
          </p>
        </div>

        {/* Message Input */}
        <div>
          <Label htmlFor="messageBody">Message Content</Label>
          <Textarea
            id="messageBody"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your message here..."
            className="mt-1 min-h-32 resize-none"
            maxLength={1600}
          />
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">
                {characterCount}/1600 characters
              </span>
              <span className={segmentInfo.color}>
                {segmentInfo.description}
              </span>
            </div>
            {recipientCount > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <DollarSign className="h-3 w-3" />
                <span>${totalCost.toFixed(2)} total</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Preview */}
        {value && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Preview</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Sample message:</div>
              <div className="text-sm whitespace-pre-wrap">{messagePreview}</div>
            </div>
          </div>
        )}

        {/* SMS Guidelines */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">SMS Best Practices</div>
              <ul className="text-xs space-y-1">
                <li>• Keep messages under 160 characters for single SMS</li>
                <li>• Use clear, concise language</li>
                <li>• Include a clear call-to-action</li>
                <li>• Test with different phone carriers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onPreview} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Preview Recipients
          </Button>
          <Button variant="outline" onClick={onSchedule} className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}