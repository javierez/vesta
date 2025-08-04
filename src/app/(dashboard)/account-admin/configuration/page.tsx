import { AccountConfiguration } from "~/components/admin/account/configuration";
import { AccountAdminBreadcrumb } from "~/components/admin/account/breadcrumb";

export default function AccountAdminConfigurationPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza y configura los ajustes de tu cuenta
        </p>
      </div>

      <AccountConfiguration />
    </div>
  );
}
