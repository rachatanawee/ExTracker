import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function Loading() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 animate-pulse">
          <div className="flex items-center gap-1 text-green-700 mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs font-medium">รายรับ</span>
          </div>
          <div className="h-6 bg-green-200 rounded w-20" />
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 animate-pulse">
          <div className="flex items-center gap-1 text-orange-700 mb-1">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-xs font-medium">รายจ่าย</span>
          </div>
          <div className="h-6 bg-orange-200 rounded w-20" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">รายการล่าสุด</h2>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
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
