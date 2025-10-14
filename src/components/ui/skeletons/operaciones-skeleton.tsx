"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { motion } from "framer-motion";

/**
 * Simple skeleton for OperacionesSummaryCard
 */
export function OperacionesSummaryCardSkeleton({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full">
        <CardContent className="flex h-full flex-col pt-6">
          {/* Two toggle cards */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-gray-100 p-4">
              <Skeleton className="mx-auto h-6 w-12" />
              <Skeleton className="mx-auto mt-1 h-3 w-16" />
            </div>
            <div className="flex-1 rounded-xl bg-gray-50 p-4">
              <Skeleton className="mx-auto h-6 w-12" />
              <Skeleton className="mx-auto mt-1 h-3 w-16" />
            </div>
          </div>

          {/* Simple list items */}
          <div className="mt-4 flex-1 space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Simple skeleton for OperacionesQuickActionsCard
 */
export function OperacionesQuickActionsCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="h-full">
        <CardContent className="flex h-full flex-col pt-6">
          {/* Simple 2x3 grid */}
          <div className="grid flex-1 grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-6">
                <Skeleton className="mx-auto h-6 w-6" />
                <Skeleton className="mx-auto mt-2 h-2 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Simple skeleton for WorkQueueCard
 */
export function WorkQueueCardSkeleton({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column - Tasks */}
            <div>
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Appointments */}
            <div>
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                    <Skeleton className="mt-1 h-3 w-3/4" />
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
