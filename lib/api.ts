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
      `/api/events/${eventId}/register`,
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
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
