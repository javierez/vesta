import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Settings2,
  Plus,
  Minus,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "~/components/hooks/use-toast";
import type {
  TemplateCustomizerProps,
  TemplateField,
} from "~/types/carteleria";

export const TemplateCustomizer: FC<TemplateCustomizerProps> = ({
  template,
  customizations,
  onCustomizationChange,
  isOpen,
  onClose,
  onSave,
}) => {
  const [workingFields, setWorkingFields] = useState<TemplateField[]>([]);
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Initialize working state when template changes
  useEffect(() => {
    if (template) {
      setWorkingFields([...template.fields]);

      // Initialize enabled fields from customizations or use all by default
      const templateCustomizations = customizations[template.id] ?? {};
      const enabledFieldIds =
        (templateCustomizations.enabledFields as string[]) ??
        template.fields.map((f) => f.id);

      setEnabledFields(new Set(enabledFieldIds));
      setHasChanges(false);
    }
  }, [template, customizations]);

  const handleFieldToggle = (fieldId: string, enabled: boolean) => {
    const newEnabledFields = new Set(enabledFields);

    if (enabled) {
      newEnabledFields.add(fieldId);
    } else {
      // Don't allow disabling required fields
      const field = workingFields.find((f) => f.id === fieldId);
      if (field?.required) {
        toast({
          title: "Campo requerido",
          description: "Este campo es obligatorio y no se puede desactivar",
          variant: "destructive",
        });
        return;
      }
      newEnabledFields.delete(fieldId);
    }

    setEnabledFields(newEnabledFields);
    setHasChanges(true);

    onCustomizationChange(
      template.id,
      "enabledFields",
      Array.from(newEnabledFields),
    );
  };

  const handleFieldReorder = (fromIndex: number, toIndex: number) => {
    const newFields = [...workingFields];
    const [movedField] = newFields.splice(fromIndex, 1);
    if (movedField) {
      newFields.splice(toIndex, 0, movedField);

      setWorkingFields(newFields);
      setHasChanges(true);

      onCustomizationChange(
        template.id,
        "fieldOrder",
        newFields.map((f) => f.id),
      );
    }
  };

  const handleFieldUpdate = (
    fieldId: string,
    updates: Partial<TemplateField>,
  ) => {
    const newFields = workingFields.map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field,
    );

    setWorkingFields(newFields);
    setHasChanges(true);

    onCustomizationChange(template.id, "fieldUpdates", {
      ...(customizations[template.id]?.fieldUpdates as Record<
        string,
        Partial<TemplateField>
      >),
      [fieldId]: updates,
    });
  };

  const resetToDefaults = () => {
    if (template) {
      setWorkingFields([...template.fields]);
      setEnabledFields(new Set(template.fields.map((f) => f.id)));
      setHasChanges(false);

      // Clear customizations for this template
      onCustomizationChange(
        template.id,
        "enabledFields",
        template.fields.map((f) => f.id),
      );
      onCustomizationChange(
        template.id,
        "fieldOrder",
        template.fields.map((f) => f.id),
      );
      onCustomizationChange(template.id, "fieldUpdates", {});
    }
  };

  const handleSave = () => {
    onSave();
    setHasChanges(false);
    toast({
      title: "Personalización guardada",
      description: "Los cambios se han aplicado correctamente",
    });
  };

  if (!template) return null;

  const enabledFieldsList = workingFields.filter((field) =>
    enabledFields.has(field.id),
  );
  const disabledFieldsList = workingFields.filter(
    (field) => !enabledFields.has(field.id),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <DialogTitle>Personalizar Plantilla</DialogTitle>
          </div>
          <DialogDescription>
            Personaliza los campos que aparecerán en{" "}
            <strong>{template.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 gap-6 p-1 lg:grid-cols-2">
            {/* Fields Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Configuración de Campos</h3>
                <Badge variant="outline">
                  {enabledFieldsList.length} de {workingFields.length} activos
                </Badge>
              </div>

              {/* Enabled Fields */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-green-700">
                  Campos Activos ({enabledFieldsList.length})
                </Label>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {enabledFieldsList.map((field, index) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      isEnabled={true}
                      onToggle={(enabled) =>
                        handleFieldToggle(field.id, enabled)
                      }
                      onUpdate={(updates) =>
                        handleFieldUpdate(field.id, updates)
                      }
                      onMoveUp={
                        index > 0
                          ? () =>
                              handleFieldReorder(
                                workingFields.findIndex(
                                  (f) => f.id === field.id,
                                ),
                                workingFields.findIndex(
                                  (f) => f.id === field.id,
                                ) - 1,
                              )
                          : undefined
                      }
                      onMoveDown={
                        index < enabledFieldsList.length - 1
                          ? () =>
                              handleFieldReorder(
                                workingFields.findIndex(
                                  (f) => f.id === field.id,
                                ),
                                workingFields.findIndex(
                                  (f) => f.id === field.id,
                                ) + 1,
                              )
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Disabled Fields */}
              {disabledFieldsList.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-500">
                    Campos Inactivos ({disabledFieldsList.length})
                  </Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {disabledFieldsList.map((field) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        isEnabled={false}
                        onToggle={(enabled) =>
                          handleFieldToggle(field.id, enabled)
                        }
                        onUpdate={(updates) =>
                          handleFieldUpdate(field.id, updates)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h3 className="text-lg font-medium">Vista Previa</h3>
              </div>

              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Campos que aparecerán
                    </p>
                  </div>

                  {enabledFieldsList.length > 0 ? (
                    <div className="space-y-2">
                      {enabledFieldsList.map((field, _index) => (
                        <div
                          key={field.id}
                          className="rounded border bg-white p-3 shadow-sm"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {field.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                              {field.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Requerido
                                </Badge>
                              )}
                            </div>
                          </div>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500">
                              {field.placeholder}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">No hay campos activos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="font-medium text-blue-900">
                    Campos Activos
                  </div>
                  <div className="text-blue-600">
                    {enabledFieldsList.length}
                  </div>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <div className="font-medium text-orange-900">
                    Campos Requeridos
                  </div>
                  <div className="text-orange-600">
                    {enabledFieldsList.filter((f) => f.required).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex w-full items-center gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar
            </Button>

            <div className="flex-1" />

            {hasChanges && (
              <Badge
                variant="outline"
                className="border-orange-200 text-orange-600"
              >
                Cambios pendientes
              </Badge>
            )}

            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface FieldCardProps {
  field: TemplateField;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const FieldCard: FC<FieldCardProps> = ({
  field,
  isEnabled,
  onToggle,
  onUpdate,
  onMoveUp,
  onMoveDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedField, setEditedField] = useState(field);

  const handleSaveEdit = () => {
    onUpdate({
      name: editedField.name,
      placeholder: editedField.placeholder,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        isEnabled
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={field.required}
          className="mt-1"
        />

        <div className="flex-1 space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedField.name}
                onChange={(e) =>
                  setEditedField((prev) => ({ ...prev, name: e.target.value }))
                }
                className="text-sm"
              />
              <Input
                value={editedField.placeholder ?? ""}
                onChange={(e) =>
                  setEditedField((prev) => ({
                    ...prev,
                    placeholder: e.target.value,
                  }))
                }
                placeholder="Placeholder (opcional)"
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{field.name}</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                  {field.required && (
                    <Badge variant="destructive" className="text-xs">
                      *
                    </Badge>
                  )}
                </div>
              </div>

              {field.placeholder && (
                <p className="text-xs text-gray-500">
                  &ldquo;{field.placeholder}&rdquo;
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="text-xs"
                >
                  Editar
                </Button>

                {isEnabled && (onMoveUp ?? onMoveDown) && (
                  <div className="flex gap-1">
                    {onMoveUp && (
                      <Button size="sm" variant="outline" onClick={onMoveUp}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                    {onMoveDown && (
                      <Button size="sm" variant="outline" onClick={onMoveDown}>
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
