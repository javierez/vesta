"use client";

import { Card, CardContent } from "~/components/ui/card";
import { BarChart3 } from "lucide-react";

export const AccountReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500">
          Visualiza estadísticas y reportes de tu cuenta
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-center text-gray-500">
            Los reportes estarán disponibles próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
