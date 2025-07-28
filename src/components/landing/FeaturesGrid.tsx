import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Building2,
  Users,
  Globe,
  Calendar,
  Sparkles,
  FileText,
} from "lucide-react";

const features = [
  {
    title: "Gestión de Propiedades",
    description:
      "Administra tu portafolio inmobiliario con herramientas intuitivas y potentes. Crea listados detallados, gestiona documentos y realiza seguimiento de cada propiedad.",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "CRM de Contactos",
    description:
      "Convierte más leads con nuestro sistema de gestión de contactos. Rastrea interacciones, automatiza seguimientos y cierra más tratos.",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Publicación Multi-Portal",
    description:
      "Publica en Fotocasa, Habitaclia, Idealista y Milanuncios con un solo clic. Ahorra tiempo y maximiza la exposición de tus propiedades.",
    icon: Globe,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Calendario Integrado",
    description:
      "Nunca pierdas una cita. Programa visitas, recordatorios y tareas. Sincroniza con tu calendario favorito y mantén todo organizado.",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Descripciones con IA",
    description:
      "Genera descripciones atractivas y optimizadas para SEO con inteligencia artificial. Destaca las mejores características de cada propiedad.",
    icon: Sparkles,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    title: "Procesamiento de Documentos",
    description:
      "Digitaliza y extrae información de documentos automáticamente con OCR avanzado. Organiza contratos, escrituras y más en segundos.",
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

export function FeaturesGrid() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Todo lo que necesitas para triunfar
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Herramientas profesionales diseñadas específicamente para el sector
            inmobiliario español
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex rounded-lg ${feature.bgColor} p-3`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
