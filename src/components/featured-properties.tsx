import { properties } from "~/lib/data"
import { PropertyCard } from "~/components/property-card"

export function FeaturedProperties() {
  const featuredProperties = properties.filter((property) => property.isFeatured)

  return (
    <section className="py-16 container" id="featured">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Propiedades Destacadas</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre nuestra selección de propiedades premium en las ubicaciones más deseables
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}
