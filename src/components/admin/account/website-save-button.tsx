
import React from "react";
import { Check, AlertCircle, Save, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

type SaveState = "idle" | "modified" | "saving" | "saved" | "error";

interface WebsiteSaveButtonProps {
  onSave: () => Promise<void> | void;
  isPending: boolean;
  hasUnsavedChanges: boolean;
  error?: string | null;
  className?: string;
}

export function WebsiteSaveButton({
  onSave,
  isPending,
  hasUnsavedChanges,
  error,
  className,
}: WebsiteSaveButtonProps) {
  // Determine the save state based on props
  const getSaveState = (): SaveState => {
    if (error) return "error";
    if (isPending) return "saving";
    if (!hasUnsavedChanges) return "saved";
    if (hasUnsavedChanges) return "modified";
    return "idle";
  };

  const state = getSaveState();

  const handleClick = async () => {
    if (state === "modified" || state === "error") {
      await onSave();
    }
  };

  // Don't render if no changes and no error
  if (state === "idle" || (!hasUnsavedChanges && !error && !isPending)) return null;

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || state === "saved"}
      size="sm"
      className={cn(
        "transition-all duration-200",
        state === "modified" && "bg-gray-800 hover:bg-gray-900 text-white",
        state === "saving" && "bg-gray-600 text-white",
        state === "saved" && "bg-green-600 hover:bg-green-700 text-white",
        state === "error" && "bg-red-600 hover:bg-red-700 text-white",
        className
      )}
    >
      {state === "saving" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {state === "saved" && <Check className="w-4 h-4 mr-2" />}
      {state === "error" && <AlertCircle className="w-4 h-4 mr-2" />}
      {state === "modified" && <Save className="w-4 h-4 mr-2" />}
      
      {state === "saving" ? "Guardando..." : 
       state === "saved" ? "Guardado" :
       state === "error" ? "Reintentar" :
       "Guardar Cambios"}
    </Button>
  );
}