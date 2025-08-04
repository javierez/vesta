import { SystemSettings } from "~/components/admin/management/system-settings";
import { AdminBreadcrumb } from "~/components/admin/navigation/admin-breadcrumb";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración del Sistema
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configuraciones globales y parámetros del sistema
        </p>
      </div>

      <SystemSettings />
    </div>
  );
}
