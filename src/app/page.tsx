import InmueblesPublicadosCard from "~/components/dashboard/InmueblesPublicadosCard"
import OperacionesEnCursoCard from "~/components/dashboard/OperacionesEnCursoCard"
import AccionesRapidasCard from "~/components/dashboard/AccionesRapidasCard"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { DollarSign, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-6 mb-8">
          <OperacionesEnCursoCard className="lg:row-span-2" />
          <InmueblesPublicadosCard />
          <AccionesRapidasCard />
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Rendimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vistas de Propiedades</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+15% desde la semana pasada</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversión de Leads</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">23%</div>
                <p className="text-xs text-muted-foreground">+5% desde la semana pasada</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tiempo Promedio de Respuesta</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">2.5h</div>
                <p className="text-xs text-muted-foreground">-30min desde la semana pasada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
