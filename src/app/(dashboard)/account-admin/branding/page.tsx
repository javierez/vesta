import { AccountBranding } from "~/components/admin/account/branding";
import { AccountAdminBreadcrumb } from "~/components/admin/account/breadcrumb";

export default function AccountAdminBrandingPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marca y Logo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona la identidad visual y elementos de marca
        </p>
      </div>

      <AccountBranding />
    </div>
  );
}
