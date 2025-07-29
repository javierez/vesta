"use client";

import { useEffect, useState } from "react";
import { useSession } from "~/lib/auth-client";

export function useUserRole() {
  const { data: session, isPending } = useSession();
  const [userRoles, setUserRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Since middleware already validates authentication,
        // this call should be fast and only needed once per session
        const response = await fetch(`/api/user-roles/${session.user.id}`);
        if (response.ok) {
          const roles = await response.json();
          setUserRoles(roles.map((role: any) => Number(role.roleId)));
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [session?.user?.id]);

  const hasRole = (roleId: number) => userRoles.includes(roleId);
  const isSuperAdmin = () => hasRole(2);

  return {
    userRoles,
    hasRole,
    isSuperAdmin,
    loading: isPending || loading,
  };
}