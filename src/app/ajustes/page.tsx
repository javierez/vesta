"use client";

import { SettingsTabs } from "~/components/ajustes/settings-tabs";

export default function SettingsPage() {
  // TODO: Get actual user ID from session/auth
  // For now using hardcoded userId = 1
  const userId = BigInt(1);

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

      <SettingsTabs userId={userId} />
    </div>
  );
}
