import {
  Member,
  Vote,
  Communication,
  Settings,
  User,
  Event,
  EventRegistration,
  Volunteer,
  Resource,
  CreateEventRequest,
  RegisterEventRequest,
  AssignVolunteerRequest,
  CreateResourceRequest,
  EventQuery,
  Ministry,
  SmallGroup,
  Attendance,
  CreateMinistryRequest,
  UpdateMinistryRequest,
  CreateSmallGroupRequest,
  UpdateSmallGroupRequest,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  MinistryQuery,
  SmallGroupQuery,
  AttendanceQuery,
  Feedback,
  CreateFeedbackRequest,
  FeedbackQuery,
  FeedbackStats,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    role: "ADMIN" | "MEMBER";
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log("Making API request to:", url, "with options:", options);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response.data!;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    consent: boolean;
    password: string;
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    await this.request("/api/auth/logout", {
      method: "POST",
    });
    this.clearToken();
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.request<{ user: any }>("/api/auth/me");
    return response.data!.user;
  }

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<any> {
    const response = await this.request<{ user: any }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return response.data!.user;
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await this.request("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  // Members endpoints
  async getMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "PAID" | "DELINQUENT";
    eligibility?: "ELIGIBLE" | "NOT_ELIGIBLE";
  }): Promise<{ members: Member[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/members?${queryString}`
      : "/api/members";

    const response = await this.request<{ members: Member[]; pagination: any }>(
      endpoint
    );
    return {
      members: response.data?.members || [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
      },
    };
  }

  async getMember(id: string): Promise<Member> {
    const response = await this.request<{ member: Member }>(
      `/api/members/${id}`
    );
    return response.data!.member;
  }

  async createMember(
    memberData: Omit<Member, "id" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ): Promise<Member> {
    const response = await this.request<{ member: Member }>("/api/members", {
      method: "POST",
      body: JSON.stringify(memberData),
    });
    return response.data!.member;
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const response = await this.request<{ member: Member }>(
      `/api/members/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(memberData),
      }
    );
    return response.data!.member;
  }

  async deleteMember(id: string): Promise<void> {
    await this.request(`/api/members/${id}`, {
      method: "DELETE",
    });
  }

  // Votes endpoints
  async getVotes(params?: {
    page?: number;
    limit?: number;
    status?: "SCHEDULED" | "ACTIVE" | "CLOSED";
  }): Promise<{ votes: Vote[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/votes?${queryString}` : "/api/votes";

    const response = await this.request<{ votes: Vote[]; pagination: any }>(
      endpoint
    );
    return response.data!;
  }

  async getVote(id: string): Promise<Vote> {
    const response = await this.request<{ vote: Vote }>(`/api/votes/${id}`);
    return response.data!.vote;
  }

  async createVote(
    voteData: Omit<
      Vote,
      | "id"
      | "createdAt"
      | "eligibleCount"
      | "participationCount"
      | "participationPercent"
    >
  ): Promise<Vote> {
    console.log("API Client: Creating vote with data:", voteData);
    const response = await this.request<{ vote: Vote }>("/api/votes", {
      method: "POST",
      body: JSON.stringify(voteData),
    });
    console.log("API Client: Received response:", response);
    return response.data!.vote;
  }

  async updateVote(id: string, voteData: Partial<Vote>): Promise<Vote> {
    const response = await this.request<{ vote: Vote }>(`/api/votes/${id}`, {
      method: "PUT",
      body: JSON.stringify(voteData),
    });
    return response.data!.vote;
  }

  async deleteVote(id: string): Promise<void> {
    await this.request(`/api/votes/${id}`, {
      method: "DELETE",
    });
  }

  async castVote(voteId: string, option: string): Promise<void> {
    await this.request(`/api/votes/${voteId}/vote`, {
      method: "POST",
      body: JSON.stringify({ option }),
    });
  }

  async getVoteResults(voteId: string): Promise<Record<string, number>> {
    const response = await this.request<Record<string, number>>(
      `/api/votes/${voteId}/results`
    );
    return response.data!;
  }

  // Communications endpoints
  async getCommunications(params?: {
    page?: number;
    limit?: number;
    status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
    cacheBust?: boolean;
  }): Promise<{ communications: Communication[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && key !== "cacheBust") {
          searchParams.append(key, value.toString());
        }
      });
    }

    // Add cache busting parameter
    if (params?.cacheBust) {
      searchParams.append("_t", Date.now().toString());
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/communications?${queryString}`
      : "/api/communications";

    const response = await this.request<{
      communications: Communication[];
      pagination: any;
    }>(endpoint);
    return response.data!;
  }

  async getCommunication(id: string): Promise<Communication> {
    const response = await this.request<{ communication: Communication }>(
      `/api/communications/${id}`
    );
    return response.data!.communication;
  }

  async createCommunication(
    communicationData: Omit<
      Communication,
      "id" | "sent" | "delivered" | "failed" | "status"
    >
  ): Promise<Communication> {
    const response = await this.request<{ communication: Communication }>(
      "/api/communications",
      {
        method: "POST",
        body: JSON.stringify(communicationData),
      }
    );

    const communication = response.data!.communication;

    // Ensure we have an id field for frontend compatibility
    if (!communication.id && communication._id) {
      communication.id = communication._id.toString();
    }

    return communication;
  }

  async updateCommunication(
    id: string,
    communicationData: Partial<Communication>
  ): Promise<Communication> {
    const response = await this.request<Communication>(
      `/api/communications/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(communicationData),
      }
    );
    return response.data!;
  }

  async deleteCommunication(id: string): Promise<void> {
    await this.request(`/api/communications/${id}`, {
      method: "DELETE",
    });
  }

  async sendCommunication(id: string): Promise<void> {
    await this.request(`/api/communications/${id}/send`, {
      method: "POST",
    });
  }

  async scheduleCommunication(
    id: string,
    scheduledAt: string
  ): Promise<Communication> {
    const response = await this.request<Communication>(
      `/api/communications/${id}/schedule`,
      {
        method: "POST",
        body: JSON.stringify({ scheduledAt }),
      }
    );
    return response.data!;
  }

  async getCommunicationRecipients(
    id: string
  ): Promise<{ recipients: any[]; stats: any }> {
    const response = await this.request<{ recipients: any[]; stats: any }>(
      `/api/communications/${id}/recipients`
    );
    return response.data!;
  }

  async getCommunicationStats(): Promise<any> {
    const response = await this.request<any>("/api/communications/stats");
    return response.data!;
  }

  async testTwilio(phoneNumber: string, message: string): Promise<any> {
    const response = await this.request<any>(
      "/api/communications/test-twilio",
      {
        method: "POST",
        body: JSON.stringify({ phoneNumber, message }),
      }
    );
    return response.data!;
  }

  async getTwilioStatus(): Promise<any> {
    const response = await this.request<any>(
      "/api/communications/twilio-status"
    );
    return response.data!;
  }

  async testBulkSms(phoneNumber: string, messages: any[]): Promise<any> {
    const response = await this.request<any>(
      "/api/communications/test-bulk-sms",
      {
        method: "POST",
        body: JSON.stringify({ phoneNumber, messages }),
      }
    );
    return response.data!;
  }

  async getMemberStats(): Promise<any> {
    const response = await this.request<any>("/api/members/stats");
    return response.data!;
  }

  // Settings endpoints
  async getSettings(): Promise<Settings> {
    const response = await this.request<{ settings: Settings }>(
      "/api/settings"
    );
    return response.data!.settings;
  }

  async updateSettings(settingsData: Partial<Settings>): Promise<Settings> {
    const response = await this.request<{ settings: Settings }>(
      "/api/settings",
      {
        method: "PUT",
        body: JSON.stringify(settingsData),
      }
    );
    return response.data!.settings;
  }

  // Event Management endpoints
  async getEvents(
    params?: EventQuery
  ): Promise<{ events: Event[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/events?${queryString}` : "/api/events";

    const response = await this.request<{ events: Event[]; pagination: any }>(
      endpoint
    );
    return response.data!;
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/events/upcoming?${queryString}`
      : "/api/events/upcoming";

    const response = await this.request<Event[]>(endpoint);
    return response.data!;
  }

  async getCalendarEvents(start: string, end: string): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    searchParams.append("start", start);
    searchParams.append("end", end);

    const response = await this.request<Event[]>(
      `/api/events/calendar?${searchParams.toString()}`
    );
    return response.data!;
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.request<Event>(`/api/events/${id}`);
    return response.data!;
  }

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await this.request<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
    return response.data!;
  }

  async updateEvent(
    id: string,
    eventData: Partial<CreateEventRequest>
  ): Promise<Event> {
    const response = await this.request<Event>(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
    return response.data!;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request(`/api/events/${id}`, {
      method: "DELETE",
    });
  }

  // Event Registration endpoints
  async registerForEvent(
    eventId: string,
    registrationData: RegisterEventRequest
  ): Promise<EventRegistration> {
    const response = await this.request<EventRegistration>(
      `/api/event-registration/${eventId}/register`,
      {
        method: "POST",
        body: JSON.stringify(registrationData),
      }
    );
    return response.data!;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const response = await this.request<EventRegistration[]>(
      `/api/events/${eventId}/registrations`
    );
    return response.data!;
  }

  async updateRegistrationStatus(
    eventId: string,
    registrationId: string,
    status: string
  ): Promise<EventRegistration> {
    const response = await this.request<EventRegistration>(
      `/api/events/${eventId}/registrations/${registrationId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
    return response.data!;
  }

  // Volunteer Management endpoints
  async assignVolunteer(
    eventId: string,
    volunteerData: AssignVolunteerRequest
  ): Promise<Volunteer> {
    const response = await this.request<Volunteer>(
      `/api/events/${eventId}/volunteers`,
      {
        method: "POST",
        body: JSON.stringify(volunteerData),
      }
    );
    return response.data!;
  }

  async getEventVolunteers(eventId: string): Promise<Volunteer[]> {
    const response = await this.request<Volunteer[]>(
      `/api/events/${eventId}/volunteers`
    );
    return response.data!;
  }

  async updateVolunteerStatus(
    eventId: string,
    volunteerId: string,
    status: string
  ): Promise<Volunteer> {
    const response = await this.request<Volunteer>(
      `/api/events/${eventId}/volunteers/${volunteerId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
    return response.data!;
  }

  async removeVolunteer(eventId: string, volunteerId: string): Promise<void> {
    await this.request(`/api/events/${eventId}/volunteers/${volunteerId}`, {
      method: "DELETE",
    });
  }

  // Resource Management endpoints
  async getResources(params?: {
    type?: string;
    available?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<Resource[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/events/resources?${queryString}`
      : "/api/events/resources";

    const response = await this.request<Resource[]>(endpoint);
    return response.data!;
  }

  async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    const response = await this.request<Resource>("/api/events/resources", {
      method: "POST",
      body: JSON.stringify(resourceData),
    });
    return response.data!;
  }

  async assignResourceToEvent(
    eventId: string,
    resourceData: {
      resourceId: string;
      startTime?: string;
      endTime?: string;
      notes?: string;
    }
  ): Promise<any> {
    const response = await this.request<any>(
      `/api/events/${eventId}/resources`,
      {
        method: "POST",
        body: JSON.stringify(resourceData),
      }
    );
    return response.data!;
  }

  async removeResourceFromEvent(
    eventId: string,
    resourceId: string
  ): Promise<void> {
    await this.request(`/api/events/${eventId}/resources/${resourceId}`, {
      method: "DELETE",
    });
  }

  // Financial Management endpoints
  async getPayments(params?: {
    page?: number;
    limit?: number;
    memberId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ payments: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/financial/payments?${queryString}`
      : "/api/financial/payments";

    const response = await this.request<{ payments: any[]; pagination: any }>(
      endpoint
    );
    return response.data!;
  }

  async createPayment(paymentData: {
    memberId: string;
    type: string;
    amount: number;
    method: string;
    paymentDate?: string;
    description?: string;
    category?: string;
    metadata?: any;
  }): Promise<any> {
    const response = await this.request<{ payment: any }>(
      "/api/financial/payments",
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return response.data!.payment;
  }

  async getPaymentStats(startDate?: string, endDate?: string): Promise<any> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/financial/payments/stats?${queryString}`
      : "/api/financial/payments/stats";

    const response = await this.request<{ stats: any }>(endpoint);
    return response.data!.stats;
  }

  async getFinancialSummary(
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/financial/financial/summary?${queryString}`
      : "/api/financial/financial/summary";

    const response = await this.request<any>(endpoint);
    return response.data!;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/financial/transactions?${queryString}`
      : "/api/financial/transactions";

    const response = await this.request<{
      transactions: any[];
      pagination: any;
    }>(endpoint);
    return response.data!;
  }

  async createTransaction(transactionData: {
    type: string;
    category: string;
    amount: number;
    description: string;
    paymentMethod: string;
    transactionDate?: string;
    budgetCategory?: string;
    tags?: string[];
  }): Promise<any> {
    const response = await this.request<{ transaction: any }>(
      "/api/financial/transactions",
      {
        method: "POST",
        body: JSON.stringify(transactionData),
      }
    );
    return response.data!.transaction;
  }

  // Member Portal endpoints
  async getFamily(): Promise<any> {
    const response = await this.request<{ family: any }>(
      "/api/member-portal/family"
    );
    return response.data!.family;
  }

  async getDocuments(params?: {
    category?: string;
    search?: string;
    tags?: string;
    page?: number;
    limit?: number;
  }): Promise<{ documents: any[] }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/member-portal/documents?${queryString}`
      : "/api/member-portal/documents";

    const response = await this.request<{ documents: any[] }>(endpoint);
    return response.data!;
  }

  async getDocumentCategories(): Promise<{ categories: any[] }> {
    const response = await this.request<{ categories: any[] }>(
      "/api/member-portal/documents/categories"
    );
    return response.data!;
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/api/member-portal/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download document");
    }

    return response.blob();
  }

  // Enhanced Event Registration endpoints
  async registerForEventNew(
    eventId: string,
    registrationData: {
      notes?: string;
      emergencyContact?: {
        name?: string;
        phone?: string;
      };
      dietaryRestrictions?: string;
      specialRequirements?: string;
    }
  ): Promise<any> {
    const response = await this.request<{ registration: any }>(
      `/api/event-registration/${eventId}/register`,
      {
        method: "POST",
        body: JSON.stringify(registrationData),
      }
    );
    return response.data!.registration;
  }

  async cancelEventRegistration(eventId: string): Promise<any> {
    const response = await this.request<{ registration: any }>(
      `/api/event-registration/${eventId}/register/cancel`,
      {
        method: "PUT",
      }
    );
    return response.data!.registration;
  }

  async getMyRegistrations(params?: {
    status?: string;
    upcoming?: boolean;
  }): Promise<{ registrations: any[] }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/event-registration/my-registrations?${queryString}`
      : "/api/event-registration/my-registrations";

    const response = await this.request<{ registrations: any[] }>(endpoint);
    return response.data!;
  }

  async getEventRegistrationsNew(
    eventId: string,
    status?: string
  ): Promise<{ registrations: any[]; stats: any }> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append("status", status);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/event-registration/${eventId}/registrations?${queryString}`
      : `/api/event-registration/${eventId}/registrations`;

    const response = await this.request<{ registrations: any[]; stats: any }>(
      endpoint
    );
    return response.data!;
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> {
    const response = await this.request<{
      success: boolean;
      message: string;
      timestamp: string;
      uptime: number;
      environment: string;
    }>("/health");
    return response.data!;
  }

  // Ministry Management API
  async getMinistries(
    params?: MinistryQuery
  ): Promise<{ ministries: Ministry[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/ministries?${queryString}`
      : "/api/ministries";

    const response = await this.request<any>(endpoint);
    return {
      ministries: response.data || [],
      pagination: response.pagination,
    };
  }

  async getMinistry(
    id: string
  ): Promise<{ ministry: Ministry; smallGroups: SmallGroup[] }> {
    const response = await this.request<{
      ministry: Ministry;
      smallGroups: SmallGroup[];
    }>(`/api/ministries/${id}`);
    return response.data!;
  }

  async createMinistry(data: CreateMinistryRequest): Promise<Ministry> {
    const response = await this.request<Ministry>("/api/ministries", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateMinistry(
    id: string,
    data: UpdateMinistryRequest
  ): Promise<Ministry> {
    const response = await this.request<Ministry>(`/api/ministries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteMinistry(id: string): Promise<void> {
    await this.request(`/api/ministries/${id}`, {
      method: "DELETE",
    });
  }

  async getMinistryStats(): Promise<any> {
    const response = await this.request<any>("/api/ministries/stats");
    return response.data!;
  }

  async addMinistryMember(
    ministryId: string,
    memberId: string
  ): Promise<Ministry> {
    const response = await this.request<Ministry>(
      `/api/ministries/${ministryId}/members`,
      {
        method: "POST",
        body: JSON.stringify({ memberId }),
      }
    );
    return response.data!;
  }

  async removeMinistryMember(
    ministryId: string,
    memberId: string
  ): Promise<Ministry> {
    const response = await this.request<Ministry>(
      `/api/ministries/${ministryId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    );
    return response.data!;
  }

  async promoteToCoLeader(
    ministryId: string,
    memberId: string
  ): Promise<Ministry> {
    const response = await this.request<Ministry>(
      `/api/ministries/${ministryId}/co-leaders`,
      {
        method: "POST",
        body: JSON.stringify({ memberId }),
      }
    );
    return response.data!;
  }

  async demoteFromCoLeader(
    ministryId: string,
    memberId: string
  ): Promise<Ministry> {
    const response = await this.request<Ministry>(
      `/api/ministries/${ministryId}/co-leaders/${memberId}`,
      {
        method: "DELETE",
      }
    );
    return response.data!;
  }

  // Small Group Management API
  async getSmallGroups(
    params?: SmallGroupQuery
  ): Promise<{ smallGroups: SmallGroup[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/small-groups?${queryString}`
      : "/api/small-groups";

    const response = await this.request<{
      smallGroups: SmallGroup[];
      pagination?: any;
    }>(endpoint);
    return response.data!;
  }

  async getSmallGroup(id: string): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>(`/api/small-groups/${id}`);
    return response.data!;
  }

  async createSmallGroup(data: CreateSmallGroupRequest): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>("/api/small-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateSmallGroup(
    id: string,
    data: UpdateSmallGroupRequest
  ): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>(`/api/small-groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteSmallGroup(id: string): Promise<void> {
    await this.request(`/api/small-groups/${id}`, {
      method: "DELETE",
    });
  }

  async getSmallGroupStats(): Promise<any> {
    const response = await this.request<any>("/api/small-groups/stats");
    return response.data!;
  }

  async getAvailableSmallGroups(): Promise<SmallGroup[]> {
    const response = await this.request<SmallGroup[]>(
      "/api/small-groups/available"
    );
    return response.data!;
  }

  async joinSmallGroup(id: string): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>(
      `/api/small-groups/${id}/join`,
      {
        method: "POST",
      }
    );
    return response.data!;
  }

  async leaveSmallGroup(id: string): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>(
      `/api/small-groups/${id}/leave`,
      {
        method: "POST",
      }
    );
    return response.data!;
  }

  async addSmallGroupMember(
    smallGroupId: string,
    memberId: string
  ): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>(
      `/api/small-groups/${smallGroupId}/members`,
      {
        method: "POST",
        body: JSON.stringify({ memberId }),
      }
    );
    return response.data!;
  }

  async removeSmallGroupMember(
    smallGroupId: string,
    memberId: string
  ): Promise<SmallGroup> {
    const response = await this.request<SmallGroup>(
      `/api/small-groups/${smallGroupId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    );
    return response.data!;
  }

  // Attendance Management API
  async getAttendance(
    params?: AttendanceQuery
  ): Promise<{ attendance: Attendance[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/attendance?${queryString}`
      : "/api/attendance";

    const response = await this.request<any>(endpoint);
    return {
      attendance: response.data || [],
      pagination: response.pagination,
    };
  }

  async getAttendanceRecord(id: string): Promise<Attendance> {
    const response = await this.request<Attendance>(`/api/attendance/${id}`);
    return response.data!;
  }

  async createAttendance(data: CreateAttendanceRequest): Promise<Attendance> {
    const response = await this.request<Attendance>("/api/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateAttendance(
    id: string,
    data: UpdateAttendanceRequest
  ): Promise<Attendance> {
    const response = await this.request<Attendance>(`/api/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteAttendance(id: string): Promise<void> {
    await this.request(`/api/attendance/${id}`, {
      method: "DELETE",
    });
  }

  async getAttendanceStats(startDate?: string, endDate?: string): Promise<any> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/attendance/stats?${queryString}`
      : "/api/attendance/stats";

    const response = await this.request<any>(endpoint);
    return response.data!;
  }

  async getMemberAttendance(
    memberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ attendance: Attendance[]; stats: any }> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/attendance/member/${memberId}?${queryString}`
      : `/api/attendance/member/${memberId}`;

    const response = await this.request<{
      attendance: Attendance[];
      stats: any;
    }>(endpoint);
    return response.data!;
  }

  async getServiceAttendance(
    date: string,
    serviceType?: string
  ): Promise<Attendance[]> {
    const searchParams = new URLSearchParams();
    if (serviceType) searchParams.append("serviceType", serviceType);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/attendance/service/${date}?${queryString}`
      : `/api/attendance/service/${date}`;

    const response = await this.request<Attendance[]>(endpoint);
    return response.data!;
  }

  async checkOutAttendance(
    id: string,
    checkOutTime?: string
  ): Promise<Attendance> {
    const response = await this.request<Attendance>(
      `/api/attendance/${id}/checkout`,
      {
        method: "POST",
        body: JSON.stringify({ checkOutTime }),
      }
    );
    return response.data!;
  }

  // QR Code Attendance API
  async generateMemberQRCode(memberId: string): Promise<{
    qrCode: string;
    member: {
      id: string;
      name: string;
      phone: string;
    };
  }> {
    const response = await this.request<{
      qrCode: string;
      member: {
        id: string;
        name: string;
        phone: string;
      };
    }>(`/api/attendance/qr/${memberId}`);
    return response.data!;
  }

  async processQRScan(
    qrData: string,
    serviceType?: string,
    serviceTime?: string,
    notes?: string
  ): Promise<Attendance> {
    const response = await this.request<Attendance>("/api/attendance/qr-scan", {
      method: "POST",
      body: JSON.stringify({ qrData, serviceType, serviceTime, notes }),
    });
    return response.data!;
  }

  async exportAttendance(
    startDate?: string,
    endDate?: string,
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);
    searchParams.append("format", format);

    const response = await fetch(
      `${this.baseURL}/api/attendance/export?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export attendance data");
    }

    return response.blob();
  }

  // Ministry Settings API
  async getMinistrySettings(): Promise<any> {
    const response = await this.request<any>("/api/ministries/settings");
    return response.data!;
  }

  async updateMinistrySettings(settingsData: any): Promise<any> {
    const response = await this.request<any>("/api/ministries/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData),
    });
    return response.data!;
  }

  async resetMinistrySettings(): Promise<any> {
    const response = await this.request<any>("/api/ministries/settings/reset", {
      method: "POST",
    });
    return response.data!;
  }

  // ==================== Feedback Methods ====================

  async submitFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
    const response = await this.request<{ feedback: Feedback }>(
      "/api/feedback",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!.feedback;
  }

  async getMyFeedback(): Promise<Feedback[]> {
    const response = await this.request<{ feedbacks: Feedback[] }>(
      "/api/feedback/my-feedback"
    );
    return response.data!.feedbacks;
  }

  async getAllFeedback(
    query?: FeedbackQuery
  ): Promise<{ feedbacks: Feedback[]; pagination?: any }> {
    const queryString = query
      ? new URLSearchParams(query as any).toString()
      : "";
    const endpoint = queryString
      ? `/api/feedback?${queryString}`
      : "/api/feedback";

    const response = await this.request<{ feedbacks: Feedback[] }>(endpoint);
    return {
      feedbacks: response.data!.feedbacks,
      pagination: response.pagination,
    };
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    const response = await this.request<{ stats: FeedbackStats }>(
      "/api/feedback/stats"
    );
    return response.data!.stats;
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await this.request<{ feedback: Feedback }>(
      `/api/feedback/${id}`
    );
    return response.data!.feedback;
  }

  async markFeedbackAsReviewed(
    id: string,
    adminNotes?: string
  ): Promise<Feedback> {
    const response = await this.request<{ feedback: Feedback }>(
      `/api/feedback/${id}/review`,
      {
        method: "PATCH",
        body: JSON.stringify({ adminNotes }),
      }
    );
    return response.data!.feedback;
  }

  async resolveFeedback(id: string, adminNotes?: string): Promise<Feedback> {
    const response = await this.request<{ feedback: Feedback }>(
      `/api/feedback/${id}/resolve`,
      {
        method: "PATCH",
        body: JSON.stringify({ adminNotes }),
      }
    );
    return response.data!.feedback;
  }

  async archiveFeedback(id: string): Promise<void> {
    await this.request(`/api/feedback/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
