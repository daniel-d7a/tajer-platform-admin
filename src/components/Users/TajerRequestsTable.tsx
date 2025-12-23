import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import DataTable from "../Common/DataTable";
import { toast } from "react-hot-toast";

interface Merchant {
  id: number;
  commercialName: string;
  phone: string;
  email: string | null;
  city: string;
  area: string;
  businessType: string;
  role: string;
  walletBalance: number | null;
  isActive: boolean;
  createdAt: string | null;
  referredByRepId: number | null;
  referralCode: string | null;
  notificationToken: string | null;
  deletedAt: string | null;
  ip: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  lang: string | null;
  hasVerifiedPhone: boolean | null;
}

interface SalesRep {
  id: number;
  commercialName: string;
  phone: string;
  email: string | null;
  city: string;
  area: string;
  businessType: string;
  role: string;
  walletBalance: number | null;
  isActive: boolean;
  createdAt: string | null;
  referredByRepId: number | null;
  referralCode: string | null;
  notificationToken: string | null;
  deletedAt: string | null;
  ip: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  lang: string | null;
  hasVerifiedPhone: boolean | null;
}

interface TajerRequest {
  id: number;
  status: string;
  createdAt: string;
  tajer_id: number;
  sales_rep_id: number;
  merchant: Merchant;
  salesRep: SalesRep;
}

interface TajerRequestsResponse {
  data: TajerRequest[];
  meta: {
    from: number;
    to: number;
    page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

const TajerRequestsTable: React.FC = () => {
  const [data, setData] = useState<TajerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/admin/add-tajer-requests?page=${currentPage}&limit=${pageSize}&search=${searchTerm}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("فشل في جلب البيانات");
      }

      const result: TajerRequestsResponse = await response.json();
      setData(result.data);
      setTotalItems(result.meta.total);
    } catch (error) {
      toast.error("حدث خطأ في جلب البيانات");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm]);

  const handleConfirm = async (requestId: number, status: string) => {
    try {
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/admin/add-tajer-requests/${requestId}/confirm`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      if (response.ok) {
        toast.success("تم تأكيد الطلب بنجاح");
        fetchData();
      } else {
        toast.error("فشل في تأكيد الطلب");
      }
    } catch (error) {
      toast.error("حدث خطأ في تأكيد الطلب");
      console.error("Error confirming request:", error);
    }
  };
  const columns = [
    {
      key: "merchant",
      title: "التاجر",
      render: (request: TajerRequest) => (
        <div>
          <div className="font-medium">{request.merchant.commercialName}</div>
          <div className="text-sm text-gray-500">{request.merchant.phone}</div>
        </div>
      ),
    },
    {
      key: "salesRep",
      title: "مندوب المبيعات",
      render: (request: TajerRequest) => (
        <div>
          <div className="font-medium">{request.salesRep.commercialName}</div>
          <div className="text-sm text-gray-500">{request.salesRep.phone}</div>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (request: TajerRequest) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            request.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : request.status === "CONFIRMED"
                ? "bg-green-100 text-[hsl(var(--primary))]"
                : "bg-red-100 text-red-800"
          }`}
        >
          {request.status === "PENDING"
            ? "قيد الانتظار"
            : request.status === "CONFIRMED"
              ? "مؤكد"
              : "مرفوض"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "تاريخ الطلب",
      render: (request: TajerRequest) => (
        <span className="text-sm text-gray-600">
          {new Date(request.createdAt).toLocaleDateString("ar-EG")}
        </span>
      ),
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (request: TajerRequest) => (
        <div className="flex">
          {request.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(request.id, "CONFIRMED")}
                className="text-green-600 hover:text-green-800 cursor-pointer hover:scale-110 duration-150"
                title="تأكيد الطلب"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleConfirm(request.id, "REJECTED")}
                className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110 duration-150"
                title="رفض الطلب"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}
          {request.status !== "PENDING" && (
            <span className="text-gray-400 text-sm">
              {request.status === "CONFIRMED" ? "تم التأكيد" : "تم الرفض"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Refresh */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="البحث باسم التاجر أو المندوب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            pageSize,
            totalItems,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size: number) => {
              setPageSize(size);
              setCurrentPage(1);
            },
          }}
        />
      </div>
    </div>
  );
};

export default TajerRequestsTable;
