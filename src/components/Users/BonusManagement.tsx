import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DataTable from "../Common/DataTable";

interface User {
  id: number;
  commercialName: string;
  phone: string;
  email: string | null;
  passwordHash: string;
  city: string;
  area: string;
  locationDetails: string | null;
  businessType: string;
  role: string;
  walletBalance: number;
  isActive: boolean;
  createdAt: string | null;
  referredByRepId: number | null;
  referralCode: string;
  notificationToken: string | null;
  deletedAt: string | null;
  ip: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  lang: string | null;
  otp: string | null;
  hasVerifiedPhone: boolean;
}

interface Bonus {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  createdAt: string;
  user: User;
}

interface BonusResponse {
  data: Bonus[];
  meta: {
    limit: number;
    offset: number;
    from: number;
    to: number;
    page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

const BonusManagement: React.FC = () => {
  const [data, setData] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/bonus?page=${currentPage}&limit=${pageSize}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("فشل في جلب البيانات");
      }

      const result: BonusResponse = await response.json();
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
  }, [currentPage, pageSize]);

  const CalculateBonus = async () => {
    const res = await fetch(
      "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/bonus/calculate",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!res.ok) {
      toast.error("حدث خطأ اثناء الحساب جرب مره أخري");
    } else {
      fetchData();
    }
  };
  const getReasonText = (reason: string) => {
    const reasons: { [key: string]: string } = {
      monthly_referral_bonus: "مكافأة شهرية للإحالات",
      performance_bonus: "مكافأة أداء",
      special_bonus: "مكافأة خاصة",
      referral_bonus: "مكافأة إحالة",
    };
    return reasons[reason] || reason;
  };

  const columns = [
    {
      key: "user",
      title: "المندوب",
      render: (bonus: Bonus) => (
        <div>
          <div className="font-medium">{bonus.user.commercialName}</div>
          <div className="text-sm text-gray-500">{bonus.user.phone}</div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "المبلغ",
      render: (bonus: Bonus) => (
        <span className="font-semibold text-green-600">{bonus.amount} د.أ</span>
      ),
    },
    {
      key: "reason",
      title: "السبب",
      render: (bonus: Bonus) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {getReasonText(bonus.reason)}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "تاريخ الإضافة",
      render: (bonus: Bonus) => (
        <span className="text-sm text-gray-600">
          {new Date(bonus.createdAt).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "referralCode",
      title: "كود الإحالة",
      render: (bonus: Bonus) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {bonus.user.referralCode}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Add Bonus Modal */}

      <div className="w-full flex justify-end ">
        <button
          onClick={CalculateBonus}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-300 cursor-pointer"
        >
          أحسب الآن
          <RefreshCcw className="h-4 w-4 ml-2" />
        </button>
      </div>

      {/* Bonus Table */}
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

export default BonusManagement;
