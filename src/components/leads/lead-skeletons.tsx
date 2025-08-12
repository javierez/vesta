"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function LeadTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <LeadTableRowSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function LeadTableRowSkeleton() {
  return (
    <TableRow>
      {/* Contacto */}
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </TableCell>
      {/* Propiedad */}
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      {/* Propietario */}
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      {/* Estado */}
      <TableCell>
        <Skeleton className="h-5 w-28" />
      </TableCell>
      {/* Fuente */}
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      {/* Creado */}
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      {/* Acciones */}
      <TableCell>
        <Skeleton className="h-6 w-6" />
      </TableCell>
    </TableRow>
  );
}

export function LeadPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <LeadTableSkeleton />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-8" />
          <Skeleton className="h-10 w-8" />
          <Skeleton className="h-10 w-8" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function EmptyLeadsState() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las conexiones entre demandantes y propietarios
          </p>
        </div>
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No hay leads</h3>
              <p className="max-w-sm text-muted-foreground">
                Los leads se crean automáticamente cuando se programan citas o
                se puede crear manualmente desde contactos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
