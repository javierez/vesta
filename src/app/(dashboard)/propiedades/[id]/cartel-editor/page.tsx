import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Edit, FileText } from "lucide-react";
import Link from "next/link";

interface CartelEditorPageProps {
  params: {
    id: string;
  };
}

export default function CartelEditorPage({ params }: CartelEditorPageProps) {
  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href={`/propiedades/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Propiedad
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Carteles</h1>
            <p className="text-sm text-gray-600">Propiedad ID: {params.id}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Editor de Carteles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Editor de Carteles en Desarrollo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Aquí podrás crear y editar carteles personalizados para tu propiedad.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Plantillas prediseñadas</p>
                    <p>• Editor visual de arrastrar y soltar</p>
                    <p>• Personalización de colores y tipografías</p>
                    <p>• Exportación en alta calidad</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plantillas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Próximamente tendrás acceso a plantillas prediseñadas.
              </p>
              <div className="grid gap-2">
                <div className="aspect-[3/4] bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Plantilla 1</span>
                </div>
                <div className="aspect-[3/4] bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Plantilla 2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Herramientas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Nuevo Cartel
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Existente
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Funcionalidad próximamente disponible
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}