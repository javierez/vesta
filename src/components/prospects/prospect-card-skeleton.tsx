"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function ProspectCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="mb-3 flex items-start justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Contact name */}
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Content area */}
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-1 h-3 w-3/4" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
