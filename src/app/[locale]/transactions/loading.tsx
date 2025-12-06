export default function Loading() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg p-3 border border-gray-200 animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-2" />
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded flex-1" />
          <div className="h-10 bg-gray-200 rounded flex-1" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 animate-pulse">
          <div className="h-3 bg-blue-200 rounded w-12 mb-1" />
          <div className="h-6 bg-blue-200 rounded w-16" />
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 animate-pulse">
          <div className="h-3 bg-green-200 rounded w-12 mb-1" />
          <div className="h-6 bg-green-200 rounded w-16" />
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 animate-pulse">
          <div className="h-3 bg-orange-200 rounded w-12 mb-1" />
          <div className="h-6 bg-orange-200 rounded w-16" />
        </div>
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
