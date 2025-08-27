"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-nullish-coalescing */

import { useState, useEffect } from "react";

export interface GoogleCalendarIntegration {
  connected: boolean;
  lastSync: Date | null;
  loading: boolean;
  error: string | null;
}

export function useGoogleCalendarIntegration() {
  const [integration, setIntegration] = useState<GoogleCalendarIntegration>({
    connected: false,
    lastSync: null,
    loading: true,
    error: null,
  });

  // Check integration status on mount
  useEffect(() => {
    void checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      setIntegration((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/google/calendar/status");
      const data = (await response.json()) as {
        connected: boolean;
        lastSync?: string;
        error?: string;
      };

      if (response.ok) {
        setIntegration((prev) => ({
          ...prev,
          connected: Boolean(data.connected),
          lastSync: data.lastSync ? new Date(data.lastSync) : null,
          loading: false,
        }));
      } else {
        setIntegration((prev) => ({
          ...prev,
          error: data.error || "Failed to check integration status",
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error checking integration status:", error);
      setIntegration((prev) => ({
        ...prev,
        error: "Failed to check integration status",
        loading: false,
      }));
    }
  };

  const connect = async () => {
    try {
      setIntegration((prev) => ({ ...prev, loading: true, error: null }));

      // Redirect to OAuth flow
      window.location.href = "/api/google/calendar/connect";
    } catch (error) {
      console.error("Error connecting Google Calendar:", error);
      setIntegration((prev) => ({
        ...prev,
        error: "Failed to connect Google Calendar",
        loading: false,
      }));
    }
  };

  const disconnect = async () => {
    try {
      setIntegration((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/google/calendar/disconnect", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setIntegration({
          connected: false,
          lastSync: null,
          loading: false,
          error: null,
        });
        return { success: true, message: data.message };
      } else {
        setIntegration((prev) => ({
          ...prev,
          error: data.error || "Failed to disconnect",
          loading: false,
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      const errorMessage = "Failed to disconnect Google Calendar";
      setIntegration((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const syncNow = async () => {
    try {
      setIntegration((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/google/calendar/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setIntegration((prev) => ({
          ...prev,
          lastSync: new Date(),
          loading: false,
        }));
        return { success: true, syncedEvents: data.syncedEvents };
      } else {
        setIntegration((prev) => ({
          ...prev,
          error: data.error || "Sync failed",
          loading: false,
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error syncing calendar:", error);
      const errorMessage = "Failed to sync calendar";
      setIntegration((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    integration,
    connect,
    disconnect,
    syncNow,
    refresh: checkIntegrationStatus,
  };
}
