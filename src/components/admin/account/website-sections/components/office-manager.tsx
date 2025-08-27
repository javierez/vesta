"use client";

import { useState } from "react";
import { Building, Edit, Mail, MapPin, Phone, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { nanoid } from "nanoid";
import type { OfficeManagerProps } from "../../types/website-sections";

export function OfficeManager({ form }: OfficeManagerProps) {
  // PRESERVE complex nested object CRUD state management
  const [editingOffice, setEditingOffice] = useState<string | null>(null);
  const [showAddOffice, setShowAddOffice] = useState(false);

  // CRITICAL: Preserve exact office creation logic
  const addOffice = () => {
    const newOffice = {
      id: nanoid(),
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
      },
      phoneNumbers: {
        main: "",
        sales: "",
      },
      emailAddresses: {
        info: "",
        sales: "",
      },
      scheduleInfo: {
        weekdays: "",
        saturday: "",
        sunday: "",
      },
      mapUrl: "",
      isDefault: false,
    };

    const currentOffices = form.getValues("contactProps.offices") || [];
    form.setValue("contactProps.offices", [...currentOffices, newOffice]);
    setEditingOffice(newOffice.id);
    setShowAddOffice(false);
  };

  // CRITICAL: Preserve exact office removal logic
  const removeOffice = (officeId: string) => {
    const currentOffices = form.getValues("contactProps.offices") || [];
    form.setValue(
      "contactProps.offices",
      currentOffices.filter((office) => office.id !== officeId),
    );
    if (editingOffice === officeId) {
      setEditingOffice(null);
    }
  };

  // CRITICAL: Preserve exact field update logic with nested object handling
  const updateOfficeField = (
    officeId: string,
    fieldPath: string,
    value: string | boolean,
  ) => {
    const currentOffices = form.getValues("contactProps.offices") ?? [];
    const updatedOffices = currentOffices.map((office) => {
      if (office.id === officeId) {
        const updated = { ...office };
        const keys = fieldPath.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = updated;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (key && current[key] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            current = current[key];
          }
        }
        const lastKey = keys[keys.length - 1];
        if (lastKey && current) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          current[lastKey] = value;
        }

        return updated;
      }
      return office;
    });
    form.setValue("contactProps.offices", updatedOffices);
  };

  return (
    <div className="space-y-4">
      {/* Add Office Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Oficinas</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddOffice(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Añadir Oficina
        </Button>
      </div>

      {/* Create New Office Modal */}
      {showAddOffice && (
        <div className="rounded-lg border bg-yellow-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Crear nueva oficina</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddOffice(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Se creará una oficina nueva que podrás configurar después.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={addOffice}
              className="w-full"
            >
              Crear Oficina
            </Button>
          </div>
        </div>
      )}

      {/* Office Cards - PRESERVE all existing office management UI */}
      <div className="space-y-4">
        {form.watch("contactProps.offices")?.map((office, index) => (
          <div
            key={office.id}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {office.name || `Oficina ${index + 1}`}
                </span>
                {office.isDefault && (
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditingOffice(
                      editingOffice === office.id ? null : office.id,
                    )
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOffice(office.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editing Mode - PRESERVE complex nested object handling */}
            {editingOffice === office.id && (
              <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <Input
                      value={office.name}
                      onChange={(e) =>
                        updateOfficeField(office.id, "name", e.target.value)
                      }
                      placeholder="Oficina Central"
                      className="mt-1"
                    />
                  </div>
                  <div className="mt-6 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={office.isDefault}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "isDefault",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Oficina principal
                    </label>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <Input
                      value={office.address.street}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "address.street",
                          e.target.value,
                        )
                      }
                      placeholder="Calle Principal 123"
                    />
                    <Input
                      value={office.address.city}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "address.city",
                          e.target.value,
                        )
                      }
                      placeholder="Madrid"
                    />
                    <Input
                      value={office.address.state}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "address.state",
                          e.target.value,
                        )
                      }
                      placeholder="Comunidad de Madrid"
                    />
                    <Input
                      value={office.address.country}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "address.country",
                          e.target.value,
                        )
                      }
                      placeholder="España"
                    />
                  </div>
                </div>

                {/* Phone Numbers */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Teléfonos
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        value={office.phoneNumbers.main}
                        onChange={(e) =>
                          updateOfficeField(
                            office.id,
                            "phoneNumbers.main",
                            e.target.value,
                          )
                        }
                        placeholder="Teléfono principal"
                      />
                    </div>
                    <div>
                      <Input
                        value={office.phoneNumbers.sales ?? ""}
                        onChange={(e) =>
                          updateOfficeField(
                            office.id,
                            "phoneNumbers.sales",
                            e.target.value,
                          )
                        }
                        placeholder="Teléfono ventas (opcional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Addresses */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Emails
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <Input
                      value={office.emailAddresses.info}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "emailAddresses.info",
                          e.target.value,
                        )
                      }
                      placeholder="info@empresa.com"
                    />
                    <Input
                      value={office.emailAddresses.sales ?? ""}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "emailAddresses.sales",
                          e.target.value,
                        )
                      }
                      placeholder="ventas@empresa.com (opcional)"
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Horarios
                  </label>
                  <div className="mt-1 space-y-2">
                    <Input
                      value={office.scheduleInfo.weekdays}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "scheduleInfo.weekdays",
                          e.target.value,
                        )
                      }
                      placeholder="Lunes a Viernes: 9:00 - 18:00"
                    />
                    <Input
                      value={office.scheduleInfo.saturday}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "scheduleInfo.saturday",
                          e.target.value,
                        )
                      }
                      placeholder="Sábados: 9:00 - 14:00"
                    />
                    <Input
                      value={office.scheduleInfo.sunday}
                      onChange={(e) =>
                        updateOfficeField(
                          office.id,
                          "scheduleInfo.sunday",
                          e.target.value,
                        )
                      }
                      placeholder="Domingos: Cerrado"
                    />
                  </div>
                </div>

                {/* Map URL */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    URL del Mapa
                  </label>
                  <Input
                    value={office.mapUrl}
                    onChange={(e) =>
                      updateOfficeField(office.id, "mapUrl", e.target.value)
                    }
                    placeholder="https://maps.google.com/..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Display Mode - PRESERVE existing display patterns */}
            {editingOffice !== office.id && (
              <div className="space-y-2 text-sm text-gray-600">
                {office.address.street && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {office.address.street}, {office.address.city}
                    </span>
                  </div>
                )}
                {office.phoneNumbers.main && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{office.phoneNumbers.main}</span>
                  </div>
                )}
                {office.emailAddresses.info && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{office.emailAddresses.info}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {form.watch("contactProps.offices")?.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <Building className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p>No hay oficinas configuradas</p>
          <p className="text-sm">Agrega tu primera oficina para comenzar</p>
        </div>
      )}
    </div>
  );
}
