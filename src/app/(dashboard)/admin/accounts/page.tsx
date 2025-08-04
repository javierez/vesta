import { AccountsManagement } from "~/components/admin/management/accounts";
import { AdminBreadcrumb } from "~/components/admin/navigation/admin-breadcrumb";

export default function AdminAccountsPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Cuentas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra las cuentas de la plataforma
        </p>
      </div>

      <AccountsManagement />
    </div>
  );
}
