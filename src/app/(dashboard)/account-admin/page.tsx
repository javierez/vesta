import { AccountAdminNavigationCards } from "~/components/admin/account-admin-navigation-cards";

export default function AccountAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Administración de Cuenta
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Panel de administración para administradores de cuenta. Selecciona el
          área que deseas administrar.
        </p>
      </div>

      <AccountAdminNavigationCards />
    </div>
  );
}
