"use client"

import { getPropertiesProps } from "~/server/queries/properties"
import { PropertyHeader } from "./property/PropertyHeader"
import { PropertyGridContent } from "./property/PropertyGridContent"
import { PropertyButton } from "./property/PropertyButton"
import { properties } from "~/lib/data"

export async function PropertyGrid() {
  const propertiesProps = await getPropertiesProps()
  
  // Fallbacks in case data is missing
  const title = propertiesProps?.title || "Explora Nuestras Propiedades"
  const subtitle = propertiesProps?.subtitle || "Explora nuestro diverso portafolio de propiedades para encontrar tu opción perfecta"
  const buttonText = propertiesProps?.buttonText || "Ver Todas las Propiedades"
  
  // Show only a subset of properties initially
  const displayedProperties = properties.slice(0, propertiesProps?.itemsPerPage || 6)

  return (
    <section className="py-16" id="properties">
      <div className="container">
        <PropertyHeader title={title} subtitle={subtitle} />
        <PropertyGridContent properties={displayedProperties} />
        <PropertyButton text={buttonText} />
      </div>
    </section>
  )
}
