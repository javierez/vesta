"use client"

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import type { PropertyInfo, PropertyType } from "~/types/property-form"

interface PropertyStepProps {
  data: PropertyInfo
  updateData: (data: Partial<PropertyInfo>) => void
  errors: Record<string, string>
}

export function PropertyStep({ data, updateData, errors }: PropertyStepProps) {
  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "piso", label: "Piso" },
    { value: "casa", label: "Casa" },
    { value: "local", label: "Local" },
    { value: "solar", label: "Solar" },
    { value: "garaje", label: "Garaje" },
  ]

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      updateData({ caracteristicas: [...data.caracteristicas, feature] })
    } else {
      updateData({ caracteristicas: data.caracteristicas.filter((f) => f !== feature) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Datos de la Propiedad</h2>
        <p className="text-muted-foreground">Introduce las características de tu inmueble.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Propiedad</Label>
            <Select value={data.tipo} onValueChange={(value: PropertyType) => updateData({ tipo: value })}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="superficie">
              Superficie (m²) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="superficie"
              type="number"
              value={data.superficie}
              onChange={(e) => updateData({ superficie: e.target.value })}
              placeholder="Superficie en m²"
              className={errors.superficie ? "border-red-500" : ""}
            />
            {errors.superficie && <p className="text-red-500 text-sm">{errors.superficie}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="habitaciones">Habitaciones</Label>
            <Input
              id="habitaciones"
              type="number"
              value={data.habitaciones}
              onChange={(e) => updateData({ habitaciones: e.target.value })}
              placeholder="Número de habitaciones"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banos">Baños</Label>
            <Input
              id="banos"
              type="number"
              value={data.banos}
              onChange={(e) => updateData({ banos: e.target.value })}
              placeholder="Número de baños"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="descripcion"
            value={data.descripcion}
            onChange={(e) => updateData({ descripcion: e.target.value })}
            placeholder="Describe tu inmueble..."
            rows={5}
            className={errors.descripcion ? "border-red-500" : ""}
          />
          {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion}</p>}
        </div>
      </div>
    </div>
  )
}
