"use client";

import { Card } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { ModernSaveIndicator } from "~/components/propiedades/form/common/modern-save-indicator";

type SaveState = "idle" | "modified" | "saving" | "saved" | "error";
type ModuleName = "basicInfo" | "contactDetails" | "notes" | "interestForms";

interface ContactNotesCardProps {
  notes: string;
  setNotes: (value: string) => void;
  saveState: SaveState;
  onSave: () => Promise<void>;
  onUpdateModule: (hasChanges: boolean) => void;
  getCardStyles: (moduleName: ModuleName) => string;
}

export function ContactNotesCard({
  notes,
  setNotes,
  saveState,
  onSave,
  onUpdateModule,
  getCardStyles,
}: ContactNotesCardProps) {
  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-500 ease-out",
        getCardStyles("notes"),
      )}
    >
      <ModernSaveIndicator state={saveState} onSave={onSave} />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide">NOTAS</h3>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onUpdateModule(true);
            }}
            className="min-h-[120px] resize-y border-gray-200 transition-colors focus:border-gray-400 focus:ring-gray-300"
            placeholder="Información adicional sobre el contacto..."
          />
        </div>
      </div>
    </Card>
  );
}

