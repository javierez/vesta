import type { Metadata } from "next";
import { PropertyListingForm } from "~/components/property/property-listing-form";

export const metadata: Metadata = {
  title: "Vender tu Propiedad | Acropolis Bienes Raíces",
  description:
    "Publica tu inmueble con Acropolis Bienes Raíces y llega a miles de compradores potenciales.",
};

export default function VenderPage() {
  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Publica Tu Inmueble
        </h1>
        <PropertyListingForm />
      </div>
    </>
  );
}
