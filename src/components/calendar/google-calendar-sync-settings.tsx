"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Ban,
} from "lucide-react";

interface GoogleCalendarSyncSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDirection: "bidirectional" | "vesta_to_google" | "google_to_vesta" | "none";
  onDirectionChange: (direction: "bidirectional" | "vesta_to_google" | "google_to_vesta" | "none") => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

const syncDirectionOptions = [
  {
    value: "vesta_to_google" as const,
    label: "Vesta → Google Calendar",
    description: "Solo sincronizar eventos de Vesta hacia Google Calendar (Recomendado)",
    icon: <ArrowRight className="h-4 w-4" />,
    recommended: true,
  },
  {
    value: "bidirectional" as const,
    label: "Sincronización Bidireccional",
    description: "Los eventos se sincronizan en ambas direcciones entre Vesta y Google Calendar",
    icon: <ArrowLeftRight className="h-4 w-4" />,
  },
  {
    value: "google_to_vesta" as const,
    label: "Google Calendar → Vesta",
    description: "Solo sincronizar eventos de Google Calendar hacia Vesta",
    icon: <ArrowLeft className="h-4 w-4" />,
  },
  {
    value: "none" as const,
    label: "Sin Sincronización Automática",
    description: "Deshabilitar la sincronización automática (solo sincronización manual)",
    icon: <Ban className="h-4 w-4" />,
  },
];

export function GoogleCalendarSyncSettings({
  open,
  onOpenChange,
  currentDirection,
  onDirectionChange,
  loading = false,
}: GoogleCalendarSyncSettingsProps) {
  const [selectedDirection, setSelectedDirection] = useState(currentDirection);

  const handleSave = async () => {
    if (selectedDirection === currentDirection) {
      onOpenChange(false);
      return;
    }

    const result = await onDirectionChange(selectedDirection);
    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Configuración de Sincronización
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={selectedDirection}
            onValueChange={(value) => setSelectedDirection(value as typeof selectedDirection)}
          >
            <div className="space-y-4">
              {syncDirectionOptions.map((option) => (
                <Label
                  key={option.value}
                  className={`flex items-start space-x-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/50 ${
                    option.recommended ? "border-blue-200 bg-blue-50/50" : ""
                  }`}
                  htmlFor={option.value}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-muted-foreground">
                      {option.icon}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {option.label}
                        {option.recommended && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || selectedDirection === currentDirection}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}