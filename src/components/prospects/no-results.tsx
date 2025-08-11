"use client";

import { SearchX } from "lucide-react";

interface NoResultsProps {
  message: string;
}

export function NoResults({ message }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-medium text-gray-900">Sin resultados</h3>
      <p className="max-w-sm text-sm text-gray-500">{message}</p>
    </div>
  );
}
