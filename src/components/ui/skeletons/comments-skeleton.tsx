export function CommentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* New comment form skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse mb-3"></div>
            <div className="flex justify-end">
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="min-w-0 flex-1">
                <div className="bg-gray-50 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Some comments have replies */}
                {i % 2 === 0 && (
                  <div className="mt-3 ml-8 space-y-3">
                    <div className="flex space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="min-w-0 flex-1">
                        <div className="bg-white shadow-sm rounded-2xl px-4 py-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentItemSkeleton({ isReply = false }: { isReply?: boolean }) {
  return (
    <div className={`${isReply ? "ml-12 pl-4" : ""}`}>
      <div className="flex space-x-3">
        <div className={`${isReply ? "h-8 w-8" : "h-10 w-10"} bg-gray-200 rounded-full animate-pulse`}></div>
        <div className="min-w-0 flex-1">
          <div className={`rounded-2xl px-4 py-3 ${
            isReply ? "bg-white shadow-sm" : "bg-gray-50 shadow-md"
          }`}>
            <div className="flex items-center space-x-2 pr-16 mb-2">
              <div className={`${isReply ? "h-3 w-16" : "h-4 w-20"} bg-gray-200 rounded animate-pulse`}></div>
              <div className={`${isReply ? "h-2 w-12" : "h-3 w-16"} bg-gray-200 rounded animate-pulse`}></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse"></div>
              {!isReply && <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}