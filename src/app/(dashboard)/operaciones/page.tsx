"use client";

import { useState, useEffect } from "react";
import OperacionesSummaryCard from "~/components/dashboard/operations/OperacionesSummaryCard";
import WorkQueueCard from "~/components/dashboard/WorkQueueCard";
import OperacionesQuickActionsCard from "~/components/dashboard/operations/OperacionesQuickActionsCard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  getOperacionesSummaryWithAuth,
  getUrgentTasksWithAuth,
  getTodayAppointmentsWithAuth,
} from "~/server/queries/operaciones-dashboard";
import type { OperacionesSummary, UrgentTask, TodayAppointment } from "~/server/queries/operaciones-dashboard";
import { getMostUrgentTasksWithAuth } from "~/server/queries/task";

// Esqueleto específico para el resumen de operaciones (2 columnas)
function OperacionesSummaryCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="lg:col-span-2 group relative">
        <CardContent>
          {/* Alternar entre Venta y Alquiler */}
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex w-full justify-center gap-2">
              {/* Tarjeta de Venta (Active) */}
              <motion.div
                className="flex flex-1 flex-col items-center rounded-2xl p-3 bg-gray-100 shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Skeleton className="mb-0.5 h-5 w-8" />
                <Skeleton className="h-3 w-12" />
              </motion.div>

              {/* Tarjeta de Alquiler */}
              <motion.div
                className="flex flex-1 flex-col items-center rounded-2xl p-3 bg-white shadow"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Skeleton className="mb-0.5 h-5 w-8" />
                <Skeleton className="h-3 w-16" />
              </motion.div>
            </div>

            {/* Desglose de Operaciones */}
            <div className="mt-4 flex w-full flex-col gap-1.5">
              {[...Array(3) as unknown[]].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="flex w-full items-center justify-between rounded-lg border border-transparent bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-3 w-3" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Esqueleto para acciones rápidas (1 columna)
function QuickActionsCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="group relative">
        <CardContent>
          <div className="mb-4 mt-8 grid grid-cols-2 gap-3">
            {[...Array(6) as unknown[]].map((_, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Skeleton className="mb-2 h-6 w-6" />
                <Skeleton className="h-2.5 w-16" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Esqueleto para cola de trabajo (3 columnas)
function WorkQueueCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="md:col-span-2 lg:col-span-3">
        <CardContent>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {/* Columna de Tareas Urgentes */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {[...Array(4) as unknown[]].map((_, i) => (
                  <motion.div
                    key={i}
                    className="relative cursor-pointer p-2 sm:p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1.5">
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
                    </div>
                    
                    <div className="pr-16 sm:pr-20">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                        <Skeleton className="w-4 h-4 rounded border-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      
                      <div className="ml-4.5 sm:ml-6 mb-2 space-y-1.5">
                        <Skeleton className="h-6 w-32 rounded-lg" />
                        <Skeleton className="h-6 w-28 rounded-lg" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
                      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Columna de Citas */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              <div className="space-y-3">
                {[...Array(2) as unknown[]].map((_, groupIndex) => (
                  <div key={groupIndex} className="space-y-2">
                    {/* Date Separator */}
                    <div className="flex items-center py-1">
                      <Skeleton className="h-6 w-12 rounded-md" />
                    </div>

                    {/* Appointments for this date */}
                    <div className="space-y-2">
                      {[...Array(2) as unknown[]].map((_, i) => (
                        <motion.div
                          key={`${groupIndex}-${i}`}
                          className="group relative cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:shadow-md hover:ring-gray-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + (groupIndex * 2 + i) * 0.05 }}
                        >
                          {/* Icon and Type Badge */}
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <Skeleton className="h-2.5 w-12" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                          </div>

                          {/* Main content */}
                          <div className="pr-16">
                            {/* Contact name */}
                            <Skeleton className="h-4 w-32 mb-1" />

                            {/* Time */}
                            <div className="flex items-center gap-1 mb-2">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="w-3 h-px" />
                              <Skeleton className="h-3 w-12" />
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-1.5">
                              <Skeleton className="h-3 w-3 mt-0.5" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OperacionesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OperacionesSummary | null>(null);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [mostUrgentTasks, setMostUrgentTasks] = useState<Awaited<ReturnType<typeof getMostUrgentTasksWithAuth>>>([]);
  const [tasksDaysFilter, setTasksDaysFilter] = useState(7);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Initial data fetch (without detailed tasks)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Obtención de datos iniciales en paralelo para mejor rendimiento
        const [summaryData, tasksData, appointmentsData, mostUrgentTasksData] = await Promise.all([
          getOperacionesSummaryWithAuth(),
          getUrgentTasksWithAuth(5), // 5 días laborables
          getTodayAppointmentsWithAuth(),
          getMostUrgentTasksWithAuth(10, tasksDaysFilter), // Initial detailed tasks
        ]);

        setSummary(summaryData);
        setUrgentTasks(tasksData);
        setAppointments(appointmentsData);
        setMostUrgentTasks(mostUrgentTasksData);
      } catch (error) {
        console.error("Error al cargar datos de operaciones:", error);
        setError("No se pudieron cargar los datos de operaciones. Por favor, intenta actualizar la página.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect for fetching detailed tasks based on days filter
  useEffect(() => {
    const fetchDetailedTasks = async () => {
      setTasksLoading(true);
      try {
        const mostUrgentTasksData = await getMostUrgentTasksWithAuth(10, tasksDaysFilter);
        setMostUrgentTasks(mostUrgentTasksData);
      } catch (error) {
        console.error("Error al cargar tareas detalladas:", error);
      } finally {
        setTasksLoading(false);
      }
    };

    void fetchDetailedTasks();
  }, [tasksDaysFilter]);

  const handleDaysFilterChange = (days: number) => {
    setTasksDaysFilter(days);
  };

  const refreshTasks = async () => {
    try {
      const [urgentTasksData, mostUrgentTasksData] = await Promise.all([
        getUrgentTasksWithAuth(5),
        getMostUrgentTasksWithAuth(10, tasksDaysFilter),
      ]);
      setUrgentTasks(urgentTasksData);
      setMostUrgentTasks(mostUrgentTasksData);
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operaciones</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <OperacionesSummaryCardSkeleton />
          <QuickActionsCardSkeleton />
          <WorkQueueCardSkeleton />
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
          <OperacionesQuickActionsCard onTaskCreated={refreshTasks} />
          <WorkQueueCard
            tasks={urgentTasks}
            appointments={appointments}
            detailedTasks={mostUrgentTasks}
            loading={tasksLoading}
            onDaysChange={handleDaysFilterChange}
            className="md:col-span-2 lg:col-span-3"
          />
        </div>
      )}
    </div>
  );
}
