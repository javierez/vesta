import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { userHasRole } from "~/server/queries/user-roles";
import { SuperAdminDashboard } from "~/components/admin/super-admin-dashboard";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers()),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user has superadmin role (role ID 2)
  const isSuperAdmin = await userHasRole(session.user.id, 2);
  
  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Panel de administración para superadministradores
        </p>
      </div>
      
      <SuperAdminDashboard />
    </div>
  );
}