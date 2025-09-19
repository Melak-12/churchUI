import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'PAID' | 'DELINQUENT';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={status === 'PAID' ? 'default' : 'destructive'}
      className={cn(
        status === 'PAID' 
          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
          : 'bg-red-100 text-red-800 hover:bg-red-100',
        className
      )}
    >
      {status}
    </Badge>
  );
}

interface EligibilityBadgeProps {
  eligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE';
  reason?: string;
  className?: string;
}

export function EligibilityBadge({ eligibility, reason, className }: EligibilityBadgeProps) {
  return (
    <Badge
      variant={eligibility === 'ELIGIBLE' ? 'default' : 'secondary'}
      className={cn(
        eligibility === 'ELIGIBLE'
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        className
      )}
      title={reason}
    >
      {eligibility === 'ELIGIBLE' ? 'Eligible' : 'Not Eligible'}
    </Badge>
  );
}