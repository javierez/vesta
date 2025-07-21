import type { Metadata } from "next"
import { PropertyListingForm } from "~/components/property/property-listing-form"

export const metadata: Metadata = {
  title: "Vender tu Propiedad | Acropolis Bienes Raíces",
  description: "Publica tu inmueble con Acropolis Bienes Raíces y llega a miles de compradores potenciales.",
}

export default function VenderPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Publica Tu Inmueble</h1>
        <PropertyListingForm />
      </div>
    </>
  )
}
