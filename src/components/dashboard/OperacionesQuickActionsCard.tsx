"use client";
import { Card, CardContent } from "~/components/ui/card";
import {
  Plus,
  CheckSquare,
  TrendingUp,
  Calendar,
  Users,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OperacionesQuickActionsCard() {
  const actions = [
    {
      icon: Users,
      label: "Añadir Contacto",
      href: "/contactos/crear?type=prospect",
    },
    {
      icon: CheckSquare,
      label: "Crear Tarea",
      href: "#", // Esto abriría un modal
    },
    {
      icon: TrendingUp,
      label: "Pipeline de Ventas",
      href: "/operaciones/deals?type=sale",
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
          {actions.map((action) => (
            <motion.a
              key={action.label}
              href={action.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <action.icon className="mb-2 h-6 w-6" />
              <span className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-600">
                {action.label}
              </span>
            </motion.a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}