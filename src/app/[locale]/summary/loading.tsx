export default function Loading() {
  return (
    <div className="space-y-3">
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

      <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
