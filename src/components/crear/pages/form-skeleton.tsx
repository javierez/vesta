"use client"

export default function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="h-6 bg-gray-200 rounded-md w-24 animate-pulse"></div>
      
      {/* Input Fields Skeleton */}
      <div className="space-y-4">
        {/* First row - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Single input fields */}
        {[...Array(4) as number[]].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        ))}

        {/* Toggle/Select skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Contact list skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="border border-gray-200 rounded-lg p-2 space-y-2">
            {[...Array(3) as number[]].map((_, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons Skeleton */}
      <div className="flex justify-between pt-4 border-t">
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
  )
}
