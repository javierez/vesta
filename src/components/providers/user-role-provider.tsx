"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

interface UserRoleContextType {
  roles: string[];
  permissions: Permission[];
  hasRole: (roleName: string) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  isAgent: () => boolean;
  isViewer: () => boolean;
  hasRoleId: (roleId: number) => boolean;
  isSuperAdmin: () => boolean;
  userRoles: number[];
  loading: boolean;
  session: EnrichedSession | null;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [enrichedSession, setEnrichedSession] = useState<EnrichedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [legacyRoles, setLegacyRoles] = useState<number[]>([]);

  useEffect(() => {
    async function fetchEnrichedSession() {
      const userId = session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Only fetch legacy roles API - enriched session is handled by middleware
        const legacyResponse = await fetch(`/api/user-roles/${userId}`);
        
        // Handle legacy roles API
        if (legacyResponse.ok) {
          const roles = await legacyResponse.json() as { roleId: string }[];
          const roleIds = roles.map((role) => Number(role.roleId));
          setLegacyRoles(roleIds);
        }
        
        // Use basic session as enriched session
        if (session) {
          setEnrichedSession(session as EnrichedSession);
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        // Fallback to basic session
        if (session) setEnrichedSession(session as EnrichedSession);
      } finally {
        setLoading(false);
      }
    }

    void fetchEnrichedSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]); // Only depend on user ID, not entire session object

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

  const value: UserRoleContextType = {
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

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}