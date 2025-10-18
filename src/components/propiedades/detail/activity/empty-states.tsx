import { Home, Calendar, Users } from "lucide-react";
import type { EmptyStateType } from "~/types/activity";

interface EmptyStateProps {
  type: EmptyStateType;
}

export function EmptyState({ type }: EmptyStateProps) {
  const states = {
    "completed-visits": {
      Icon: Home,
      title: "No hay visitas realizadas aún",
      subtitle: "Las visitas completadas aparecerán aquí",
    },
    "scheduled-visits": {
      Icon: Calendar,
      title: "No hay visitas programadas",
      subtitle: "Programa una visita para este inmueble",
    },
    "new-contacts": {
      Icon: Users,
      title: "No hay contactos nuevos",
      subtitle: "Los contactos recientes aparecerán aquí",
    },
  };

  const state = states[type];
  const Icon = state.Icon;

  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100">
        <Icon className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium text-base mb-2">{state.title}</p>
      <p className="text-gray-400 text-sm">{state.subtitle}</p>
    </div>
  );
}
