import { properties } from "~/lib/data"
import { PropertyCard } from "~/components/property-card"
import { Button } from "~/components/ui/button"

export function PropertyGrid() {
  // Show only a subset of properties initially
  const displayedProperties = properties.slice(0, 6)

  return (
    <section className="py-16 bg-muted" id="properties">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Explora Nuestras Propiedades</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestro diverso portafolio de propiedades para encontrar tu opción perfecta
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg">Ver Todas las Propiedades</Button>
        </div>
      </div>
    </section>
  )
}
