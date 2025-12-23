"use client"

import type React from "react"
import { useState } from "react"
import { TrendingUp, Package, BarChart3, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const ProductAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily")
  const [sortBy, setSortBy] = useState<"quantity" | "value">("quantity")
  const productAnalytics = {
    totalProducts: 156,
    totalSold: 2340,
    totalRevenue: 45200.75,
    topProducts: [
      { name: "حليب طازج", quantity: 450, value: 2250.0 },
      { name: "خبز عربي", quantity: 380, value: 1140.0 },
      { name: "عصير برتقال", quantity: 320, value: 1920.0 },
      { name: "جبنة بيضاء", quantity: 280, value: 2240.0 },
      { name: "مياه معدنية", quantity: 250, value: 750.0 },
      { name: "شوكولاتة", quantity: 220, value: 1760.0 },
      { name: "بسكويت", quantity: 200, value: 1200.0 },
      { name: "لحم بقري", quantity: 180, value: 5400.0 },
      { name: "دجاج طازج", quantity: 160, value: 2880.0 },
      { name: "طماطم", quantity: 150, value: 450.0 },
    ],
  }

  const categoryAnalytics = [
    { name: "الألبان ومنتجاتها", value: 12500.5, productCount: 25 },
    { name: "المخبوزات", value: 8900.25, productCount: 18 },
    { name: "المشروبات", value: 7200.75, productCount: 22 },
    { name: "اللحوم والدواجن", value: 15600.0, productCount: 12 },
    { name: "الخضار والفواكه", value: 4500.25, productCount: 35 },
    { name: "الحلويات والوجبات الخفيفة", value: 6800.5, productCount: 28 },
  ]

  const isLoading = false

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تحليل المنتجات</h1>
          <p className="mt-1 text-sm text-gray-500">إحصائيات مفصلة عن أداء المنتجات والتصنيفات</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 space-x-reverse gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "daily" | "weekly" | "monthly")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "quantity" | "value")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
            >
              <option value="quantity">ترتيب حسب الكمية</option>
              <option value="value">ترتيب حسب القيمة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-[hsl(var(--primary))]" />
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{productAnalytics?.totalProducts || 0}</div>
              <div className="text-sm text-gray-500">إجمالي المنتجات</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-[hsl(var(--secondary))]" />
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{productAnalytics?.totalSold || 0}</div>
              <div className="text-sm text-gray-500">إجمالي المبيعات</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 text-purple-600 font-bold text-lg">د.أ</div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {productAnalytics?.totalRevenue?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-yellow-600" />
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{categoryAnalytics?.length || 0}</div>
              <div className="text-sm text-gray-500">التصنيفات النشطة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أكثر المنتجات مبيعاً</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productAnalytics?.topProducts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [
                    sortBy === "quantity" ? `${value} قطعة` : `${value} د.أ`,
                    sortBy === "quantity" ? "الكمية المباعة" : "القيمة",
                  ]}
                />
                <Bar dataKey={sortBy === "quantity" ? "quantity" : "value"} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المبيعات حسب التصنيف</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryAnalytics || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(categoryAnalytics || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} د.أ`, "المبيعات"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">قائمة أفضل المنتجات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(productAnalytics?.topProducts || []).slice(0, 10).map((product: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.value.toFixed(2)} د.أ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">أداء التصنيفات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتجات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(categoryAnalytics || []).map((category: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.productCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.value.toFixed(2)} د.أ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAnalytics
