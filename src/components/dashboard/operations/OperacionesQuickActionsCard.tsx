"use client";
import { Card, CardContent } from "~/components/ui/card";
import {
  Plus,
  CheckSquare,
  FileText,
  Calendar,
  Users,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlobalTaskModalTrigger } from "~/components/tasks/global-task-modal";

interface OperacionesQuickActionsCardProps {
  onTaskCreated?: () => void;
}

export default function OperacionesQuickActionsCard({ onTaskCreated }: OperacionesQuickActionsCardProps = {}) {
  const actions = [
    {
      icon: Users,
      label: "Añadir Contacto",
      href: "/contactos/crear",
    },
    {
      icon: CheckSquare,
      label: "Crear Tarea",
      isModal: true,
    },
    {
      icon: FileText,
      label: "Crear Contrato",
      isMock: true,
      isNew: true,
    },
    {
      icon: Home,
      label: "Pipeline de Alquileres",
      href: "/operaciones/deals?type=rent",
    },
    {
      icon: Calendar,
      label: "Programar Cita",
      href: "/calendario?new=true",
    },
    {
      icon: Plus,
      label: "Añadir Propiedad",
      href: "/propiedades/crear",
    },
  ];

  return (
    <Card className="group relative">
      <CardContent>
        <div className="mb-4 mt-8 grid grid-cols-2 gap-3">
          {actions.map((action) => {
            if (action.isModal && action.label === "Crear Tarea") {
              return (
                <GlobalTaskModalTrigger key={action.label} onSuccess={onTaskCreated}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <action.icon className="mb-2 h-6 w-6" />
                    <span className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-600">
                      {action.label}
                    </span>
                  </motion.div>
                </GlobalTaskModalTrigger>
              );
            }

            if (action.isMock) {
              return (
                <motion.div
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer opacity-90"
                  onClick={() => {
                    // Mock button - just show an alert for now
                    alert('Funcionalidad próximamente disponible');
                  }}
                >
                  {action.isNew && (
                    <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                  )}
                  <action.icon className="mb-2 h-6 w-6" />
                  <span className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-600">
                    {action.label}
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.a
                key={action.label}
                href={action.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <action.icon className="mb-2 h-6 w-6" />
                <span className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-600">
                  {action.label}
                </span>
              </motion.a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
