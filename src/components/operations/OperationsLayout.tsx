"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import type {
  OperationType,
  ViewMode,
  ListingTypeFilter,
  KanbanData,
} from "~/types/operations";
import ViewToggle from "./ViewToggle";
import FilterToggle from "./FilterToggle";
import KanbanBoard from "./KanbanBoard";
import OperationsTable from "./OperationsTable";
import BulkActions from "./BulkActions";

interface OperationsLayoutProps {
  operationType: OperationType;
  viewMode: ViewMode;
  listingTypeFilter: ListingTypeFilter;
  statusFilter?: string;
  currentPage: number;
  initialData: KanbanData;
  operationCounts?: { sale: number; rent: number; all: number };
}

const OPERATION_TITLES = {
  prospects: "Prospectos",
  leads: "Leads",
  deals: "Negocios",
} as const;

const OPERATION_DESCRIPTIONS = {
  prospects: "Gestiona clientes potenciales y sus requisitos de propiedades",
  leads: "Rastrea interés entrante y convierte en oportunidades",
  deals: "Monitorea transacciones activas y cierra negocios",
} as const;

export default function OperationsLayout({
  operationType,
  viewMode,
  listingTypeFilter,
  statusFilter,
  currentPage,
  initialData,
  operationCounts,
}: OperationsLayoutProps) {
  // Selection state for bulk actions
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Get titles and metadata
  const title = OPERATION_TITLES[operationType];
  const description = OPERATION_DESCRIPTIONS[operationType];

  // Handle item selection
  const handleItemSelect = (itemId: string, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      // TODO: Get all visible item IDs based on current filters
      setSelectedItems(new Set([])); // Will implement when data loading is ready
    } else {
      setSelectedItems(new Set());
    }
  };

  // Clear selection when view mode changes
  const handleViewModeChange = () => {
    setSelectedItems(new Set());
  };

  // Clear selection when filters change
  const handleFilterChange = () => {
    setSelectedItems(new Set());
  };

  const selectedCount = selectedItems.size;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </div>

            {/* Add New Button */}
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar{" "}
              {operationType === "prospects"
                ? "Prospecto"
                : operationType === "leads"
                  ? "Lead"
                  : "Negocio"}
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <ViewToggle
              currentView={viewMode}
              operationType={operationType}
              onViewChange={handleViewModeChange}
            />

            {/* Filter Toggle */}
            <FilterToggle
              currentFilter={listingTypeFilter}
              operationType={operationType}
              operationCounts={operationCounts}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <BulkActions
              selectedCount={selectedCount}
              operationType={operationType}
              selectedItems={Array.from(selectedItems)}
              onClearSelection={() => setSelectedItems(new Set())}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="relative">
          {viewMode === "kanban" ? (
            <KanbanBoard
              operationType={operationType}
              listingType={listingTypeFilter}
              columns={initialData.columns}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
            />
          ) : (
            <OperationsTable
              operationType={operationType}
              listingType={listingTypeFilter}
              statusFilter={statusFilter}
              currentPage={currentPage}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
              // TODO: Pass table data when implemented
              data={[]}
              totalCount={initialData.totalCount}
            />
          )}
        </div>

        {/* Empty State */}
        {initialData.totalCount === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {/* TODO: Add appropriate icon based on operation type */}
              <div className="h-full w-full rounded-full bg-gray-200" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No se encontraron {title.toLowerCase()}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Comienza creando tu primer{" "}
              {operationType === "prospects"
                ? "prospecto"
                : operationType === "leads"
                  ? "lead"
                  : "negocio"}
              .
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar{" "}
                {operationType === "prospects"
                  ? "Prospecto"
                  : operationType === "leads"
                    ? "Lead"
                    : "Negocio"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
