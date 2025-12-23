import DataTable from "@/components/Common/DataTable";
import AddUsersForm from "@/components/Users/AddUsersForm";
import {
  DollarSign,
  Edit,
  Eye,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UserDetails from "../components/Users/userDetails";

interface User {
  id: number;
  commercialName: string;
  phone: string;
  email: string;
  city: string;
  businessType: string;
  role: string;
  walletBalance: number;
  isActive: boolean;
  area: string;
  referralCode: string;
}
interface Pagination {
  page: number;
  per_page: number;
  total: number;
  currentPage: number;
  pageSize: number;
}

const Users: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: 10,
    total: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [value, setValue] = useState<number>(0);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [addUserFormOpen, setAddUserFormOpen] = useState(false);

  const handleDeleteUser = async (item: User) => {
    if (
      window.confirm(
        `هل انت متاكد من انك تريد حقا حذف هذا المستخدم ${item.commercialName}`
      )
    ) {
      try {
        const res = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/users/${item.id}`,
          {
            credentials: "include",
            method: "DELETE",
          }
        );
        if (res.ok) {
          toast.success("تم حذف المستخدم بنجاح ");
          // Refresh data after deletion
          fetchData();
        } else {
          toast.error("حدث خطا اثناء حذف المستخدم");
        }
      } catch {
        toast.error("حدث خطا اثناء حذف المستخدم");
      }
    }
  };

  const columns = [
    { key: "id", title: "رقم المستخدم" },
    {
      key: "commercialName",
      title: "الاسم التجاري",
      render: (item: User) => <span>{item.commercialName || "غير محدد"}</span>,
    },
    {
      key: "phone",
      title: "رقم الهاتف",
      render: (item: User) => <span>{item.phone || "غير محدد"}</span>,
    },
    {
      key: "email",
      title: "البريد الإلكتروني",
      render: (item: User) => <span>{item.email || "غير محدد"}</span>,
    },
    {
      key: "city",
      title: "المدينة",
      render: (item: User) => <span>{item.city || "غير محدد"}</span>,
    },
    {
      key: "businessType",
      title: "نوع النشاط",
      render: (item: User) => {
        const businessTypes: { [key: string]: string } = {
          shop: "متجر",
          supermarket: "سوبر ماركت",
          restaurant: "مطعم",
          roastery: "محمصه",
          "sweets shop": "محل حلويات",
          "coffee shop": "محل قهوه",
          cafe: "قاهيه",
          library: "مكتبه",
          other: "أخري",
          pharmacy: "صيدلية",
          bakery: "مخبز",
          resturant: "مطعم",
          coffee_shop: "مقهى",
          clothes: "ملابس",
        };
        return (
          <span>
            {businessTypes[item.businessType] ||
              item.businessType ||
              "غير محدد"}
          </span>
        );
      },
    },
    {
      key: "role",
      title: "الدور",
      render: (item: User) => {
        const roles: { [key: string]: string } = {
          MERCHANT: "تاجر",
          SALES_REP: "مندوب مبيعات",
          ADMIN: "أدمن",
        };
        return <span>{roles[item.role] || item.role || "غير محدد"}</span>;
      },
    },
    {
      key: "walletBalance",
      title: "رصيد المحفظة",
      render: (item: User) => (
        <span>{item.walletBalance.toFixed(2) || 0} د.أ</span>
      ),
    },
    {
      key: "isActive",
      title: "الحالة",
      render: (item: User) =>
        item.isActive ? (
          <span className="text-green-600 font-semibold">مفعل</span>
        ) : (
          <span className="text-red-600 font-semibold">غير مفعل</span>
        ),
    },
    {
      key: "actions",
      title: "الخيارات",
      render: (item: User) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              setSelectedUser(item);
              setOpen(true);
            }}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setAddUserFormOpen(true);
              setSelectedUser(item);
            }}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer"
            title="تعديل المستخدم"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(item);
              setShowBalanceModal(true);
            }}
            className="text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]/90 cursor-pointer"
            title="إضافة رصيد"
          >
            <DollarSign className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(item)}
            className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110 duration-150"
            title="حذف المستخدم"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/public/users?limit=${pagination.pageSize}&page=${pagination.currentPage}&search=${searchTerm}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setData(data.data || []);
      setPagination((prev) => ({
        ...prev,
        page: data.meta?.page || 1,
        per_page: data.meta?.per_page || 10,
        total: data.meta?.total || 0,
      }));
    } catch {
      toast.error("حدث خطأ في جلب البيانات");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageSize, pagination.currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  const handleAddBalance = async () => {
    if (!selectedUser) return;
    if (value <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح أكبر من الصفر");
      return;
    }

    try {
      const res = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/cashback/cashback/manual`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId: selectedUser.id,
            amount: value,
          }),
        }
      );

      if (!res.ok) throw new Error("فشل في إضافة الرصيد");

      setData((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, walletBalance: (u.walletBalance || 0) + value }
            : u
        )
      );

      toast.success("تمت إضافة الرصيد بنجاح ");
      setShowBalanceModal(false);
      setValue(0);
      setSelectedUser(null);
      handleUserUpdate();
    } catch (err) {
      console.error(err);
      toast.error("حصل خطأ أثناء إضافة الرصيد ");
    }
  };

  const handleCloseModals = () => {
    setOpen(false);
    setShowBalanceModal(false);
    setAddUserFormOpen(false);
    setSelectedUser(null);
    setValue(0);
  };

  const handleUserUpdate = () => {
    fetchData(); // Refresh data after user update
    setAddUserFormOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة جميع المستخدمين في الموقع
        </p>
      </div>

      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-[80%] ">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="البحث باسم المستخدم او رقم الهاتف ...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
          />
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setAddUserFormOpen(true);
          }}
          className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer flex items-center hover:bg-[hsl(var(--primary))]/90 whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          إنشاء مستخدم جديد
        </button>
      </div>

      <DataTable
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalItems: pagination.total,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        columns={columns}
        data={data}
        loading={loading}
        error="لا توجد بيانات متاحة"
      />

      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                إضافة رصيد - {selectedUser.commercialName || "غير محدد"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المبلغ (د.أ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                    placeholder="أدخل المبلغ"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddBalance}
                    disabled={value <= 0}
                    className="flex-1 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إضافة رصيد
                  </button>
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      setSelectedUser(null);
                      setValue(0);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {addUserFormOpen && (
        <AddUsersForm data={selectedUser} onclose={handleCloseModals} />
      )}

      {open && selectedUser && (
        <UserDetails merchantId={selectedUser.id} onClose={handleCloseModals} />
      )}
    </div>
  );
};

export default Users;
