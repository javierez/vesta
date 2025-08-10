"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { OperationType, ListingTypeFilter } from "~/types/operations";

interface FilterToggleProps {
  currentFilter: ListingTypeFilter;
  operationType: OperationType;
  operationCounts?: { sale: number; rent: number; all: number };
  onFilterChange?: () => void; // Callback for clearing selection state
}

export default function FilterToggle({
  currentFilter,
  operationType,
  operationCounts,
  onFilterChange,
}: FilterToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (newFilter: ListingTypeFilter) => {
    // Create new search params with updated filter
    const params = new URLSearchParams(searchParams.toString());

    if (newFilter === "all") {
      params.delete("filter"); // Remove filter param for 'all'
    } else {
      params.set("filter", newFilter);
    }

    // Reset to page 1 when changing filters
    params.delete("page");

    // Navigate to new URL with updated filter parameter
    router.push(`${pathname}?${params.toString()}`);

    // Call the callback to handle any state cleanup (like clearing selections)
    onFilterChange?.();
  };

  // Use actual counts from props or default to 0
  const saleCount = operationCounts?.sale ?? 0;
  const rentCount = operationCounts?.rent ?? 0;
  const allCount = operationCounts?.all ?? saleCount + rentCount;

  const operationNames = {
    prospects: "prospectos",
    leads: "leads",
    deals: "negocios",
  };

  const filters = [
    {
      value: "all" as const,
      label: "Todos",
      count: allCount,
      ariaLabel: `Ver todos los ${operationNames[operationType]}`,
    },
    {
      value: "sale" as const,
      label: "Venta",
      count: saleCount,
      ariaLabel: `Ver ${operationNames[operationType]} de venta`,
    },
    {
      value: "rent" as const,
      label: "Alquiler",
      count: rentCount,
      ariaLabel: `Ver ${operationNames[operationType]} de alquiler`,
    },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <motion.button
          key={filter.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex flex-col items-center rounded-2xl px-4 py-3 transition-all duration-200 ${
            currentFilter === filter.value
              ? "bg-gray-100 shadow-xl"
              : "bg-white shadow hover:shadow-lg"
          }`}
          onClick={() => handleFilterChange(filter.value)}
          aria-label={filter.ariaLabel}
          type="button"
        >
          <span className="mb-0.5 text-lg font-bold text-primary">
            {filter.count}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {filter.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
