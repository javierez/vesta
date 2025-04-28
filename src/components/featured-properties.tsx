import { properties } from "~/lib/data"
import { PropertyCard } from "~/components/property-card"
import { getFeaturedProps } from "~/server/queries/featured_properties"

export async function FeaturedProperties() {
  const config = await getFeaturedProps()
  const featuredProperties = properties
    .filter((property) => property.isFeatured)
    .slice(0, config?.maxItems || 6)

  return (
    <section className="py-16 container" id="featured">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{config?.title || "Pisos y Casas Destacadas"}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {config?.subtitle || "Descubre nuestra selección de pisos y casas"}
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
