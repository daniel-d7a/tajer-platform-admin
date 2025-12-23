import type React from "react"
import { Crown, TrendingUp } from "lucide-react"

interface TopPerformersProps {
  data: any
  loading: boolean
} 

const TopPerformers: React.FC<TopPerformersProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3 space-x-reverse">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return <div className="text-center text-gray-500 py-8">لا توجد بيانات للعرض</div>
  }
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Crown className="h-4 w-4 text-yellow-500 ml-2" />
          أفضل المتاجر أداءً
        </h4>
        <div className="space-y-3">
            {!data.topMerchants.length && (
              <h2 className="opacity-70 text-sm">لا توجد بيانات بعد حتي الآن </h2>
            )}
            {(data.topMerchants || []).slice(0, 5).map((store: any, index: number) => (
            <div key={store.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                        ? "bg-gray-100 text-gray-800"
                        : index === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-[hsl(var(--primary-10))] text-[hsl(var(--primary))]"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 flex justify-center items-center"> {store.commercialName}  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900">{store.totalValue.toFixed(2)} د.أ</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Representatives */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
          أفضل المندوبات أداءً
        </h4>
        <div className="space-y-3">
           {!data.topSalesReps.length && (
              <h2 className="opacity-70 text-sm">لا توجد بيانات بعد حتي الآن </h2>
            )}
          {(data.topSalesReps || []).slice(0, 5).map((rep: any, index: number) => (
            <div key={rep.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                        ? "bg-gray-100 text-gray-800"
                        : index === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-[hsl(var(--primary-10))] text-[hsl(var(--primary))]"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{rep.name}</div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900">{rep.registeredCount === 0 ? "  لا يوجد بعد":  rep.registeredCount} متاجر</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TopPerformers
