export function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Navigation Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Visits KPI Card Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex items-baseline gap-4">
                <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Contacts KPI Card Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex items-baseline gap-4">
                <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-4">
        {/* Filter Button Skeleton */}
        <div className="flex justify-end">
          <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* List Items Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-2.5">
              <div className="pr-28">
                {/* Name and timestamp */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Contact info */}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 w-1 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Badge - Top right */}
              <div className="absolute top-2 right-2">
                <div className="h-5 w-[120px] bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivityKPICardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="flex items-baseline gap-4">
            <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-1">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export function CompactContactCardSkeleton() {
  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-2.5">
      <div className="pr-28">
        {/* Name and timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-2 w-1 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Badge - Top right */}
      <div className="absolute top-2 right-2">
        <div className="h-5 w-[120px] bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2.5">
      <div className="flex items-start gap-3">
        {/* Time section */}
        <div className="flex-shrink-0">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 self-stretch"></div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
