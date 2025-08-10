"use client";

import { useState } from "react";
import { ChevronDown, Users, CheckCircle, Plus, Download, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import type { OperationType } from "~/types/operations";

interface BulkActionsProps {
  selectedCount: number;
  operationType: OperationType;
  selectedItems: string[];
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedCount,
  operationType,
  selectedItems,
  onClearSelection
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual bulk actions when server actions are ready
      console.log(`Bulk action: ${action}`, { operationType, selectedItems });
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just clear selection after action
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const entityName = operationType.slice(0, -1); // Remove 's' for singular

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
      {/* Selection Count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {selectedCount} seleccionados
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Limpiar selección</span>
        </Button>
      </div>

      {/* Bulk Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Acciones en Lote"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Assign Actions */}
          <DropdownMenuItem onClick={() => handleAction('assign')}>
            <Users className="mr-2 h-4 w-4" />
            Asignar a Usuario
          </DropdownMenuItem>
          
          {/* Status Update Actions */}
          <DropdownMenuItem onClick={() => handleAction('updateStatus')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Actualizar Estado
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Task Actions */}
          <DropdownMenuItem onClick={() => handleAction('createTasks')}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Tareas
          </DropdownMenuItem>
          
          {/* Export Actions */}
          <DropdownMenuItem onClick={() => handleAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar a CSV
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Danger Zone */}
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600"
            onClick={() => handleAction('delete')}
          >
            Eliminar Seleccionados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Status Updates */}
      {operationType === 'prospects' && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('markQualified')}
            disabled={isLoading}
          >
            Marcar Calificado
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('markArchived')}
            disabled={isLoading}
          >
            Archivar
          </Button>
        </div>
      )}

      {operationType === 'leads' && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('markConverted')}
            disabled={isLoading}
          >
            Marcar Convertido
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('markDisqualified')}
            disabled={isLoading}
          >
            Descalificar
          </Button>
        </div>
      )}

      {operationType === 'deals' && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('markClosed')}
            disabled={isLoading}
          >
            Marcar Cerrado
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('markLost')}
            disabled={isLoading}
          >
            Marcar Perdido
          </Button>
        </div>
      )}
    </div>
  );
}