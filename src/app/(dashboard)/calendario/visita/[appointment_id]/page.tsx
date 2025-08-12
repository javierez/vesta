import { notFound } from "next/navigation";
import { getAppointmentForVisitAction } from "~/server/actions/visits";
import { VisitForm } from "~/components/visits/visit-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface VisitPageProps {
  params: Promise<{
    appointment_id: string;
  }>;
}

export default async function VisitPage({ params }: VisitPageProps) {
  const { appointment_id } = await params;
  
  // Validate appointment ID is a valid number
  const appointmentId = parseInt(appointment_id);
  if (isNaN(appointmentId)) {
    notFound();
  }
  
  const result = await getAppointmentForVisitAction(BigInt(appointmentId));
  
  console.log("🔍 Appointment data for visit:", {
    appointmentId,
    success: result.success,
    appointment: result.appointment,
    listingId: result.appointment?.listingId,
    propertyStreet: result.appointment?.propertyStreet,
    hasExistingVisit: result.hasExistingVisit
  });
  
  if (!result.success || !result.appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Simple breadcrumb for error state */}
          <nav className="py-4" aria-label="Breadcrumb">
            <ol className="flex items-center text-sm">
              <li>
                <Link href="/calendario" className="text-muted-foreground hover:text-primary">
                  Calendario
                </Link>
              </li>
              <li className="mx-2 text-muted-foreground">/</li>
              <li className="font-medium" aria-current="page">
                Registro de Visita
              </li>
            </ol>
          </nav>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-900">Error</CardTitle>
              </div>
              <CardDescription>
                {result.error ?? "No se pudo cargar la información de la cita"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/calendario">
                <Button variant="outline">
                  Volver al calendario
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Check if visit already exists for this appointment
  if (result.hasExistingVisit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Simple breadcrumb for existing visit state */}
          <nav className="py-4" aria-label="Breadcrumb">
            <ol className="flex items-center text-sm">
              <li>
                <Link href="/calendario" className="text-muted-foreground hover:text-primary">
                  Calendario
                </Link>
              </li>
              <li className="mx-2 text-muted-foreground">/</li>
              <li className="font-medium" aria-current="page">
                Registro de Visita
              </li>
            </ol>
          </nav>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-amber-900">Visita ya registrada</CardTitle>
              </div>
              <CardDescription>
                Esta cita ya tiene una visita registrada. No se puede crear otra visita para la misma cita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <p><strong>Contacto:</strong> {result.appointment.contactFirstName} {result.appointment.contactLastName}</p>
                  <p><strong>Propiedad:</strong> {result.appointment.propertyStreet ?? 'No especificada'}</p>
                  <p><strong>Fecha:</strong> {new Intl.DateTimeFormat('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(result.appointment.datetimeStart)}</p>
                </div>
                <Link href="/calendario">
                  <Button variant="outline">
                    Volver al calendario
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return <VisitForm appointment={result.appointment} />;
}