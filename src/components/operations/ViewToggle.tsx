"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TableIcon, KanbanSquareIcon } from "lucide-react";
import type { OperationType, ViewMode } from "~/types/operations";

interface ViewToggleProps {
  currentView: ViewMode;
  operationType: OperationType;
  onViewChange?: () => void; // Callback for clearing selection state
}

export default function ViewToggle({
  currentView,
  operationType: _operationType,
  onViewChange,
}: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleViewChange = (newView: ViewMode) => {
    // Create new search params with updated view
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);

    // Navigate to new URL with updated view parameter
    router.push(`${pathname}?${params.toString()}`);

    // Call the callback to handle any state cleanup (like clearing selections)
    onViewChange?.();
  };

  return (
    <Tabs
      value={currentView}
      onValueChange={(value) => handleViewChange(value as ViewMode)}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <TableIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Lista</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <KanbanSquareIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Kanban</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
