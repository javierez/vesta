"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { LocationInfo } from "~/types/property-form";

interface LocationStepProps {
  data: LocationInfo;
  updateData: (data: Partial<LocationInfo>) => void;
  errors: Record<string, string>;
}

export function LocationStep({ data, updateData, errors }: LocationStepProps) {
  const provincias = [
    "León",
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Zaragoza",
    "Málaga",
    "Murcia",
    "Palma",
    "Las Palmas",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Datos de Localización</h2>
        <p className="text-muted-foreground">
          Introduce la dirección completa de tu inmueble.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="direccion">
            Dirección <span className="text-red-500">*</span>
          </Label>
          <Input
            id="direccion"
            value={data.direccion}
            onChange={(e) => updateData({ direccion: e.target.value })}
            placeholder="Calle, avenida, etc."
            className={errors.direccion ? "border-red-500" : ""}
          />
          {errors.direccion && (
            <p className="text-sm text-red-500">{errors.direccion}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={data.numero}
              onChange={(e) => updateData({ numero: e.target.value })}
              placeholder="Nº"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planta">Planta</Label>
            <Input
              id="planta"
              value={data.planta}
              onChange={(e) => updateData({ planta: e.target.value })}
              placeholder="Planta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="puerta">Puerta</Label>
            <Input
              id="puerta"
              value={data.puerta}
              onChange={(e) => updateData({ puerta: e.target.value })}
              placeholder="Puerta"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="codigoPostal">
              Código Postal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigoPostal"
              value={data.codigoPostal}
              onChange={(e) => updateData({ codigoPostal: e.target.value })}
              placeholder="Código postal"
              className={errors.codigoPostal ? "border-red-500" : ""}
            />
            {errors.codigoPostal && (
              <p className="text-sm text-red-500">{errors.codigoPostal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="localidad">
              Localidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="localidad"
              value={data.localidad}
              onChange={(e) => updateData({ localidad: e.target.value })}
              placeholder="Localidad"
              className={errors.localidad ? "border-red-500" : ""}
            />
            {errors.localidad && (
              <p className="text-sm text-red-500">{errors.localidad}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia</Label>
          <Select
            value={data.provincia}
            onValueChange={(value) => updateData({ provincia: value })}
          >
            <SelectTrigger id="provincia">
              <SelectValue placeholder="Selecciona una provincia" />
            </SelectTrigger>
            <SelectContent>
              {provincias.map((provincia) => (
                <SelectItem key={provincia} value={provincia}>
                  {provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
