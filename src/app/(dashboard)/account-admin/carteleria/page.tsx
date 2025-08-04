import { AccountAdminBreadcrumb } from "~/components/admin/account/breadcrumb";
import { Carteleria } from "~/components/admin/carteleria";

export default function AccountAdminCarteleriaPage() {
  return (
    <div className="space-y-6">
      <AccountAdminBreadcrumb />
      <Carteleria />
    </div>
  );
}
