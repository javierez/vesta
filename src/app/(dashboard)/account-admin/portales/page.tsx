import { PortalConfiguration } from "~/components/admin/account/portal-configuration";
import { AccountAdminBreadcrumb } from "~/components/admin/account/breadcrumb";

export default function AccountAdminPortalesPage() {
  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
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
