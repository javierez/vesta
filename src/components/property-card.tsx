import Image from "next/image"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Bed, Bath, SquareIcon as SquareFoot, MapPin } from "lucide-react"
import type { Property } from "~/lib/data"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-[4/3] relative overflow-hidden">
        <Link href={`/propiedades/${property.id}`}>
          <Image
            src={property.imageUrl || "/placeholder.svg"}
            alt={property.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </Link>
        <Badge className="absolute top-2 right-2 z-10">
          {property.status === "for-sale" ? "En Venta" : property.status === "for-rent" ? "En Alquiler" : "Vendido"}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/propiedades/${property.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          </Link>
          <p className="font-bold text-lg">${property.price.toLocaleString()}</p>
        </div>

        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <p className="text-sm line-clamp-1">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{property.description}</p>

        <div className="flex justify-between">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {property.bedrooms} {property.bedrooms === 1 ? "Hab" : "Habs"}
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {property.bathrooms} {property.bathrooms === 1 ? "Baño" : "Baños"}
            </span>
          </div>
          <div className="flex items-center">
            <SquareFoot className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.squareFeet.toLocaleString()} m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link
          href={`/propiedades/${property.id}`}
          className="text-sm font-medium text-primary hover:underline w-full text-center"
        >
          Ver Detalles
        </Link>
      </CardFooter>
    </Card>
  )
}
