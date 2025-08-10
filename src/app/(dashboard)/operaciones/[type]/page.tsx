import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { OperationType } from "~/types/operations";
import { getStatusesForOperationType } from "~/types/operations";
import OperationsLayout from "~/components/operations/OperationsLayout";

interface OperationsPageProps {
  params: Promise<{
    type: string;
  }>;
  searchParams: Promise<{
    view?: 'list' | 'kanban';
    filter?: 'sale' | 'rent' | 'all';
    status?: string;
    page?: string;
  }>;
}

// Validate operation type
function isValidOperationType(type: string): type is OperationType {
  return ['prospects', 'leads', 'deals'].includes(type);
}

// Generate page metadata
export async function generateMetadata(
  { params }: OperationsPageProps
): Promise<Metadata> {
  const { type } = await params;
  
  if (!isValidOperationType(type)) {
    return {
      title: 'Operaciones - No Encontrado',
    };
  }

  const titles = {
    prospects: 'Prospectos',
    leads: 'Leads', 
    deals: 'Negocios'
  };

  return {
    title: `${titles[type]} - Panel de Operaciones`,
    description: `Gestiona ${titles[type].toLowerCase()} con tableros kanban y vistas de tabla. Rastrea estados, filtra por venta/alquiler, y realiza acciones en lote.`,
  };
}

// Generate static params for known operation types
export function generateStaticParams() {
  return [
    { type: 'prospects' },
    { type: 'leads' },
    { type: 'deals' }
  ];
}

// Loading component for Suspense
function OperationsLoading({ operationType }: { operationType: OperationType }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        
        {/* View toggle skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        
        {/* Content skeleton - kanban columns */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {getStatusesForOperationType(operationType).map((status) => (
            <div key={status} className="space-y-4">
              <div className="h-12 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-24 animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function OperationsError({ operationType, error }: { 
  operationType: OperationType; 
  error: Error;
}) {
  const typeNames = {
    prospects: 'prospectos',
    leads: 'leads',
    deals: 'negocios'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar {typeNames[operationType]}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Hubo un error al cargar los datos de {typeNames[operationType]}. Por favor, intenta actualizar la página.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Detalles del error</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {error.message}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main server component
async function OperationsData({ 
  operationType, 
  searchParams 
}: { 
  operationType: OperationType;
  searchParams: {
    view?: 'list' | 'kanban';
    filter?: 'sale' | 'rent' | 'all';
    status?: string;
    page?: string;
  };
}) {
  try {
    // Import kanban queries
    const { getKanbanDataWithAuth } = await import('~/server/queries/operations-kanban');

    // Extract search parameters with defaults
    const view = searchParams.view ?? 'kanban';
    const filter = searchParams.filter ?? 'all';
    const statusFilter = searchParams.status;
    const page = parseInt(searchParams.page ?? '1', 10);

    // Validate view parameter
    if (!['list', 'kanban'].includes(view)) {
      throw new Error('Parámetro de vista inválido');
    }

    // Validate filter parameter  
    if (!['sale', 'rent', 'all'].includes(filter)) {
      throw new Error('Parámetro de filtro inválido');
    }

    // Fetch data from kanban queries
    const { getOperationCountsWithAuth } = await import('~/server/queries/operations-kanban');
    
    // Fetch kanban data and counts in parallel
    const [kanbanData, operationCounts] = await Promise.all([
      getKanbanDataWithAuth(operationType, {
        listingType: filter,
        status: statusFilter,
        page,
        limit: 20, // Items per page for list view
      }),
      getOperationCountsWithAuth(operationType)
    ]);

    return (
      <OperationsLayout
        operationType={operationType}
        viewMode={view}
        listingTypeFilter={filter}
        statusFilter={statusFilter}
        currentPage={page}
        initialData={kanbanData}
        operationCounts={operationCounts}
      />
    );

  } catch (error) {
    console.error(`Error loading ${operationType} data:`, error);
    return <OperationsError operationType={operationType} error={error as Error} />;
  }
}

// Main page component
export default async function OperationsPage({ 
  params, 
  searchParams 
}: OperationsPageProps) {
  const { type } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate operation type - return 404 for invalid types
  if (!isValidOperationType(type)) {
    notFound();
  }

  return (
    <Suspense fallback={<OperationsLoading operationType={type} />}>
      <OperationsData 
        operationType={type} 
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}