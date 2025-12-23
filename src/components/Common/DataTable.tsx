"use client"

import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Column {
  key: string
  title: string
  render?: (item: any,index:number) => React.ReactNode
}

interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number 
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  loading?: boolean
  error?: any
  pagination?: PaginationProps
}
 
const DataTable: React.FC<DataTableProps> = ({ data, columns, loading, error, pagination }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    )
  }
  if (error && !data?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-sm">حدث خطأ في تحميل البيانات</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-sm">لا توجد بيانات للعرض</div>
      </div>
    )
  }

  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : 1

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto min-w-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
              {columns.map((column) => (
  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
    {column.render ? column.render(item, index) : item[column.key]}
  </td>
))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
            
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              السابق
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= totalPages}
              className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                عرض <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> إلى{" "}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                </span>{" "}
                من <span className="font-medium">{pagination.totalItems}</span> نتيجة
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
               {[...Array(Math.min(5, totalPages || 1))].map((_, i) => {
                  const page = i + 1;
                  return (
                        <button
                        key={page}
                        onClick={() => pagination.onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                        pagination.currentPage === page
                        ? "z-10 bg-[hsl(var(--primary-10))] border-[hsl(var(--primary))] text-[hsl(var(--primary)))]"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
      }`}
    >
      {page}
    </button>
  );
})}

                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
