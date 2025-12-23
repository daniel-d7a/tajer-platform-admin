"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { OrderFilters } from "../../types/order"

interface FilterPanelProps {
  filters: OrderFilters
  onFilterChange: (filters: OrderFilters) => void
  onReset?: () => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState<OrderFilters>(filters)

  useEffect(() => setLocalFilters(filters), [filters])

  const handleChange = (key: keyof OrderFilters, value: string | number | undefined) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const applyFilters = () => onFilterChange(localFilters)
  
  const resetFilters = () => {
    const emptyFilters = {}
    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
    onReset?.()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Order status */}
      <select
        value={localFilters.status ?? ""}
        onChange={(e) => handleChange("status", e.target.value || undefined)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
      >
        <option value="">جميع الحالات</option>
        <option value="PENDING">قيد الانتظار</option>
        <option value="PROCESSING">قيد المعالجة</option>
        <option value="DELIVERED">مكتمل</option>
        <option value="OUT_FOR_DELIVERY">خرج للتوصيل</option>
      </select>

      {/* From Date */}
      <input
        type="date"
        value={localFilters.from ?? ""}
        onChange={(e) => handleChange("from", e.target.value || undefined)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
        placeholder="من تاريخ"
      />

      {/* To Date */}
      <input
        type="date"
        value={localFilters.to ?? ""}
        onChange={(e) => handleChange("to", e.target.value || undefined)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
        placeholder="إلى تاريخ"
      />

      {/* Actions */}
      <div className="flex space-x-3 space-x-reverse col-span-full gap-2">
        <button 
          onClick={applyFilters} 
          className="flex-1 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer"
        >
          تطبيق
        </button>
        <button
          onClick={resetFilters}
          className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 cursor-pointer"
        >
          مسح
        </button>
      </div>
    </div>
  )
}

export default FilterPanel