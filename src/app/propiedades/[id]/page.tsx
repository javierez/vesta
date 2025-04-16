import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { properties } from "~/lib/data"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Bed, Bath, SquareIcon, MapPin, Share2, Check, X } from "lucide-react"
import { PropertyCard } from "~/components/property-card"
import { ContactSection } from "~/components/contact-section"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { ImageGallery } from "~/components/property/image-gallery"
import { Card } from "~/components/ui/card"
import { use } from "react"

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const unwrappedParams = use(params) as { id: string }
  const property = properties.find((p) => p.id === unwrappedParams.id)

  if (!property) {
    return {
      title: "Propiedad no encontrada | Acropolis Bienes Raíces",
      description: "La propiedad que estás buscando no existe o ha sido eliminada.",
    }
  }

  return {
    title: `${property.title} | Acropolis Bienes Raíces`,
    description: property.description,
    openGraph: {
      title: `${property.title} | Acropolis Bienes Raíces`,
      description: property.description,
      images: [
        {
          url: property.imageUrl || "/suburban-dream.png",
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
  }
}

// Datos de redes sociales para toda la aplicación
const socialLinks = [
  { platform: "facebook" as "facebook", url: "https://facebook.com/acropolisrealestate" },
  { platform: "instagram" as "instagram", url: "https://instagram.com/acropolisrealestate" },
  { platform: "twitter" as "twitter", url: "https://twitter.com/acropolisrealty" },
  { platform: "linkedin" as "linkedin", url: "https://linkedin.com/company/acropolis-real-estate" },
  { platform: "youtube" as "youtube", url: "https://youtube.com/acropolisrealestate" }
]

export default function PropertyPage({ params }: PropertyPageProps) {
  const unwrappedParams = use(params) as { id: string }
  const property = properties.find((p) => p.id === unwrappedParams.id)

  if (!property) {
    notFound()
  }

  // Propiedades similares (misma ciudad o tipo)
  const similarProperties = properties
    .filter((p) => p.id !== property.id && (p.city === property.city || p.propertyType === property.propertyType))
    .slice(0, 3)

  const getEnergyCertificationColor = (cert: string | null | undefined) => {
    if (!cert) return "bg-gray-300"

    switch (cert) {
      case "A":
        return "bg-green-500"
      case "B":
        return "bg-green-400"
      case "C":
        return "bg-yellow-400"
      case "D":
        return "bg-yellow-500"
      case "E":
        return "bg-orange-400"
      case "F":
        return "bg-orange-500"
      case "G":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  // León, Spain coordinates
  const mapCoordinates = property.coordinates || { lat: 42.5987, lng: -5.5671 }
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46997.95492133559!2d${mapCoordinates.lng}!3d${mapCoordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd379a9a0d5e1bd9%3A0x7d849ffad4f1eef3!2sLe%C3%B3n%2C%20Spain!5e0!3m2!1sen!2sus!4v1681654321000!5m2!1sen!2sus`

  return (
    <>
      <Navbar socialLinks={socialLinks} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/busqueda" className="text-muted-foreground hover:text-primary">
              Propiedades
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium truncate">{property.title}</span>
          </div>
        </div>

        {/* Encabezado de la propiedad */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                {property.isBankOwned && (
                  <Badge variant="secondary" className="bg-amber-500 text-white">
                    Piso de Banco
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <p>
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Ref: {property.reference}</div>
            </div>
            <div className="flex flex-col md:items-end">
              <div className="text-3xl font-bold">
                {property.price.toLocaleString()}€{property.status === "for-rent" ? "/mes" : ""}
              </div>
              <Badge className="mt-1">
                {property.status === "for-sale"
                  ? "En Venta"
                  : property.status === "for-rent"
                    ? "En Alquiler"
                    : "Vendido"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="pb-8">
          <ImageGallery images={property.images || []} title={property.title} />
        </div>

        {/* Contenido principal */}
        <div className="pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Características principales */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-muted rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <Bed className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-muted-foreground">Habitaciones</span>
                  <span className="font-bold">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Bath className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-muted-foreground">Baños</span>
                  <span className="font-bold">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <SquareIcon className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-muted-foreground">Área</span>
                  <span className="font-bold">{property.squareFeet.toLocaleString()} m²</span>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
              </div>

              {/* Características */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Características detalladas - MODERNIZED */}
              <div>
                <h2 className="text-2xl font-bold mb-6">CARACTERÍSTICAS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Referencia</span>
                        <span className="text-primary">{property.reference}</span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Tipo de inmueble</span>
                        <span>
                          {property.propertyType === "piso"
                            ? "Piso"
                            : property.propertyType === "casa"
                              ? "Casa"
                              : property.propertyType === "local"
                                ? "Local"
                                : property.propertyType === "solar"
                                  ? "Solar"
                                  : "Garaje"}
                        </span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Superficie</span>
                        <span>{property.squareFeet} m²</span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Baños</span>
                        <span>{property.bathrooms}</span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Tipo calefacción</span>
                        <span>{property.heatingType || "No disponible"}</span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Garaje incluido</span>
                        {property.hasGarage ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Antigüedad</span>
                        <span>{property.age ? `${property.age} años` : "No disponible"}</span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Cert. Energética</span>
                        {property.energyCertification ? (
                          <span
                            className={`px-2 py-1 rounded-md text-white font-bold ${getEnergyCertificationColor(property.energyCertification)}`}
                          >
                            {property.energyCertification}
                          </span>
                        ) : (
                          "No disponible"
                        )}
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Habitaciones</span>
                        <span>{property.bedrooms}</span>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Calefacción</span>
                        {property.hasHeating ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Ascensor</span>
                        {property.hasElevator ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center p-4 bg-muted">
                        <span className="font-medium flex-1">Trastero</span>
                        {property.hasStorageRoom ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Certificación energética */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Certificación Energética</h2>
                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center justify-center mb-4">
                    <Image
                      src="/energy-certification.png"
                      alt="Certificación Energética"
                      width={400}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">Calificación: {property.energyCertification || "No disponible"}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Consumo de energía: {property.energyCertification ? "100 kWh/m² año" : "No disponible"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emisiones: {property.energyCertification ? "20 kg CO₂/m² año" : "No disponible"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
                <div className="aspect-[16/9] w-full rounded-lg overflow-hidden">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de la propiedad"
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Barra lateral */}
            <div className="space-y-6">
              {/* Acciones - REMOVED LIKE BUTTON */}
              <div className="flex gap-2">
                <Button className="flex-1">Contactar</Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Formulario de contacto */}
              <div className="p-6 border rounded-lg">
                <h3 className="font-bold text-lg mb-4">¿Interesado en esta propiedad?</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Tu teléfono"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Me interesa esta propiedad..."
                      defaultValue={`Hola, estoy interesado en esta propiedad. Me gustaría recibir más información.`}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar Consulta
                  </Button>
                </form>
              </div>

              {/* Agente */}
              <div className="p-6 border rounded-lg">
                <h3 className="font-bold text-lg mb-4">Agente Inmobiliario</h3>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image src="/confident-leader.png" alt="Agente Inmobiliario" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">Carlos Rodríguez</p>
                    <p className="text-sm text-muted-foreground">Agente Senior</p>
                    <p className="text-sm text-primary">+34 612 345 678</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Propiedades similares */}
        <div className="py-16">
          <h2 className="text-2xl font-bold mb-8">Propiedades Similares</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similarProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>
      <ContactSection />
      <Footer socialLinks={socialLinks} />
    </>
  )
}
