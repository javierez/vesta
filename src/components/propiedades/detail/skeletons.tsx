import { Label } from "~/components/ui/label";

export function ImageGallerySkeleton() {
  return (
    <div className="space-y-4">
      {/* Help text skeleton */}
      <div className="text-center">
        <div className="mx-auto h-4 w-80 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Image grid skeleton - matches the 2-3-4 column responsive grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-lg border bg-muted"
          >
            <div className="h-40 w-full animate-pulse bg-gray-200"></div>
            {/* Overlay buttons skeleton */}
            <div className="absolute left-2 top-2 h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
            <div className="absolute right-2 top-2 h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
            <div className="absolute bottom-2 left-2 h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
          </div>
        ))}
        {/* Upload button skeleton */}
        <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white">
          <div className="mb-1 h-5 w-5 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Control buttons skeleton */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function CharacteristicsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
      {/* Basic Information - RESUMEN DEL INMUEBLE */}
      <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">
              RESUMEN DEL INMUEBLE
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          {/* Property Title */}
          <div className="space-y-1.5">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
          </div>

          {/* Tipo de Anuncio */}
          <div className="space-y-1.5">
            <Label className="text-sm">Tipo de Anuncio</Label>
            <div className="flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 flex-1 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Tipo de Propiedad */}
          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-sm">
              Tipo de Propiedad
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>

          {/* Subtipo de Propiedad */}
          <div className="space-y-1.5">
            <Label htmlFor="propertySubtype" className="text-sm">
              Subtipo de Propiedad
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>

          {/* Precio */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm">
              Precio
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>

          {/* Referencia Catastral */}
          <div className="space-y-1.5">
            <Label htmlFor="cadastralReference" className="text-sm">
              Referencia Catastral
            </Label>
            <div className="flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>

          <div className="my-2 border-t border-border" />

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-7 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="my-2 border-t border-border" />
        </div>
      </div>

      {/* Property Details - DISTRIBUCIÓN Y SUPERFICIE */}
      <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">
              DISTRIBUCIÓN Y SUPERFICIE
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bedrooms" className="text-sm">
              Habitaciones
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bathrooms" className="text-sm">
              Baños
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="squareMeter" className="text-sm">
                Superficie (m²)
              </Label>
              <div className="h-8 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="builtSurfaceArea" className="text-sm">
                Construida (m²)
              </Label>
              <div className="h-8 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearBuilt" className="text-sm">
              Año de Construcción
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastRenovationYear" className="text-sm">
              Año última reforma
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buildingFloors" className="text-sm">
              Plantas edificio
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conservationStatus" className="text-sm">
              Estado de conservación
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Location - DIRECCIÓN DEL INMUEBLE */}
      <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide">
            DIRECCIÓN DEL INMUEBLE
          </h3>
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-sm">
              Calle
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressDetails" className="text-sm">
              Detalles de la dirección
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="text-sm">
                Código Postal
              </Label>
              <div className="h-8 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-sm">
                Barrio
              </Label>
              <div className="h-8 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm">
                Ciudad
              </Label>
              <div className="h-8 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="municipality" className="text-sm">
                Municipio
              </Label>
              <div className="h-8 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province" className="text-sm">
              Provincia
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Features - EQUIPAMIENTO Y SERVICIOS */}
      <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">
              EQUIPAMIENTO Y SERVICIOS
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          {/* Checkboxes */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label htmlFor="hasElevator" className="text-sm">
              Ascensor
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label htmlFor="hasGarage" className="text-sm">
              Garaje
            </Label>
          </div>
          {/* Garage sub-options skeleton */}
          <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <div className="h-7 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Plazas</Label>
                <div className="h-7 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label htmlFor="hasStorageRoom" className="text-sm">
              Trastero
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label htmlFor="hasHeating" className="text-sm">
              Calefacción
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label htmlFor="hasHotWater" className="text-sm">
              Agua caliente
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label htmlFor="hasAirConditioning" className="text-sm">
              Aire acondicionado
            </Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
              <Label htmlFor="isFurnished" className="text-sm">
                Amueblado
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - DATOS DE CONTACTO */}
      <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">
              DATOS DE CONTACTO
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="owners" className="text-sm">
              Propietarios
            </Label>
            <div className="flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agent" className="text-sm">
              Agente
            </Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Orientation - ORIENTACIÓN Y EXPOSICIÓN */}
      <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">
              ORIENTACIÓN Y EXPOSICIÓN
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label className="text-sm">Exterior</Label>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Orientación</Label>
            <div className="h-8 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <Label className="text-sm">Luminoso</Label>
          </div>
        </div>
      </div>

      {/* Collapsible sections */}
      <div className="col-span-full space-y-4">
        {/* Additional Characteristics */}
        <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
          <button className="group flex w-full items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                Características adicionales
              </h3>
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
          </button>
        </div>

        {/* Premium Features */}
        <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
          <button className="group flex w-full items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                Extras de Lujo y Confort
              </h3>
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
          </button>
        </div>
      </div>

      <div className="col-span-full space-y-4">
        {/* Additional Spaces */}
        <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
          <button className="group flex w-full items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                Zonas y Espacios Complementarios
              </h3>
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
          </button>
        </div>

        {/* Materials and Finishes */}
        <div className="relative rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
          <button className="group flex w-full items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                Materiales y acabados
              </h3>
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
          </button>
        </div>
      </div>

      {/* Description - DESCRIPCIÓN */}
      <div className="relative col-span-full rounded-lg border bg-white p-4 transition-all duration-500 ease-out hover:shadow-lg">
        {/* Save indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DESCRIPCIÓN</h3>
          </div>
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="space-y-2">
          <div className="h-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export function PortalsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Portal cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white">
            <div className="p-6">
              {/* Portal header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                  <div className="space-y-1">
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-10 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-end space-x-2">
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200"></div>
        <div className="h-9 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function EnergyCertificateSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main card container */}
      <div className="rounded-lg border bg-white p-6">
        {/* Energy rating status selector */}
        <div className="mb-6 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy rating scales */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Consumption scale */}
          <div className="space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="flex space-x-1">
              {["A", "B", "C", "D", "E", "F", "G"].map((letter) => (
                <div key={letter} className="flex-1 space-y-1">
                  <div className="h-8 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
            <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          </div>

          {/* Emissions scale */}
          <div className="space-y-3">
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200"></div>
            <div className="flex space-x-1">
              {["A", "B", "C", "D", "E", "F", "G"].map((letter) => (
                <div key={letter} className="flex-1 space-y-1">
                  <div className="h-8 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
            <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        {/* File upload area */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mt-4 h-5 w-48 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mt-4 h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Save indicator skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Folders grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded bg-gray-200"></div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="mt-3 flex items-center space-x-1">
                  <div className="h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocumentsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Upload button skeleton */}
      <div className="mb-6 flex justify-end">
        <div className="h-9 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Document list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
