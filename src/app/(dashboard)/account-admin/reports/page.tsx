import { AccountReports } from "~/components/admin/account-reports";
import { AccountAdminBreadcrumb } from "~/components/admin/account-admin-breadcrumb";

export default function AccountAdminReportsPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisa estadísticas y métricas de tu cuenta
        </p>
      </div>

      <AccountReports />
    </div>
  );
}
