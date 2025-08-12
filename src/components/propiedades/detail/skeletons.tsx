export function ImageGallerySkeleton() {
  return (
    <div className="space-y-4">
      {/* Help text skeleton */}
      <div className="text-center">
        <div className="mx-auto h-4 w-80 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Image grid skeleton - matches the 2-3-4 column responsive grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-lg border bg-muted"
          >
            <div className="h-40 w-full animate-pulse bg-gray-200"></div>
            {/* Overlay buttons skeleton */}
            <div className="absolute left-2 top-2 h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
            <div className="absolute right-2 top-2 h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
            <div className="absolute bottom-2 left-2 h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
          </div>
        ))}
        {/* Upload button skeleton */}
        <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white">
          <div className="mb-1 h-5 w-5 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Control buttons skeleton */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function CharacteristicsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Property Title Section */}
      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Multiple form sections */}
      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="space-y-4 rounded-lg border bg-white p-6"
        >
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-10 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save indicator skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="h-9 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function PortalsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Portal cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white">
            <div className="p-6">
              {/* Portal header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                  <div className="space-y-1">
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-10 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-end space-x-2">
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200"></div>
        <div className="h-9 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function EnergyCertificateSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main card container */}
      <div className="rounded-lg border bg-white p-6">
        {/* Energy rating status selector */}
        <div className="mb-6 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy rating scales */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Consumption scale */}
          <div className="space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="flex space-x-1">
              {["A", "B", "C", "D", "E", "F", "G"].map((letter) => (
                <div key={letter} className="flex-1 space-y-1">
                  <div className="h-8 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
            <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          </div>

          {/* Emissions scale */}
          <div className="space-y-3">
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200"></div>
            <div className="flex space-x-1">
              {["A", "B", "C", "D", "E", "F", "G"].map((letter) => (
                <div key={letter} className="flex-1 space-y-1">
                  <div className="h-8 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
            <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        {/* File upload area */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mt-4 h-5 w-48 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mt-4 h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Save indicator skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Folders grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded bg-gray-200"></div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="mt-3 flex items-center space-x-1">
                  <div className="h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocumentsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Upload button skeleton */}
      <div className="mb-6 flex justify-end">
        <div className="h-9 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Document list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
