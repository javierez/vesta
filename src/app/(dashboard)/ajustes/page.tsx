"use client";

import { SettingsTabs } from "~/components/ajustes/settings-tabs";
import { useSession } from "~/lib/auth-client";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ajustes</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ajustes</h1>
            <p className="text-muted-foreground">
              Debes iniciar sesión para acceder a los ajustes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ajustes</h1>
          <p className="text-muted-foreground">
            Configura tu inmobiliaria, preferencias y métodos de pago
          </p>
        </div>
      </div>

      <SettingsTabs userId={session.user.id} />
    </div>
  );
}
