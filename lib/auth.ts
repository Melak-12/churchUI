import { UserRole, User } from "@/types";
import apiClient from "./api";

export function getCurrentUser(): User {
  // Check localStorage for user data
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          id: user.id,
          role: user.role,
          memberId: user.role === "MEMBER" ? user.id : undefined,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }

  // Default to guest if not authenticated
  return {
    id: "guest",
    role: "GUEST",
    memberId: undefined,
  };
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    return !!(token && userData);
  }
  return false;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.login(email, password);

    const user: User = {
      id: response.user.id,
      role: response.user.role,
      memberId: response.user.role === "MEMBER" ? response.user.id : undefined,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(response.user));
    }

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(userData: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  consent: boolean;
  password: string;
}): Promise<User> {
  try {
    const response = await apiClient.register(userData);

    const user: User = {
      id: response.user.id,
      role: response.user.role,
      memberId: response.user.role === "MEMBER" ? response.user.id : undefined,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(response.user));
    }

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export function hasPermission(role: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    GUEST: 0,
    MEMBER: 1,
    ADMIN: 2,
  };

  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard";
    case "MEMBER":
      return "/profile";
    case "GUEST":
      return "/login";
    default:
      return "/login";
  }
}
