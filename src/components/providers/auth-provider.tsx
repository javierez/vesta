"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types for authentication state
interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  accountId?: number;
  phone?: string;
  timezone?: string;
  language?: string;
  image?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Fetch current user session
  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/get-session", {
        credentials: "include",
      });

      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData?.user) {
          // Map the session data to our User type
          const userData: User = {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name || sessionData.user.firstName || "",
            firstName: sessionData.user.firstName,
            lastName: sessionData.user.lastName || "",
            accountId: sessionData.user.accountId,
            phone: sessionData.user.phone || "",
            timezone: sessionData.user.timezone || "UTC",
            language: sessionData.user.language || "en",
            image: sessionData.user.image,
            emailVerified: sessionData.user.emailVerified,
          };
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        await fetchUser(); // Refresh user data after login
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear the local state
      setUser(null);
      router.push("/");
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchUser();
  };

  // Check authentication status on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Optional: Export the context for advanced use cases
export { AuthContext };