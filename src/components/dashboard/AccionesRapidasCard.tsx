"use client"
import { Card, CardContent } from "~/components/ui/card"
import { Plus, FileText, Calendar, Users } from "lucide-react"
import { motion } from "framer-motion"

export default function AccionesRapidasCard() {
  const actions = [
    {
      icon: Plus,
      label: "Añadir Propiedad",
      href: "/propiedades/nueva"
    },
    {
      icon: FileText,
      label: "Crear Contrato",
      href: "/contratos/nuevo"
    },
    {
      icon: Calendar,
      label: "Programar Cita",
      href: "/citas/nueva"
    },
    {
      icon: Users,
      label: "Crear Cliente",
      href: "/clientes/nuevo"
    }
  ]

  return (
    <Card className="relative group">
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mt-8 mb-4">
          {actions.map((action) => (
            <motion.a
              key={action.label}
              href={action.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100`}
            >
              <action.icon className="w-6 h-6 mb-2" />
              <span className="text-[10px] font-medium text-gray-600 text-center tracking-wide uppercase">{action.label}</span>
            </motion.a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 