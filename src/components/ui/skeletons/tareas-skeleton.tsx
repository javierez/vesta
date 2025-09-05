export function TareasSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative p-3 sm:p-4 rounded-xl border border-gray-200 bg-white">
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <div className="h-6 w-6 sm:h-7 sm:w-7 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            <div className="pr-8 sm:pr-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-5 h-5 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div className="ml-6 sm:ml-8 mb-3">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 ml-6 sm:ml-8 mb-1">
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
              <div className="h-6 w-6 sm:h-7 sm:w-7 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}