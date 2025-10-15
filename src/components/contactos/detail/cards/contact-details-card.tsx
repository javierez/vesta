

import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { ModernSaveIndicator } from "~/components/propiedades/form/common/modern-save-indicator";

type SaveState = "idle" | "modified" | "saving" | "saved" | "error";
type ModuleName = "basicInfo" | "contactDetails" | "notes" | "interestForms";

interface ContactDetailsCardProps {
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  saveState: SaveState;
  onSave: () => Promise<void>;
  onUpdateModule: (hasChanges: boolean) => void;
  getCardStyles: (moduleName: ModuleName) => string;
}

export function ContactDetailsCard({
  email,
  setEmail,
  phone,
  setPhone,
  saveState,
  onSave,
  onUpdateModule,
  getCardStyles,
}: ContactDetailsCardProps) {
  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-500 ease-out",
        getCardStyles("contactDetails"),
      )}
    >
      <ModernSaveIndicator state={saveState} onSave={onSave} />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide">
          DATOS DE CONTACTO
        </h3>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onUpdateModule(true);
            }}
            className="h-8 text-gray-500"
            placeholder="contacto@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm">
            Teléfono
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              onUpdateModule(true);
            }}
            className="h-8 text-gray-500"
            placeholder="+34 600 000 000"
          />
        </div>
      </div>
    </Card>
  );
}

