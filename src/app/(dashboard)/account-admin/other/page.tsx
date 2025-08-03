import { AccountOther } from "~/components/admin/account-other";
import { AccountAdminBreadcrumb } from "~/components/admin/account-admin-breadcrumb";

export default function AccountAdminOtherPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Otras Opciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Funcionalidades adicionales y herramientas avanzadas
        </p>
      </div>

      <AccountOther />
    </div>
  );
}
