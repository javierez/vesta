"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { OperationType, ListingTypeFilter } from "~/types/operations";
import { getTableColumnsForOperationType } from "~/types/operations";

interface OperationsTableProps {
  operationType: OperationType;
  listingType: ListingTypeFilter;
  statusFilter?: string;
  currentPage: number;
  selectedItems: Set<string>;
  onItemSelect: (itemId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  data: Record<string, unknown>[]; // Generic object type for operations data
  totalCount: number;
}

export default function OperationsTable({
  operationType,
  listingType,
  statusFilter,
  currentPage,
  selectedItems,
  onItemSelect,
  onSelectAll,
  data,
  totalCount,
}: OperationsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const columns = getTableColumnsForOperationType(operationType);
  const allSelected = data.length > 0 && selectedItems.size === data.length;
  const someSelected =
    selectedItems.size > 0 && selectedItems.size < data.length;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                if (column.key === "select") {
                  return (
                    <TableHead key={column.key} className={column.width}>
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            const input = el.querySelector("input")!;
                            if (input) input.indeterminate = someSelected;
                          }
                        }}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  );
                }

                if (column.key === "actions") {
                  return (
                    <TableHead key={column.key} className={column.width}>
                      {column.title}
                    </TableHead>
                  );
                }

                return (
                  <TableHead
                    key={column.key}
                    className={`${column.width} ${column.className}`}
                  >
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-medium"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.title}
                        {renderSortIcon(column.key)}
                      </Button>
                    ) : (
                      column.title
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow
                  key={String(item.id) || `item-${index}`}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.width}>
                      {/* TODO: Render actual data when data structure is implemented */}
                      {column.key === "select" && (
                        <Checkbox
                          checked={selectedItems.has(
                            String(item.id) || `item-${index}`,
                          )}
                          onCheckedChange={(checked) =>
                            onItemSelect(
                              String(item.id) || `item-${index}`,
                              Boolean(checked),
                            )
                          }
                          aria-label={`Select ${operationType.slice(0, -1)}`}
                        />
                      )}
                      {column.key === "actions" && (
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      )}
                      {column.key !== "select" && column.key !== "actions" && (
                        <span className="text-gray-900">
                          {/* Placeholder data */}
                          {column.key === "contactName" && "Sample Contact"}
                          {column.key === "status" && "New"}
                          {column.key === "lastActivity" && "2 days ago"}
                          {column.key === "nextTask" && "Follow up call"}
                          {/* Add more placeholder mappings as needed */}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No {operationType.toLowerCase()} found
                  {statusFilter && ` with status "${statusFilter}"`}
                  {listingType !== "all" && ` for ${listingType} properties`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * 20 + 1, totalCount)} to{" "}
            {Math.min(currentPage * 20, totalCount)} of {totalCount}{" "}
            {operationType.toLowerCase()}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1}>
              Previous
            </Button>
            <span className="text-sm text-gray-700">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage * 20 >= totalCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
