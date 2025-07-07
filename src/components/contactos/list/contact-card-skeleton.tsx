"use client"

import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

export function ContactCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-5 w-[80px]" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
} 