"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { EconomicInfo } from "~/types/property-form";

interface EconomicStepProps {
  data: EconomicInfo;
  updateData: (data: Partial<EconomicInfo>) => void;
  errors: Record<string, string>;
}

export function EconomicStep({ data, updateData, errors }: EconomicStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Datos Económicos</h2>
        <p className="text-muted-foreground">
          Introduce los datos económicos de tu inmueble. Puedes indicar precio
          de venta, alquiler o ambos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="precioVenta">Precio de Venta (€)</Label>
          <div className="relative">
            <Input
              id="precioVenta"
              type="number"
              value={data.precioVenta}
              onChange={(e) => updateData({ precioVenta: e.target.value })}
              placeholder="Precio de venta"
              className={errors.precioVenta ? "border-red-500" : ""}
            />
            {errors.precioVenta && (
              <p className="text-sm text-red-500">{errors.precioVenta}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="precioAlquiler">Precio de Alquiler (€/mes)</Label>
          <div className="relative">
            <Input
              id="precioAlquiler"
              type="number"
              value={data.precioAlquiler}
              onChange={(e) => updateData({ precioAlquiler: e.target.value })}
              placeholder="Precio de alquiler mensual"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gastosComunitarios">
            Gastos Comunitarios (€/mes)
          </Label>
          <Input
            id="gastosComunitarios"
            type="number"
            value={data.gastosComunitarios}
            onChange={(e) => updateData({ gastosComunitarios: e.target.value })}
            placeholder="Gastos de comunidad"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ibi">IBI (€/año)</Label>
          <Input
            id="ibi"
            type="number"
            value={data.ibi}
            onChange={(e) => updateData({ ibi: e.target.value })}
            placeholder="Impuesto sobre Bienes Inmuebles"
          />
        </div>
      </div>
    </div>
  );
}
