import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  MessageSquare,
  Shield,
  CreditCard,
  Home,
  Bot,
  Zap,
} from "lucide-react";

const futureFeatures = [
  {
    title: "Integración con Twilio",
    description:
      "Gestiona conversaciones de WhatsApp y SMS directamente desde tu CRM. Mantén un historial completo de todas las comunicaciones con clientes.",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-100",
    timeline: "Q2 2025",
  },
  {
    title: "Sistema de Autenticación",
    description:
      "Seguridad empresarial con autenticación multi-factor, roles personalizados y acceso granular para equipos de cualquier tamaño.",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    timeline: "Q1 2025",
  },
  {
    title: "Pasarela de Pagos",
    description:
      "Procesa pagos de señas, comisiones y alquileres directamente en la plataforma. Integración completa con bancos españoles.",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    timeline: "Q3 2025",
  },
  {
    title: "Asistente de Alquiler",
    description:
      "Automatiza la gestión de alquileres: contratos, renovaciones, recordatorios de pago y mantenimiento de propiedades.",
    icon: Home,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    timeline: "Q2 2025",
  },
  {
    title: "Agente Conversacional",
    description:
      "IA avanzada que responde preguntas sobre propiedades, programa visitas y cualifica leads automáticamente 24/7.",
    icon: Bot,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    timeline: "Q4 2025",
  },
  {
    title: "Análisis Predictivo",
    description:
      "Insights impulsados por IA para predecir tendencias del mercado, valorar propiedades y optimizar estrategias de venta.",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    timeline: "Q3 2025",
  },
];

export function FutureFeatures() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            Próximamente
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            El futuro del sector inmobiliario
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Estamos trabajando en funciones revolucionarias que transformarán tu
            manera de hacer negocios
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {futureFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-2 border-dashed transition-all hover:border-solid hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div
                      className={`mb-4 inline-flex rounded-lg ${feature.bgColor} p-3`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.timeline}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900">
            ¿Tienes una idea para una nueva función?
          </h3>
          <p className="mt-4 text-lg text-gray-600">
            Construimos Vesta con feedback de profesionales del sector
            inmobiliario. Tu opinión da forma al futuro de la plataforma.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Badge variant="outline" className="px-4 py-2 text-center">
              📧 Solicitudes de funciones: ideas@vesta.com
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-center">
              💬 Programa Beta: Acceso anticipado disponible
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
