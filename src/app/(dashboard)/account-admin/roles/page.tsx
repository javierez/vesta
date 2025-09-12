import { getAccountRolesWithAuth, ensureAccountRolesWithAuth } from "~/server/queries/account-roles";
import PrivacyPermissionsClient from "./privacy-client";

export const dynamic = 'force-dynamic';

export default async function PrivacyPermissionsPage() {
  // Ensure account has roles configured (for existing accounts that might not have roles)
  await ensureAccountRolesWithAuth();
  
  // Fetch roles from database using the auth wrapper
  const rolesData = await getAccountRolesWithAuth();
  
  
  return <PrivacyPermissionsClient initialRoles={rolesData} />;
}