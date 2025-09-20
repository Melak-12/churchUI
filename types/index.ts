export interface Member {
  id: string;
  _id?: string; // For backward compatibility with API responses
  firstName: string;
  lastName: string;
  phone: string; // E.164 format
  email?: string;
  address?: string;
  consent: boolean;
  status: "PAID" | "DELINQUENT";
  delinquencyDays: number;
  eligibility: "ELIGIBLE" | "NOT_ELIGIBLE";
  eligibilityReason?: string;
  createdAt: string;
  updatedAt: string;
  lastPaymentDate?: string;
}

export interface Vote {
  id: string;
  title: string;
  description?: string;
  type: "SINGLE_CHOICE" | "YES_NO";
  options: string[];
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "ACTIVE" | "CLOSED";
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
  audience:
    | "ALL"
    | "ELIGIBLE"
    | "DELINQUENT_30"
    | "DELINQUENT_60"
    | "DELINQUENT_90"
    | "CUSTOM";
  customAudience?: string[];
  body: string;
  scheduledAt?: string;
  sentAt?: string;
  sent: number;
  delivered: number;
  failed: number;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
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
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
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
  androidSenderId?: string;
  privacyPolicyUrl?: string;
}

export type UserRole = "ADMIN" | "MEMBER" | "GUEST";

export interface User {
  id: string;
  role: UserRole;
  memberId?: string; // if role is MEMBER
}

// Event Management Types
export interface Event {
  id: string;
  _id?: string; // For backward compatibility with API responses
  title: string;
  description?: string;
  type:
    | "SERVICE"
    | "MEETING"
    | "SPECIAL_OCCASION"
    | "CONFERENCE"
    | "SOCIAL"
    | "OTHER";
  startDate: string;
  endDate: string;
  location: string;
  capacity?: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  allowWaitlist: boolean;
  maxWaitlist?: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  isRecurring: boolean;
  recurrencePattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  recurrenceEndDate?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  resources?: EventResource[];
  volunteers?: Volunteer[];
  registrations?: EventRegistration[];
  createdAt?: string;
  updatedAt?: string;

  // Virtual properties (calculated on backend)
  registrationCount?: number;
  availableSpots?: number | null;
  isFull?: boolean;
  timeUntilEvent?: number;
  isUpcoming?: boolean;
}

export interface EventResource {
  resource: {
    _id: string;
    name: string;
    type: "ROOM" | "EQUIPMENT" | "VEHICLE" | "OTHER";
    capacity?: number;
    location?: string;
    description?: string;
  };
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface EventRegistration {
  id: string;
  _id?: string;
  event: string;
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  status: "REGISTERED" | "ATTENDED" | "CANCELLED" | "NO_SHOW";
  registeredAt: string;
  attendedAt?: string;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  dietaryRestrictions?: string;
  specialRequirements?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Volunteer {
  id: string;
  _id?: string;
  event: string;
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  role: string;
  status: "ASSIGNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  assignedAt: string;
  confirmedAt?: string;
  notes?: string;
  shiftStart?: string;
  shiftEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id: string;
  _id?: string;
  name: string;
  type: "ROOM" | "EQUIPMENT" | "VEHICLE" | "OTHER";
  description?: string;
  capacity?: number;
  location?: string;
  isActive: boolean;
  bookingRules?: {
    maxAdvanceDays?: number;
    minAdvanceDays?: number;
    requiresApproval: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Event Form Types
export interface CreateEventRequest {
  title: string;
  description?: string;
  type:
    | "SERVICE"
    | "MEETING"
    | "SPECIAL_OCCASION"
    | "CONFERENCE"
    | "SOCIAL"
    | "OTHER";
  startDate: string;
  endDate: string;
  location: string;
  capacity?: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  allowWaitlist: boolean;
  maxWaitlist?: number;
  isRecurring: boolean;
  recurrencePattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  recurrenceEndDate?: string;
  resources?: EventResourceRequest[];
}

export interface EventResourceRequest {
  resource: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface RegisterEventRequest {
  eventId: string;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  dietaryRestrictions?: string;
  specialRequirements?: string;
}

export interface AssignVolunteerRequest {
  eventId: string;
  memberId: string;
  role: string;
  notes?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface CreateResourceRequest {
  name: string;
  type: "ROOM" | "EQUIPMENT" | "VEHICLE" | "OTHER";
  description?: string;
  capacity?: number;
  location?: string;
  bookingRules?: {
    maxAdvanceDays?: number;
    minAdvanceDays?: number;
    requiresApproval: boolean;
  };
}

// Event Query Types
export interface EventQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
