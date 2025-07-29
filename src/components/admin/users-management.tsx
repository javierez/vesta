"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Users } from "lucide-react";

export function UsersManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
        <p className="text-sm text-gray-500">Administrar usuarios y sus roles</p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <CardTitle className="text-lg text-gray-600 mb-2">Gestión de Usuarios</CardTitle>
          <CardDescription className="text-center">
            Esta funcionalidad estará disponible próximamente. <br />
            Permitirá gestionar usuarios, asignar roles y permisos.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}