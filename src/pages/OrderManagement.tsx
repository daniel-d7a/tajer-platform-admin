'use client';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Eye, Edit, RefreshCw, Calendar, FileText, Sheet } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/Common/DataTable';
import FilterPanel from '@/components/Orders/FilterPanel';
import OrderDetailsModal from '@/components/Orders/OrderDetailsModal';
import StatusUpdateModal from '@/components/Orders/StatusUpdateModal';
import type { GetOrder, OrderFilters } from '@/types/order';

const OrderManagement: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<GetOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<GetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const queryClient = useQueryClient();

  const buildApiUrl = () => {
    const baseUrl = 'https://tajer-backend.tajerplatform.workers.dev/api/orders/orders';
    const params = new URLSearchParams();
    
    if (filters.status && String(filters.status).trim() !== '') {
      params.append('status', filters.status);
    }
    if (filters.from && filters.from.trim() !== '') {
      params.append('from', filters.from);
    }
    if (filters.to && filters.to.trim() !== '') {
      params.append('to', filters.to);
    }
    
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    
    return `${baseUrl}?${params.toString()}`;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl();
      const res = await fetch(url, { credentials: 'include' });
      const responseData = await res.json();

      setData(responseData.data || []);
      setTotal(responseData.meta?.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      toast.error('حدث خطأ في تحميل البيانات');
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize]);

  // Download PDF for single order
  const downloadPdfMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/orders/orders/${orderId}/pdf`,
        { 
          credentials: 'include',
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        throw new Error('فشل في تحميل الملف');
      }
      
      const blob = await response.blob();
      return { blob, orderId };
    },
    onSuccess: ({ blob, orderId }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('تم تحميل الملف PDF بنجاح');
    },
    onError: () => toast.error('حدث خطأ في تحميل الملف'),
  });

  // Download Excel for single order
  const downloadExcelMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/orders/orders/${orderId}/excel`,
        { 
          credentials: 'include',
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        throw new Error('فشل في تحميل الملف');
      }
      
      const blob = await response.blob();
      return { blob, orderId };
    },
    onSuccess: ({ blob, orderId }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${orderId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('تم تحميل الملف Excel بنجاح');
    },
    onError: () => toast.error('حدث خطأ في تحميل الملف'),
  });



  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/orders/orders/${orderId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('تم تحديث حالة الطلب بنجاح');
      setShowStatusModal(false);
      fetchOrders();
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث حالة الطلب');
    },
  });

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الإنتظار';
      case 'DELIVERED':
        return 'تم التوصيل';
      case 'PROCESSING':
        return 'قيد التنفيذ';
      case 'OUT_FOR_DELIVERY':
        return 'خرج للتوصيل';
      default:
        return status;
    }
  };

  // Format date like factory batches
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const columns = [
    {
      key: 'text_id',
      title: 'رقم الطلب',
      render: (order: GetOrder) => (
        <span className="font-medium text-[hsl(var(--primary))]">
          #{order.text_id}
        </span>
      ),
    },
    {
      key: 'merchantName',
      title: 'اسم الدكان',
      render: (order: GetOrder) => (
        <div>
          <div className="font-medium">{order.merchant.commercialName}</div>
        </div>
      ),
    },
    {
      key: 'totalValue',
      title: 'القيمة (د.أ)',
      render: (order: GetOrder) => (
        <span className="font-semibold">{order.totalValue.toFixed(2)}</span>
      ),
    },
    {
      key: 'createdAt',
      title: 'التاريخ',
      render: (order: GetOrder) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(order.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (order: GetOrder) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.status)}`}
        >
          {getStatusText(order.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (order: GetOrder) => (
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowDetailsModal(true);
            }}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer hover:scale-110 duration-150 p-1 rounded"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowStatusModal(true);
            }}
            className="text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]/90 cursor-pointer hover:scale-110 duration-150 p-1 rounded"
            title="تحديث الحالة"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => downloadPdfMutation.mutate(order.id)}
            disabled={downloadPdfMutation.isPending}
            className="text-red-600 hover:text-red-700 cursor-pointer hover:scale-110 duration-150 p-1 rounded disabled:opacity-50"
            title="تحميل PDF"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => downloadExcelMutation.mutate(order.id)}
            disabled={downloadExcelMutation.isPending}
            className="text-green-600 hover:text-green-700 cursor-pointer hover:scale-110 duration-150 p-1 rounded disabled:opacity-50"
            title="تحميل Excel"
          >
            <Sheet className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Calculate status counts for stats cards
  const statusCounts = {
    PENDING: data.filter(order => order.status === 'PENDING').length,
    PROCESSING: data.filter(order => order.status === 'PROCESSING').length,
    OUT_FOR_DELIVERY: data.filter(order => order.status === 'OUT_FOR_DELIVERY').length,
    DELIVERED: data.filter(order => order.status === 'DELIVERED').length,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="mt-1 text-sm text-gray-500">
            الجدول الأساسي لطلبات الدكاكين والعملاء
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">قيد الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.PENDING}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.PROCESSING}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">خرج للتوصيل</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.OUT_FOR_DELIVERY}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">تم التوصيل</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.DELIVERED}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Controls */}

      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"></div> 
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Filter className="h-4 w-4 ml-2" />
            {showFilters ? 'إخفاء الفلترة' : 'فلترة'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
            />
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          error={null}
          pagination={{
            currentPage,
            pageSize,
            totalItems: total,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* Modals */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={{
            ...selectedOrder,
            createdAt: selectedOrder.createdAt, 
            text_id: selectedOrder.text_id,
            merchant: {
              ...selectedOrder.merchant,
              phone: selectedOrder.merchant.phone ?? '', 
            }
          }}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          
          loading={updateOrderStatusMutation.isPending}
        />
      )}
    </div>
  );
};

export default OrderManagement;