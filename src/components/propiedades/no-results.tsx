"use client";

import { SearchX } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

interface NoResultsProps {
  message?: string;
  showResetButton?: boolean;
}

export function NoResults({
  message = "No se encontraron propiedades con los filtros seleccionados",
  showResetButton = true,
}: NoResultsProps) {
  const router = useRouter();

  const handleReset = () => {
    router.push("/propiedades");
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-muted/50 p-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Sin resultados</h3>
      <p className="mb-6 max-w-md text-muted-foreground">{message}</p>
      {showResetButton && (
        <Button variant="outline" onClick={handleReset} className="gap-2">
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
