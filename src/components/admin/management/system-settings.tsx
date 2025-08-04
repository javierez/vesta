"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Settings } from "lucide-react";
import type { FC } from "react";

export const SystemSettings: FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="mb-4 h-12 w-12 text-gray-400" />
          <CardTitle className="mb-2 text-lg text-gray-600">
            Configuración del Sistema
          </CardTitle>
          <CardDescription className="text-center">
            Esta funcionalidad estará disponible próximamente. <br />
            Permitirá configurar parámetros globales del sistema.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};
