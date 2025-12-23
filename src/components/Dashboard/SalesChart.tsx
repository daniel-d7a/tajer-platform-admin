import type React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SalesChartProps {
  data: any
  loading: boolean
}

const SalesChart: React.FC<SalesChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    )
  }

  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-gray-500">لا توجد بيانات للعرض</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => `التاريخ: ${label}`}
            formatter={(value: any) => [`${value} د.أ`, "المبيعات"]}
          />
          <Line type="monotone" dataKey="totalSales" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart
