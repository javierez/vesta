"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Plus, FileText, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import { createQuickPropertyAction } from "~/app/actions/quick-property";

export default function AccionesRapidasCard() {
  const router = useRouter();
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);

  const handleAddProperty = async () => {
    try {
      setIsCreatingProperty(true);
      const result = await createQuickPropertyAction();

      if (result.success) {
        router.push(`/propiedades/registro/${result.data.listingId}`);
      } else {
        console.error("Error creating property:", result.error);
        alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
        setIsCreatingProperty(false);
      }
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error inesperado. Por favor, inténtalo de nuevo.");
      setIsCreatingProperty(false);
    }
  };

  const actions = [
    {
      icon: Plus,
      label: "Añadir Propiedad",
      onClick: handleAddProperty,
    },
    {
      icon: FileText,
      label: "Crear Contrato",
      href: "/contratos/nuevo",
    },
    {
      icon: Calendar,
      label: "Programar Cita",
      href: "/citas/nueva",
    },
    {
      icon: Users,
      label: "Crear Cliente",
      href: "/clientes/nuevo",
    },
  ];

  return (
    <Card className="group relative">
      <CardContent>
        <div className="mb-4 mt-8 grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Component = action.onClick ? motion.button : motion.a;
            const props = action.onClick
              ? { onClick: action.onClick, disabled: action.label === "Añadir Propiedad" && isCreatingProperty }
              : { href: action.href };

            return (
              <Component
                key={action.label}
                {...props}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                  action.label === "Añadir Propiedad" && isCreatingProperty ? "opacity-50 cursor-wait" : ""
                }`}
              >
                <action.icon className="mb-2 h-6 w-6" />
                <span className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-600">
                  {action.label === "Añadir Propiedad" && isCreatingProperty ? "Creando..." : action.label}
                </span>
              </Component>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
