"use client";

import { useState, useEffect } from "react";
import OperacionesSummaryCard from "~/components/dashboard/operations/OperacionesSummaryCard";
import WorkQueueCard from "~/components/dashboard/WorkQueueCard";
import OperacionesQuickActionsCard from "~/components/dashboard/operations/OperacionesQuickActionsCard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  getOperacionesSummaryWithAuth,
  getUrgentTasksWithAuth,
  getTodayAppointmentsWithAuth,
} from "~/server/queries/operaciones-dashboard";
import type { OperacionesSummary, UrgentTask, TodayAppointment } from "~/server/queries/operaciones-dashboard";

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

export default function OperacionesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OperacionesSummary | null>(null);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Obtención de datos en paralelo para mejor rendimiento
        const [summaryData, tasksData, appointmentsData] = await Promise.all([
          getOperacionesSummaryWithAuth(),
          getUrgentTasksWithAuth(5), // 5 días laborables
          getTodayAppointmentsWithAuth(),
        ]);

        setSummary(summaryData);
        setUrgentTasks(tasksData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error al cargar datos de operaciones:", error);
        setError("No se pudieron cargar los datos de operaciones. Por favor, intenta actualizar la página.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operaciones</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      ) : error ? (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error al Cargar el Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <OperacionesSummaryCard data={summary!} className="lg:col-span-2" />
          <OperacionesQuickActionsCard />
          <WorkQueueCard
            tasks={urgentTasks}
            appointments={appointments}
            className="md:col-span-2 lg:col-span-3"
          />
        </div>
      )}
    </div>
  );
}
