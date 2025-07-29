"use client";

import { useEffect, useState } from "react";
import { useSession } from "~/lib/auth-client";
import type { Permission } from "~/lib/permissions";

interface EnrichedSession {
  user: {
    id: string;
    roles?: string[];
    permissions?: Permission[];
    [key: string]: unknown;
  };
}

export function useUserRole() {
  const { data: session, isPending } = useSession();
  const [enrichedSession, setEnrichedSession] = useState<EnrichedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [legacyRoles, setLegacyRoles] = useState<number[]>([]);

  useEffect(() => {
    async function fetchEnrichedSession() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Try both endpoints for maximum compatibility
        const [enrichedResponse, legacyResponse] = await Promise.all([
          fetch("/api/auth/enriched-session"),
          fetch(`/api/user-roles/${session.user.id}`)
        ]);
        
        console.log("API responses:", {
          enrichedStatus: enrichedResponse.status,
          legacyStatus: legacyResponse.status
        });
        
        // Handle legacy roles API
        if (legacyResponse.ok) {
          const roles = await legacyResponse.json() as { roleId: number }[];
          const roleIds = (roles as { roleId: number }[]).map((role) => Number(role.roleId));
          setLegacyRoles(roleIds);
          console.log("Legacy role IDs:", roleIds);
        }
        
        // Handle enriched session
        if (enrichedResponse.ok) {
          const enrichedData = await enrichedResponse.json() as EnrichedSession;
          console.log("Enriched session data:", enrichedData);
          setEnrichedSession(enrichedData);
        } else {
          const errorData = await enrichedResponse.json() as { error?: string };
          console.error("Enriched session error:", errorData);
          // Fallback to basic session if enriched session fails
          if (session) setEnrichedSession(session as EnrichedSession);
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        // Fallback to basic session
        if (session) setEnrichedSession(session as EnrichedSession);
      } finally {
        setLoading(false);
      }
    }

    void fetchEnrichedSession();
  }, [session]);

  // Role checking functions
  const hasRole = (roleName: string) => 
    enrichedSession?.user?.roles?.includes(roleName) ?? false;
  
  const hasPermission = (permission: Permission) => 
    enrichedSession?.user?.permissions?.includes(permission) ?? false;
  
  const hasAnyPermission = (permissions: Permission[]) => 
    permissions.some(permission => hasPermission(permission));
  
  const hasAllPermissions = (permissions: Permission[]) => 
    permissions.every(permission => hasPermission(permission));

  const isAdmin = () => hasRole("admin");
  const isAgent = () => hasRole("agent");
  const isViewer = () => hasRole("viewer");
  
  // Specific role ID checking (as requested by user)
  const hasRoleId = (roleId: number) => {
    console.log("Checking hasRoleId:", roleId, {
      enrichedRoles: enrichedSession?.user?.roles,
      legacyRoles: legacyRoles
    });
    
    // First check legacy roles directly
    if (legacyRoles.includes(roleId)) {
      return true;
    }
    
    // Then check mapped role names
    // Since role ID 2 maps to "agent" in the database seed data
    if (roleId === 2) {
      return hasRole("agent");
    }
    // Role ID 1 maps to "admin"
    if (roleId === 1) {
      return hasRole("admin");
    }
    return false;
  };

  // Legacy compatibility
  const isSuperAdmin = () => hasRoleId(2); // As specifically requested
  const userRoles = enrichedSession?.user?.roles?.map(() => 1) ?? []; // Legacy number array

  return {
    // New role/permission checking
    roles: enrichedSession?.user?.roles ?? [],
    permissions: enrichedSession?.user?.permissions ?? [],
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isAgent,
    isViewer,
    
    // Legacy compatibility  
    userRoles,
    isSuperAdmin,
    hasRoleId,
    
    loading: isPending || loading,
    session: enrichedSession,
  };
}