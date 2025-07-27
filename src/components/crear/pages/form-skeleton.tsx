"use client";

export default function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="h-6 w-24 animate-pulse rounded-md bg-gray-200"></div>

      {/* Input Fields Skeleton */}
      <div className="space-y-4">
        {/* First row - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 animate-pulse rounded-md bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 animate-pulse rounded-md bg-gray-200"></div>
          </div>
        </div>

        {/* Single input fields */}
        {[...(Array(4) as number[])].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 animate-pulse rounded-md bg-gray-200"></div>
          </div>
        ))}

        {/* Toggle/Select skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded-lg bg-gray-200"></div>
        </div>

        {/* Contact list skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-10 animate-pulse rounded-md bg-gray-200"></div>
          <div className="space-y-2 rounded-lg border border-gray-200 p-2">
            {[...(Array(3) as number[])].map((_, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons Skeleton */}
      <div className="flex justify-between border-t pt-4">
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
