import { PortalConfiguration } from "~/components/admin/account/portal-configuration";
import { AccountAdminBreadcrumb } from "~/components/admin/account/breadcrumb";

export default function AccountAdminPortalesPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración de Portales
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona la publicación automática en los principales portales
          inmobiliarios
        </p>
      </div>

      <PortalConfiguration />
    </div>
  );
}
