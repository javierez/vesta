import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import type { PropertyFormData } from "~/types/property-form"

interface ReviewStepProps {
  data: PropertyFormData
  updateTerms: (acceptTerms: boolean) => void
  errors: Record<string, string>
}

export function ReviewStep({ data, updateTerms, errors }: ReviewStepProps) {
  const propertyTypeLabels: Record<string, string> = {
    piso: "Piso",
    casa: "Casa",
    local: "Local",
    solar: "Solar",
    garaje: "Garaje",
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Revisión</h2>
        <p className="text-muted-foreground">
          Revisa los datos de tu inmueble antes de publicarlo. Puedes volver atrás para editar cualquier información.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Datos de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Nombre:</span> {data.contactInfo.nombre} {data.contactInfo.apellidos}
            </div>
            <div>
              <span className="font-medium">Email:</span> {data.contactInfo.email}
            </div>
            <div>
              <span className="font-medium">Teléfono:</span> {data.contactInfo.telefono}
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Dirección:</span> {data.locationInfo.direccion}{" "}
              {data.locationInfo.numero && `Nº ${data.locationInfo.numero}`}{" "}
              {data.locationInfo.planta && `Planta ${data.locationInfo.planta}`}{" "}
              {data.locationInfo.puerta && `Puerta ${data.locationInfo.puerta}`}
            </div>
            <div>
              <span className="font-medium">Código Postal:</span> {data.locationInfo.codigoPostal}
            </div>
            <div>
              <span className="font-medium">Localidad:</span> {data.locationInfo.localidad}
            </div>
            <div>
              <span className="font-medium">Provincia:</span> {data.locationInfo.provincia}
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Datos de la Propiedad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Tipo:</span> {propertyTypeLabels[data.propertyInfo.tipo]}
            </div>
            <div>
              <span className="font-medium">Superficie:</span> {data.propertyInfo.superficie} m²
            </div>
            {data.propertyInfo.habitaciones && (
              <div>
                <span className="font-medium">Habitaciones:</span> {data.propertyInfo.habitaciones}
              </div>
            )}
            {data.propertyInfo.banos && (
              <div>
                <span className="font-medium">Baños:</span> {data.propertyInfo.banos}
              </div>
            )}
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">Descripción:</span>
            <p className="mt-1 text-muted-foreground">{data.propertyInfo.descripcion}</p>
          </div>
          {data.propertyInfo.caracteristicas.length > 0 && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Características:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {data.propertyInfo.caracteristicas.map((feature) => (
                  <span key={feature} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Datos Económicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {data.economicInfo.precioVenta && (
              <div>
                <span className="font-medium">Precio de Venta:</span> {data.economicInfo.precioVenta} €
              </div>
            )}
            {data.economicInfo.precioAlquiler && (
              <div>
                <span className="font-medium">Precio de Alquiler:</span> {data.economicInfo.precioAlquiler} €/mes
              </div>
            )}
            {data.economicInfo.gastosComunitarios && (
              <div>
                <span className="font-medium">Gastos Comunitarios:</span> {data.economicInfo.gastosComunitarios} €/mes
              </div>
            )}
            {data.economicInfo.ibi && (
              <div>
                <span className="font-medium">IBI:</span> {data.economicInfo.ibi} €/año
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Imágenes</h3>
          {data.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {data.images.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-md bg-background overflow-hidden">
                  <Image
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No has subido ninguna imagen.</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={data.acceptTerms}
            onCheckedChange={(checked) => updateTerms(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className={`text-sm font-medium leading-none ${errors.acceptTerms ? "text-red-500" : ""}`}
            >
              Acepto los términos y condiciones
            </Label>
            <p className="text-sm text-muted-foreground">
              Al publicar este inmueble, acepto los{" "}
              <Link href="#" className="text-primary hover:underline">
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link href="#" className="text-primary hover:underline">
                política de privacidad
              </Link>
              .
            </p>
            {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
