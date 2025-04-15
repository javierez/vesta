"use client"

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { ContactInfo } from "~/types/property-form"

interface ContactStepProps {
  data: ContactInfo
  updateData: (data: Partial<ContactInfo>) => void
  errors: Record<string, string>
}

export function ContactStep({ data, updateData, errors }: ContactStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Datos de Contacto</h2>
        <p className="text-muted-foreground">
          Introduce tus datos de contacto para que los interesados puedan comunicarse contigo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            value={data.nombre}
            onChange={(e) => updateData({ nombre: e.target.value })}
            placeholder="Tu nombre"
            className={errors.nombre ? "border-red-500" : ""}
          />
          {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input
            id="apellidos"
            value={data.apellidos}
            onChange={(e) => updateData({ apellidos: e.target.value })}
            placeholder="Tus apellidos"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="tu@email.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">
            Teléfono <span className="text-red-500">*</span>
          </Label>
          <Input
            id="telefono"
            value={data.telefono}
            onChange={(e) => updateData({ telefono: e.target.value })}
            placeholder="Tu número de teléfono"
            className={errors.telefono ? "border-red-500" : ""}
          />
          {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
        </div>
      </div>
    </div>
  )
}
