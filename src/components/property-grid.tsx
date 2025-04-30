import { getPropertiesProps } from "~/server/queries/properties"
import { PropertyHeader } from "./propertygrid/PropertyHeader"
import { PropertyGridContent } from "./propertygrid/PropertyGridContent"
import { PropertyButton } from "./propertygrid/PropertyButton"
import { properties } from "~/lib/data"

export async function PropertyGrid() {
  // Fetch data on the server
  const propertiesProps = await getPropertiesProps()
  console.log(propertiesProps)
  
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
