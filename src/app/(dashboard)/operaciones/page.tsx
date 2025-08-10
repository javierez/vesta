import OperacionesSummaryCard from "~/components/dashboard/operations/OperacionesSummaryCard";
import WorkQueueCard from "~/components/dashboard/WorkQueueCard";
import OperacionesQuickActionsCard from "~/components/dashboard/operations/OperacionesQuickActionsCard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  getOperacionesSummaryWithAuth,
  getUrgentTasksWithAuth,
  getTodayAppointmentsWithAuth,
} from "~/server/queries/operaciones-dashboard";

// Componente esqueleto de carga para las tarjetas del panel
function DashboardCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-12 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente servidor para obtención de datos
async function OperacionesData() {
  try {
    // Obtención de datos en paralelo para mejor rendimiento
    const [summary, urgentTasks, appointments] = await Promise.all([
      getOperacionesSummaryWithAuth(),
      getUrgentTasksWithAuth(5), // 5 días laborables
      getTodayAppointmentsWithAuth(),
    ]);

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OperacionesSummaryCard data={summary} className="lg:col-span-2" />
        <OperacionesQuickActionsCard />
        <WorkQueueCard
          tasks={urgentTasks}
          appointments={appointments}
          className="md:col-span-2 lg:col-span-3"
        />
      </div>
    );
  } catch (error) {
    console.error("Error al cargar datos de operaciones:", error);
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error al Cargar el Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se pudieron cargar los datos de operaciones. Por favor, intenta
            actualizar la página.
          </p>
        </CardContent>
      </Card>
    );
  }
}

// Componente de respaldo para carga
function LoadingFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </div>
  );
}

export default function OperacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operaciones</h1>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <OperacionesData />
      </Suspense>
    </div>
  );
}
