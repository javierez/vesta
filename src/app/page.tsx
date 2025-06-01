import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Home as HomeIcon,
  Briefcase,
  Settings
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import InmueblesPublicadosCard from "~/components/dashboard/InmueblesPublicadosCard"
import OperacionesEnCursoCard from "~/components/dashboard/OperacionesEnCursoCard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-6 mb-8">
          <OperacionesEnCursoCard className="lg:row-span-2" />
          <InmueblesPublicadosCard />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">+20% desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild>
                <Link href="/properties/new">
                  <FileText className="mr-2 h-4 w-4" />
                  Agregar Nueva Propiedad
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/clients/new">
                  <Users className="mr-2 h-4 w-4" />
                  Agregar Nuevo Cliente
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/appointments/new">
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar Cita
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo listado de propiedad agregado</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
