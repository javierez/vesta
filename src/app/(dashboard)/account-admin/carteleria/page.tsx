import { AccountAdminBreadcrumb } from "~/components/admin/account-admin-breadcrumb";
import { CarteleriaRedesigned } from "~/components/admin/carteleria-redesigned";

export default function AccountAdminCarteleriaPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />
      <CarteleriaRedesigned />
    </div>
  );
}
