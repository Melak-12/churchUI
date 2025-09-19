'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  User 
} from 'lucide-react';

type AudienceType = 'ALL' | 'ELIGIBLE' | 'DELINQUENT_30' | 'DELINQUENT_60' | 'DELINQUENT_90' | 'CUSTOM';

interface AudienceSelectorProps {
  selected: AudienceType;
  onSelect: (audience: AudienceType) => void;
  memberCounts: Record<AudienceType, number>;
}

const audienceOptions = [
  { 
    value: 'ALL' as const, 
    label: 'All Members', 
    description: 'Every member in the database',
    icon: Users,
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: 'ELIGIBLE' as const, 
    label: 'Eligible Members', 
    description: 'Members who can vote (not delinquent > 90 days)',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: 'DELINQUENT_30' as const, 
    label: 'Delinquent (0-30 days)', 
    description: 'Recent payment issues',
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800'
  },
  { 
    value: 'DELINQUENT_60' as const, 
    label: 'Delinquent (31-60 days)', 
    description: 'Moderate payment delay',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800'
  },
  { 
    value: 'DELINQUENT_90' as const, 
    label: 'Delinquent (61-90 days)', 
    description: 'Significant payment delay',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800'
  },
  { 
    value: 'CUSTOM' as const, 
    label: 'Custom Selection', 
    description: 'Choose specific members',
    icon: User,
    color: 'bg-purple-100 text-purple-800'
  }
];

export function AudienceSelector({ selected, onSelect, memberCounts }: AudienceSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Select Audience</span>
        </CardTitle>
        <CardDescription>
          Choose who will receive this message
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected}
          onValueChange={(value) => onSelect(value as AudienceType)}
          className="space-y-3"
        >
          {audienceOptions.map((option) => {
            const Icon = option.icon;
            
            return (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className={cn(
                    "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                    selected === option.value 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                  <Badge className={option.color}>
                    {memberCounts[option.value]} members
                  </Badge>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {selected === 'CUSTOM' && (
          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Custom member selection will be available in the next step</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}