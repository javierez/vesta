import { Badge } from "~/components/ui/badge";

const portals = [
  { name: "Fotocasa", description: "Portal líder de inmuebles" },
  { name: "Habitaclia", description: "Compra, venta y alquiler" },
  { name: "Idealista", description: "Portal inmobiliario premium" },
  { name: "Milanuncios", description: "Clasificados generales" },
];

const technologies = [
  { name: "OpenAI", description: "Inteligencia artificial avanzada" },
  { name: "AWS Textract", description: "Procesamiento de documentos" },
  { name: "Google Maps", description: "Geolocalización y mapas" },
  { name: "AWS S3", description: "Almacenamiento seguro" },
];

export function IntegrationsSection() {
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Conectado con lo mejor del mercado
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Integraciones nativas con los principales portales inmobiliarios y
            tecnologías líderes
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {/* Portales Inmobiliarios */}
          <div>
            <h3 className="mb-8 text-center text-2xl font-semibold text-gray-900">
              Portales Inmobiliarios
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {portals.map((portal) => (
                <div
                  key={portal.name}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl font-bold text-primary">
                      {portal.name.charAt(0)}
                    </span>
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-900">
                    {portal.name}
                  </h4>
                  <p className="text-sm text-gray-600">{portal.description}</p>
                  <Badge variant="secondary" className="mt-3">
                    Integración activa
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Tecnologías */}
          <div>
            <h3 className="mb-8 text-center text-2xl font-semibold text-gray-900">
              Tecnologías Avanzadas
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-900">
                    {tech.name}
                  </h4>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                  <Badge variant="outline" className="mt-3">
                    Integrado
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">4+</div>
            <div className="mt-2 text-lg font-medium text-gray-900">
              Portales Conectados
            </div>
            <div className="text-sm text-gray-600">
              Máxima exposición para tus propiedades
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">99.9%</div>
            <div className="mt-2 text-lg font-medium text-gray-900">
              Tiempo de Actividad
            </div>
            <div className="text-sm text-gray-600">
              Infraestructura confiable 24/7
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">API</div>
            <div className="mt-2 text-lg font-medium text-gray-900">
              Integración Avanzada
            </div>
            <div className="text-sm text-gray-600">
              Conecta con tus herramientas favoritas
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
