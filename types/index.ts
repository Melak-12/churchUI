export interface Member {
  id: string;
  _id?: string; // For backward compatibility with API responses
  firstName?: string;
  lastName?: string;
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
  hasVoted?: boolean;
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
  androidApiKey?: string;
  androidSecret?: string;
  androidRateLimit?: number;
  androidEndpoint?: string;
  privacyPolicyUrl?: string;
  features?: {
    events: boolean;
    financial: boolean;
    communications: boolean;
    voting: boolean;
    memberPortal: boolean;
    ministries: boolean;
    attendance: boolean;
    dataCollection: boolean;
  };
}

export type UserRole = "ADMIN" | "MEMBER" | "GUEST";

export interface User {
  id: string;
  role: UserRole;
  memberId?: string; // if role is MEMBER
  firstName?: string;
  lastName?: string;
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
  status: "REGISTERED" | "ATTENDED" | "CANCELLED" | "NO_SHOW" | "WAITLISTED";
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
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
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
  memberId?: string; // Optional for self-registration, required for admin registration
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

// Ministry Management Types
export interface Ministry {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  category:
    | "WORSHIP"
    | "CHILDREN"
    | "YOUTH"
    | "ADULTS"
    | "SENIORS"
    | "OUTREACH"
    | "ADMINISTRATION"
    | "OTHER";
  status: "ACTIVE" | "INACTIVE" | "PLANNING";
  leader: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  coLeaders?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }>;
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }>;
  meetingSchedule?: {
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "AS_NEEDED";
    dayOfWeek?: number;
    time?: string;
    location?: string;
    notes?: string;
  };
  goals?: string[];
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  isActive: boolean;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
  memberCount?: number;
}

export interface SmallGroup {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  ministry?: {
    _id: string;
    name: string;
    category: string;
  };
  leader: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  coLeaders?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }>;
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }>;
  maxMembers?: number;
  meetingSchedule: {
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    dayOfWeek: number;
    time: string;
    location: string;
    address?: string;
    notes?: string;
  };
  studyMaterial?: {
    title: string;
    author?: string;
    startDate: string;
    endDate?: string;
    currentLesson?: number;
    totalLessons?: number;
  };
  demographics?: {
    ageRange?: {
      min: number;
      max: number;
    };
    targetAudience?: "SINGLES" | "COUPLES" | "FAMILIES" | "SENIORS" | "MIXED";
    genderPreference?: "MALE" | "FEMALE" | "MIXED";
  };
  status: "ACTIVE" | "INACTIVE" | "FULL" | "RECRUITING";
  isActive: boolean;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
  memberCount?: number;
  availableSpots?: number | null;
  isFull?: boolean;
  nextMeeting?: string | null;
}

// Attendance Management Types
export interface Attendance {
  id: string;
  _id?: string;
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  event?: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  service?: {
    date: string;
    type: "SUNDAY_SERVICE" | "WEDNESDAY_SERVICE" | "SPECIAL_SERVICE" | "OTHER";
    time?: string;
  };
  ministry?: {
    _id: string;
    name: string;
    category: string;
  };
  smallGroup?: {
    _id: string;
    name: string;
  };
  checkInTime: string;
  checkOutTime?: string;
  method: "MANUAL" | "QR_CODE" | "MOBILE_APP" | "KIOSK";
  notes?: string;
  recordedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  duration?: number | null;
  isPresent?: boolean;
}

// Request Types
export interface CreateMinistryRequest {
  name: string;
  description?: string;
  category:
    | "WORSHIP"
    | "CHILDREN"
    | "YOUTH"
    | "ADULTS"
    | "SENIORS"
    | "OUTREACH"
    | "ADMINISTRATION"
    | "OTHER";
  leader: string;
  coLeaders?: string[];
  members?: string[];
  meetingSchedule?: {
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "AS_NEEDED";
    dayOfWeek?: number;
    time?: string;
    location?: string;
    notes?: string;
  };
  goals?: string[];
  budget?: {
    allocated: number;
    currency: string;
  };
}

export interface UpdateMinistryRequest {
  name?: string;
  description?: string;
  category?:
    | "WORSHIP"
    | "CHILDREN"
    | "YOUTH"
    | "ADULTS"
    | "SENIORS"
    | "OUTREACH"
    | "ADMINISTRATION"
    | "OTHER";
  status?: "ACTIVE" | "INACTIVE" | "PLANNING";
  leader?: string;
  coLeaders?: string[];
  members?: string[];
  meetingSchedule?: {
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "AS_NEEDED";
    dayOfWeek?: number;
    time?: string;
    location?: string;
    notes?: string;
  };
  goals?: string[];
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

export interface CreateSmallGroupRequest {
  name: string;
  description?: string;
  ministry?: string;
  leader: string;
  coLeaders?: string[];
  members?: string[];
  maxMembers?: number;
  meetingSchedule: {
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    dayOfWeek: number;
    time: string;
    location: string;
    address?: string;
    notes?: string;
  };
  studyMaterial?: {
    title: string;
    author?: string;
    startDate: string;
    endDate?: string;
    currentLesson?: number;
    totalLessons?: number;
  };
  demographics?: {
    ageRange?: {
      min: number;
      max: number;
    };
    targetAudience?: "SINGLES" | "COUPLES" | "FAMILIES" | "SENIORS" | "MIXED";
    genderPreference?: "MALE" | "FEMALE" | "MIXED";
  };
}

export interface UpdateSmallGroupRequest {
  name?: string;
  description?: string;
  ministry?: string;
  leader?: string;
  coLeaders?: string[];
  members?: string[];
  maxMembers?: number;
  meetingSchedule?: {
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    dayOfWeek: number;
    time: string;
    location: string;
    address?: string;
    notes?: string;
  };
  studyMaterial?: {
    title: string;
    author?: string;
    startDate: string;
    endDate?: string;
    currentLesson?: number;
    totalLessons?: number;
  };
  demographics?: {
    ageRange?: {
      min: number;
      max: number;
    };
    targetAudience?: "SINGLES" | "COUPLES" | "FAMILIES" | "SENIORS" | "MIXED";
    genderPreference?: "MALE" | "FEMALE" | "MIXED";
  };
  status?: "ACTIVE" | "INACTIVE" | "FULL" | "RECRUITING";
}

export interface CreateAttendanceRequest {
  member: string;
  event?: string;
  service?: {
    date: string;
    type: "SUNDAY_SERVICE" | "WEDNESDAY_SERVICE" | "SPECIAL_SERVICE" | "OTHER";
    time?: string;
  };
  ministry?: string;
  smallGroup?: string;
  checkInTime?: string;
  method?: "MANUAL" | "QR_CODE" | "MOBILE_APP" | "KIOSK";
  notes?: string;
}

export interface UpdateAttendanceRequest {
  checkOutTime?: string;
  notes?: string;
}

// Query Types
export interface MinistryQuery {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  leader?: string;
  search?: string;
}

export interface SmallGroupQuery {
  page?: number;
  limit?: number;
  ministry?: string;
  status?: string;
  leader?: string;
  available?: boolean;
  search?: string;
}

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  member?: string;
  event?: string;
  ministry?: string;
  smallGroup?: string;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
}

// Feedback interfaces
export interface Feedback {
  id: string;
  _id?: string;
  member: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  rating: number;
  category:
    | "general"
    | "worship"
    | "events"
    | "facilities"
    | "communication"
    | "website"
    | "suggestion"
    | "complaint";
  feedback: string;
  status: "pending" | "reviewed" | "resolved" | "archived";
  adminNotes?: string;
  reviewedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  rating: number;
  category: string;
  feedback: string;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FeedbackStats {
  averageRating: number;
  ratingDistribution: Record<number, number>;
  categoryStats: Array<{
    category: string;
    count: number;
    avgRating: number;
  }>;
  totalCount: number;
  pendingCount: number;
}
