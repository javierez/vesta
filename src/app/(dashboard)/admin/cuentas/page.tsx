import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { userHasRole } from "~/server/queries/user-roles";
import { AccountsManagement } from "~/components/admin/accounts-management";
import Link from "next/link";

export default async function AdminCuentasPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user has role ID 2 (superadmin)
  const hasRequiredRole = await userHasRole(session.user.id, 2);

  if (!hasRequiredRole) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-700">
          Administración
        </Link>{" "}
        / Gestión de Cuentas
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Cuentas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra cuentas y organizaciones del sistema
        </p>
      </div>

      <AccountsManagement />
    </div>
  );
}
