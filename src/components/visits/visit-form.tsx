"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { SignaturePad } from "./signature-pad";
import { VisitBreadcrumb } from "./visit-breadcrumb";
import { toast } from "sonner";
import { createVisitAction } from "~/server/actions/visits";
import { Save, Loader } from "lucide-react";
import type { AppointmentWithDetails, VisitFormData } from "~/types/visits";

interface VisitFormProps {
  appointment: AppointmentWithDetails;
}

export function VisitForm({ appointment }: VisitFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VisitFormData>({
    appointmentId: appointment.appointmentId,
    notes: appointment.notes || "",
  });
  const [agentSignature, setAgentSignature] = useState<string | null>(null);
  const [visitorSignature, setVisitorSignature] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Form submission started", { formData, agentSignature: !!agentSignature, visitorSignature: !!visitorSignature });
    
    if (!agentSignature || !visitorSignature) {
      console.log("❌ Missing signatures", { agentSignature: !!agentSignature, visitorSignature: !!visitorSignature });
      toast.error("Ambas firmas son requeridas");
      return;
    }
    
    if (!appointment.listingId) {
      console.log("❌ Missing listingId", { appointment });
      toast.error("La propiedad es requerida para esta cita");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("📤 Calling createVisitAction with:", {
        ...formData,
        agentSignature: agentSignature ? "present" : "missing",
        visitorSignature: visitorSignature ? "present" : "missing",
      });
      
      const result = await createVisitAction({
        ...formData,
        agentSignature,
        visitorSignature,
      });
      
      console.log("📥 createVisitAction result:", result);
      
      if (result.success) {
        console.log("✅ Visit created successfully");
        toast.success("Visita registrada correctamente");
        router.push("/calendario");
      } else {
        console.log("❌ Visit creation failed:", result.error);
        toast.error(result.error || "Error al registrar la visita");
      }
    } catch (error) {
      console.error("💥 Error submitting visit:", error);
      toast.error("Error al registrar la visita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/calendario");
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <VisitBreadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Registro de Visita
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            {appointment.propertyStreet || "Propiedad"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          {/* Visit Details */}
          <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Detalles de la Visita
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Contacto
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {appointment.contactFirstName} {appointment.contactLastName}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-900">
                Agente
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {appointment.agentName || 
                 `${appointment.agentFirstName} ${appointment.agentLastName}`}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-900">
                Propiedad
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {appointment.propertyStreet || "Propiedad no especificada"}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-900">
                Fecha y Hora
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {formatDateTime(appointment.datetimeStart)}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-900">
              Notas de la Visita
            </label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observaciones, comentarios del cliente, detalles relevantes..."
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

          {/* Signatures */}
          <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-6 sm:space-y-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Firmas
            </h2>
            
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
              <SignaturePad
                label="Firma del Agente"
                onSignatureChange={setAgentSignature}
                required
              />
              
              <SignaturePad
                label="Firma del Visitante"
                onSignatureChange={setVisitorSignature}
                required
              />
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              Ambas partes deben firmar en las áreas designadas para confirmar la visita.
            </p>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 sticky bottom-4 bg-white border rounded-lg p-4 shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !agentSignature || !visitorSignature}
              className="w-full sm:w-auto sm:min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Visita
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}