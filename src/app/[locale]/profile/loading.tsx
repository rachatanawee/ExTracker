export default function Loading() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
