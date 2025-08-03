import { UsersManagement } from "~/components/admin/users-management";
import { AdminBreadcrumb } from "~/components/admin/admin-breadcrumb";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Usuarios
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>

      <UsersManagement />
    </div>
  );
}
