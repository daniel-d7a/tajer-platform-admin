'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Search, Eye, Edit, RefreshCw, Users, Trash2, Copy } from 'lucide-react';
import DataTable from '../components/Common/DataTable';
import AddUser from '@/components/Users/AddUsersForm';
import UserDetails from '@/components/Users/userDetails';
import TajerRequestsTable from '@/components/Users/TajerRequestsTable';
import BonusManagement from '@/components/Users/BonusManagement';
import type {
  SalesRepresentativeData,
} from '../types/representative';
import { toast } from 'react-hot-toast';

interface overviewType {
  totalRepresentatives: number;
  totalCommission: number;
  activeRepresentatives: number;
}

interface selectedUserType {
  id: number;
  commercialName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  referralCode: string | null;
  totalStores: number;
  activeStores: number;
  totalCommission: number;
  monthlyCommission: number;
}

const TabType = {
  REPRESENTATIVES: 'representatives',
  TAJER_REQUESTS: 'tajer_requests',
  BONUS: 'bonus'
} as const;

type TabType = typeof TabType[keyof typeof TabType];

const RepresentativeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [overview, setOverView] = useState<overviewType>();
  const [selectedUser, setSelectedUser] = useState<selectedUserType>();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [OpenDetails, setOpenDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.REPRESENTATIVES);


  const registrationLink = "https://tajer-sales-worker.tajerplatform.workers.dev/register-sales-reps";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success('تم نسخ الرابط بنجاح');
  };

  const handleDeleteUser = async (item: selectedUserType) => {
    if (window.confirm(`هل انت متاكد من انك تريد حقا حذف هذا المستخدم? ${item.commercialName}`)) {
      try {
        const res = await fetch(`https://tajer-backend.tajerplatform.workers.dev/api/admin/users/${item.id}`, {
          credentials: "include",
          method: "DELETE",
        });
        if (res.ok) {
          toast.success('تم حذف المستخدم بنجاح');
          fetchData();
        } else {
          toast.error('حدث خطا اثناء حذف المستخدم');
        }
      } catch {
        toast.error("حدث خطاء في الحذف");
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetch(`https://tajer-backend.tajerplatform.workers.dev/api/admin/sales-reps?page=${currentPage}&limit=${pageSize}&search=${searchTerm}`, { credentials: 'include' });
      const res = await data.json();
      setData(res.data);
      if (res.meta) {
        setTotalItems(res.meta.total || 0);
        setCurrentPage(res.meta.page || currentPage);
        setPageSize(res.meta.limit || pageSize);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }

  const OverView = async () => {
    try {
      const data = await fetch('https://tajer-backend.tajerplatform.workers.dev/api/admin/overview', { credentials: 'include' });
      const res = await data.json();
      setOverView(res);
    } catch (error) {
      console.error('Error fetching overview:', error);
      toast.error('حدث خطأ في جلب الإحصائيات');
    }
  };

  useEffect(() => {
    OverView();
    if (activeTab === TabType.REPRESENTATIVES) {
      fetchData();
    }
  }, [searchTerm, currentPage, pageSize, activeTab]);

  const columns = [
    {
      key: 'name',
      title: 'الاسم',
      render: (rep: SalesRepresentativeData) => (
        <div>
          <div className="font-medium">{rep.commercialName}</div>
          <div className="text-sm text-gray-500">{rep.phone}</div>
        </div>
      ),
    },
    {
      key: 'totalStores',
      title: 'إجمالي المتاجر',
      render: (rep: SalesRepresentativeData) => (
        <span className="font-medium">{rep.totalStores}</span>
      ),
    },
    {
      key: 'activeStores',
      title: 'المتاجر النشطة',
      render: (rep: SalesRepresentativeData) => (
        <div>
          <span className="font-medium text-[hsl(var(--secondary))]">
            {rep.activeStores}
          </span>
          <span className="text-sm text-gray-500 mr-1">
            (
            {rep.totalStores > 0
              ? ((rep.activeStores / rep.totalStores) * 100).toFixed(2)
              : 0}
            %)
          </span>
        </div>
      ),
    },
    {
      key: 'totalCommission',
      title: 'إجمالي العمولة',
      render: (rep: SalesRepresentativeData) => (
        <span className="font-semibold text-[hsl(var(--secondary))]">
          {rep.totalCommission} د.أ
        </span>
      ),
    },
    {
      key: 'monthlyCommission',
      title: 'عمولة الشهر',
      render: (rep: SalesRepresentativeData) => (
        <span className="font-medium">
          {rep.monthlyCommission} د.أ
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (item: SalesRepresentativeData) => (
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => {
              setOpenDetails(true)
              setSelectedUser(item)
            }}
            className="text-[hsl(var(--primary))] hover:text-blue-800 cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setOpenForm(true)
              setSelectedUser(item)
            }}
            className="text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]/90 cursor-pointer"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(item)}
            className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110 duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المندوبين</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة جميع المندوبين وتتبع أدائهم
          </p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={() => {
              fetchData();
              OverView();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-300 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {overview?.totalRepresentatives || 0}
              </div>
              <div className="text-sm text-gray-500">إجمالي المندوبين</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-[hsl(var(--secondary))]" />
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {overview?.activeRepresentatives || 0}
              </div>
              <div className="text-sm text-gray-500">المندوبين النشطات</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 text-[hsl(var(--secondary))] font-bold text-lg">د.أ</div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {overview?.totalCommission?.toFixed(2) ||
                  '0.00'}
              </div>
              <div className="text-sm text-gray-500">إجمالي العمولات المدفوعه</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط تسجيل المندوبين الجدد
            </label>
            <div className="flex">
              <input
                type="text"
                value={registrationLink}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 text-sm dir-ltr"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-4 py-2  bg-[hsl(var(--primary))] text-white rounded-l-md hover:[hsl(var(--primary))]/90  cursor-pointer"
              >
                <Copy className="h-4 w-4 ml-1" />
                نسخ
              </button>
            </div>
          </div>
        </div>
      </div>
                  
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-5">
            <button
              onClick={() => setActiveTab(TabType.REPRESENTATIVES)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === TabType.REPRESENTATIVES
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              المندوبين
            </button>
            <button
              onClick={() => setActiveTab(TabType.TAJER_REQUESTS)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === TabType.TAJER_REQUESTS
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              طلبات إضافة تجار
            </button>
            <button
              onClick={() => setActiveTab(TabType.BONUS)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === TabType.BONUS
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              المكافآت
            </button>
          </nav>
        </div>
      </div>
      {/* Content based on active tab */}
      {activeTab === TabType.REPRESENTATIVES ? (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={e => e.preventDefault()} className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="البحث باسم المندوبة..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
              </form>
            </div>
          </div>

          {openForm && selectedUser && (
            <AddUser
              data={{
                id: selectedUser.id,
                commercialName: selectedUser.commercialName,
                phone: selectedUser.phone,
                email: selectedUser.email,
                city: "",
                area: "غير محدد",
                businessType: "supermarket",
                role: "MERCHANT",
                walletBalance: 0,
                isActive: selectedUser.isActive,
                referralCode: selectedUser.referralCode || "",
              }}
              onclose={() => setOpenForm(false)}
            />
          )}
          {OpenDetails && selectedUser && <UserDetails merchantId={selectedUser.id} onClose={() => setOpenDetails(false)} />}

          {/* Representatives Table */}
          <div className="bg-white rounded-lg shadow">
            <DataTable
              data={data || []}
              columns={columns}
              loading={loading}
              pagination={{
                currentPage,
                pageSize,
                totalItems: totalItems,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size: number) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
              }}
            />
          </div>
        </>
      ) : activeTab === TabType.TAJER_REQUESTS ? (
        <TajerRequestsTable />
      ) : (
        <BonusManagement />
      )}
    </div>
  );
};

export default RepresentativeManagement;