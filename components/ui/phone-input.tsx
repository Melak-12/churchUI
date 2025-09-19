'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onValueChange, onChange, ...props }, ref) => {
    const formatPhoneNumber = (input: string): string => {
      // Remove all non-digits
      const cleaned = input.replace(/\D/g, '');
      
      // Add country code if not present
      let formatted = cleaned.startsWith('1') ? cleaned : `1${cleaned}`;
      
      // Format as (XXX) XXX-XXXX
      if (formatted.length >= 11) {
        const countryCode = formatted.slice(0, 1);
        const areaCode = formatted.slice(1, 4);
        const first = formatted.slice(4, 7);
        const second = formatted.slice(7, 11);
        return `+${countryCode} (${areaCode}) ${first}-${second}`;
      }
      
      return `+${formatted}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onValueChange?.(formatted);
      onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        className={cn(className)}
        value={value}
        onChange={handleChange}
        placeholder="+1 (555) 123-4567"
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';