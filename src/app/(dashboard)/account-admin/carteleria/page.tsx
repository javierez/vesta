import { AccountAdminBreadcrumb } from "~/components/admin/account-admin-breadcrumb";
import { CarteleriaTemplates } from "~/components/admin/carteleria-templates";

export default function AccountAdminCarteleriaPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cartelería</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selecciona y personaliza plantillas para carteles inmobiliarios
        </p>
      </div>

      <CarteleriaTemplates />
    </div>
  );
}