"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Users } from "lucide-react";
import type { FC } from "react";

export const UsersManagement: FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="mb-4 h-12 w-12 text-gray-400" />
          <CardTitle className="mb-2 text-lg text-gray-600">
            Gestión de Usuarios
          </CardTitle>
          <CardDescription className="text-center">
            Esta funcionalidad estará disponible próximamente. <br />
            Permitirá gestionar usuarios, asignar roles y permisos.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};
