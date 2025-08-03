import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { userHasRole } from "~/server/queries/user-roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user has role ID 2 (Super Admin)
  const hasRequiredRole = await userHasRole(session.user.id, 2);

  if (!hasRequiredRole) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
