export interface Member {
  id: string;
  _id?: string; // For backward compatibility with API responses
  firstName: string;
  lastName: string;
  phone: string; // E.164 format
  email?: string;
  address?: string;
  consent: boolean;
  status: 'PAID' | 'DELINQUENT';
  delinquencyDays: number;
  eligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE';
  eligibilityReason?: string;
  createdAt: string;
  updatedAt: string;
  lastPaymentDate?: string;
}

export interface Vote {
  id: string;
  title: string;
  description?: string;
  type: 'SINGLE_CHOICE' | 'YES_NO';
  options: string[];
  startAt: string;
  endAt: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED';
  anonymous: boolean;
  eligibleCount: number;
  participationCount?: number;
  participationPercent?: number;
  createdAt: string;
  results?: {
    [option: string]: number;
  };
}

export interface Communication {
  id: string;
  _id?: string; // For backward compatibility with API responses
  name: string;
  audience: 'ALL' | 'ELIGIBLE' | 'DELINQUENT_30' | 'DELINQUENT_60' | 'DELINQUENT_90' | 'CUSTOM';
  customAudience?: string[];
  body: string;
  scheduledAt?: string;
  sentAt?: string;
  sent: number;
  delivered: number;
  failed: number;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  recipients?: Recipient[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Recipient {
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  phone: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  twilioSid?: string;
}

export interface Settings {
  organizationName: string;
  logoUrl?: string;
  primaryColor: string;
  consentText: string;
  smsFooter: string;
  twilioSenderId: string;
  privacyPolicyUrl?: string;
}

export type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST';

export interface User {
  id: string;
  role: UserRole;
  memberId?: string; // if role is MEMBER
}