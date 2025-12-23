import DataTable from "@/components/Common/DataTable";
import FactoryformModule from "@/components/factory/factoryformModule";
import type {
  GetFactoryOrderAggregate as FactoryOrder,
  FactoryOrderStatus,
} from "@/types/factory";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Eye,
  Factory,
  FileText,
  RefreshCw,
  Sheet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUS_LABELS: Record<FactoryOrderStatus, string> = {
  ORDERED_FROM_FACTORY: "تم الطلب من المصنع",
  ARRIVED_AT_WAREHOUSE: "وصل المستودع",
  PENDING_FACTORY: "قيد الانتظار",
};

interface FactoryBatchesResponse {
  data: FactoryOrder[];
  meta: {
    from: number;
    to: number;
    page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

const FactoryOrders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<FactoryOrder | null>(null);
  const [factoryOrdersData, setFactoryOrdersData] = useState<FactoryOrder[]>(
    []
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    last_page: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<number | null>(null);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState<number | null>(
    null
  );
  const [isGeneratingOrders, setIsGeneratingOrders] = useState(false);

  // Build API URL
  const buildApiUrl = () => {
    return `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches?page=${pagination.page}&limit=${pagination.limit}`;
  };

  // Fetch orders function
  const fetchOrders = async (page: number = pagination.page) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(buildApiUrl(), { credentials: "include" });

      if (!response.ok) {
        throw new Error("فشل في تحميل البيانات");
      }

      const res: FactoryBatchesResponse = await response.json();
      setFactoryOrdersData(res.data ?? []);
      setPagination((prev) => ({
        ...prev,
        page,
        total: res.meta.total,
        last_page: res.meta.last_page,
      }));
    } catch (err) {
      setError("فشل في تحميل البيانات");
      setFactoryOrdersData([]);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Update status function
  const updateFactoryOrderStatus = async (
    factoryId: number,
    status: FactoryOrderStatus
  ) => {
    try {
      setIsUpdatingStatus(factoryId);
      const response = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches/${factoryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const res = await response.json();

      if (res.success) {
        toast.success("تم تحديث حالة الطلب بنجاح");
        // Update local state
        setFactoryOrdersData((prev) =>
          prev.map((order) =>
            order.id === factoryId ? { ...order, status } : order
          )
        );
      } else {
        toast.error("حدث خطأ في تحديث حالة الطلب");
      }
    } catch {
      toast.error("حدث خطأ في تحديث حالة الطلب");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Create batch function
  const generateFactoryOrders = async () => {
    try {
      setIsGeneratingOrders(true);
      const response = await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchTime: "10:00" }),
        }
      );

      if (response.ok) {
        toast.success("تم إنشاء طلبات المصنع بنجاح");
        fetchOrders(1); // Refresh data
      } else {
        toast.error(
          "حدث خطأ في إنشاء طلبات المصنع تحقق من وجود طلبات جديده لإضافتها !"
        );
      }
    } catch {
      toast.error(
        "حدث خطأ في إنشاء طلبات المصنع تحقق من وجود طلبات جديده لإضافتها !"
      );
    } finally {
      setIsGeneratingOrders(false);
    }
  };

  // Download PDF for single factory batch
  const downloadPdf = async (factoryId: number) => {
    try {
      setIsDownloadingPdf(factoryId);
      const response = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches/${factoryId}/pdf`,
        {
          credentials: "include",
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("فشل في تحميل الملف");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factory-order-${factoryId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("تم تحميل الملف PDF بنجاح");
    } catch {
      toast.error("حدث خطأ في تحميل الملف");
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // Download Excel for single factory batch
  const downloadExcel = async (factoryId: number) => {
    try {
      setIsDownloadingExcel(factoryId);
      const response = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches/${factoryId}/excel`,
        {
          credentials: "include",
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("فشل في تحميل الملف");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factory-order-${factoryId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("تم تحميل الملف Excel بنجاح");
    } catch {
      toast.error("حدث خطأ في تحميل الملف");
    } finally {
      setIsDownloadingExcel(null);
    }
  };

  // Pagination handlers for DataTable
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchOrders(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));
    fetchOrders(1);
  };

  // Helpers
  const getStatusIcon = (status: FactoryOrderStatus) => {
    switch (status) {
      case "ORDERED_FROM_FACTORY":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "ARRIVED_AT_WAREHOUSE":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "PENDING_FACTORY":
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: FactoryOrderStatus) => {
    switch (status) {
      case "ORDERED_FROM_FACTORY":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ARRIVED_AT_WAREHOUSE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING_FACTORY":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // DataTable columns
  const columns = [
    {
      key: "factoryName",
      title: "تاريخ المصنع",
      render: (order: FactoryOrder) => (
        <div className="flex items-center gap-3">
          <Factory className="h-6 w-6 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {order.factoryName}
            </h3>
            {order.batchDate && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(order.batchDate)}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "totalCost",
      title: "التكلفة الإجمالية",
      render: (order: FactoryOrder) => (
        <span className="font-semibold text-gray-900">
          {order.totalCost?.toFixed(2) || "0.00"} د.أ
        </span>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (order: FactoryOrder) => (
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div className="flex gap-2">
            {(
              [
                "ORDERED_FROM_FACTORY",
                "ARRIVED_AT_WAREHOUSE",
              ] as FactoryOrderStatus[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => updateFactoryOrderStatus(order.id, status)}
                disabled={
                  isUpdatingStatus === order.id || order.status === status
                }
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                  order.status === status
                    ? getStatusColor(status)
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (order: FactoryOrder) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedOrder(order)}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer hover:scale-110 duration-150 p-1 rounded"
            title="رؤية التفاصيل"
            type="button"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => downloadPdf(order.id)}
            disabled={isDownloadingPdf === order.id}
            className="text-red-600 hover:text-red-700 cursor-pointer hover:scale-110 duration-150 p-1 rounded disabled:opacity-50"
            title="تحميل PDF"
            type="button"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => downloadExcel(order.id)}
            disabled={isDownloadingExcel === order.id}
            className="text-green-600 hover:text-green-700 cursor-pointer hover:scale-110 duration-150 p-1 rounded disabled:opacity-50"
            title="تحميل Excel"
            type="button"
          >
            <Sheet className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">طلبات المصنع</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة الطلبات على مستوى المصنع
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={generateFactoryOrders}
            disabled={isGeneratingOrders}
            className="inline-flex items-center justify-center px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 cursor-pointer transition-colors duration-200 flex-1 sm:flex-none"
          >
            <Factory className="h-4 w-4 ml-2" />
            {isGeneratingOrders ? "جاري الإنشاء..." : "إنشاء طلبات المصنع"}
          </button>
          <button
            onClick={() => fetchOrders(1)}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 ml-2 ${isLoading ? "animate-spin" : ""}`}
            />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {factoryOrdersData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-gray-500 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  قيد الانتظار
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    factoryOrdersData.filter(
                      (order) => order.status === "PENDING_FACTORY"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">تم الطلب</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    factoryOrdersData.filter(
                      (order) => order.status === "ORDERED_FROM_FACTORY"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  وصل المستودع
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    factoryOrdersData.filter(
                      (order) => order.status === "ARRIVED_AT_WAREHOUSE"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DataTable */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={factoryOrdersData}
          columns={columns}
          loading={isLoading}
          error={error}
          pagination={{
            currentPage: pagination.page,
            pageSize: pagination.limit,
            totalItems: pagination.total,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>

      {/* Empty State */}
      {!isLoading && !error && factoryOrdersData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Factory className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد طلبات مصنع
          </h3>
          <p className="text-gray-500 mb-6">لم يتم إنشاء طلبات للمصنع بعد</p>
          <button
            onClick={generateFactoryOrders}
            disabled={isGeneratingOrders}
            className="inline-flex items-center px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer disabled:opacity-50"
          >
            <Factory className="h-4 w-4 ml-2" />
            {isGeneratingOrders ? "جاري الإنشاء..." : "إنشاء طلبات جديدة"}
          </button>
        </div>
      )}

      {/* Factory Order Details Modal */}
      {selectedOrder && (
        <FactoryformModule
          factory={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default FactoryOrders;
