'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, RefreshCw, DollarSign, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/Common/DataTable';
import type { GetUser as Store } from '../types/user';
import AddUsersForm from  '@/components/Users/AddUsersForm';
import UserDetails from '@/components/Users/userDetails';

interface StoreFilters {
  specialty?: string;
  region?: string;
  status?: string;
}

interface User {
  id: number;
  commercialName: string;
  phone: string;
  email: string;
  city: string;
  businessType: string;
  area: string;
  role: string;
  walletBalance: number;
  isActive: boolean;
  referralCode: string;
}

const StoreManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StoreFilters>({});
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [realData, setRealData] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [openEditeUser, setOpenEditeUser] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const buildApiUrl = () => {
    const baseUrl = 'https://tajer-backend.tajerplatform.workers.dev/api/admin/merchants';
    const params = new URLSearchParams();
    
    if (filters.region && filters.region !== '') {
      params.append('region', filters.region);
    }
    if (filters.specialty && filters.specialty !== '') {
      params.append('specialty', filters.specialty);
    }
    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }
    
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl();
      const response = await fetch(url, { credentials: 'include' });
      const res = await response.json();
      
      if (res.meta) {
        setTotalItems(res.meta.total || 0);
        setCurrentPage(res.meta.page || currentPage);
        setPageSize(res.meta.limit || pageSize);
      }
      
      setRealData(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      toast.error('حدث خطأ في تحميل البيانات');
    }
  };

  const handleDeleteUser = async (item: Store) => {
    if (window.confirm(`هل انت متاكد من انك تريد حقا حذف هذا المستخدم ${item.commercialName}`)) {
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize, searchTerm]);

  const handleAddBalance = async () => {
    try {
      const response = await fetch('https://tajer-backend.tajerplatform.workers.dev/api/cashback/cashback/manual', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchantId: selectedStore?.id,
          amount: Number(value)
        })
      });
      
      if (response.ok) {
        toast.success('تمت اضافه الرصيد بنجاح للحساب');
        setShowBalanceModal(false);
        setValue(0);
        fetchData();
      } else {
        toast.error('فشل في إضافة الرصيد');
      }
    } catch {
      toast.error('حدث خطأ في إضافة الرصيد');
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'commercialName',
      title: 'اسم المتجر',
      render: (store: Store) => (
        <div>
          <div className="font-medium">{store.commercialName}</div>
          <div className="text-sm text-gray-500">{store.phone}</div>
        </div>
      ),
    },
    {
      key: 'businessType',
      title: 'التخصص',
      render: (store: Store) => {
        const businessTypeMap: { [key: string]: string } = {
          'shop': 'متجر',
          'restaurant': 'مطعم',
          'supermarket': 'سوبر ماركت',
          'roastery': 'محمصة',
          'sweets shop': 'محل حلويات',
          'coffee shop': 'محل قهوة',
          'cafe': 'قهوة',
          'library': 'مكتبة',
          'other': 'أخرى'
        };
        
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[hsl(var(--primary-10))] text-[hsl(var(--primary))]">
            {businessTypeMap[store.businessType] || store.businessType}
          </span>
        );
      },
    },
    {
      key: 'city',
      title: 'المدينة',
      render: (store: Store) => {
        const cityMap: { [key: string]: string } = {
          'amman': 'عمان',
          'zarqa': 'الزرقاء', 
          'irbid': 'إربد',
          'russeifa': 'الرصيفة',
          'aqaba': 'العقبة',
          'salt': 'السلط',
          'Madaba': 'مادبا',
          'jerash': 'جرش',
          'ajloun': 'عجلون',
          'karak': 'الكرك',
          'tafilah': 'الطفيلة',
          'maan': 'معان'
        };
        
        return <span>{cityMap[store.city] || store.city}</span>;
      },
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (store: Store) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            store.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {store.isActive ? 'نشط' : 'غير نشط'}
        </span>
      ),
    },
    {
      key: 'walletBalance',
      title: 'الرصيد',
      render: (store: Store) => (
        <span
          className={`font-semibold ${
            store.walletBalance && store.walletBalance >= 0
              ? 'text-[hsl(var(--secondary))]'
              : 'text-red-600'
          }`}
        >
          {(store.walletBalance || 0).toFixed(2)} د.أ
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (store: Store) => (
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => {
              setSelectedStore(store);
              setOpen(true);
            }}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer"
            title="عرض التفاصيل"
            type="button"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStore(store);
              setOpenEditeUser(true);
            }}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer"
            title="تعديل بيانات التاجر"
            type="button"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStore(store);
              setShowBalanceModal(true);
            }}
            className="text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]/90 cursor-pointer"
            title="إضافة رصيد"
            type="button"
          >
            <DollarSign className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(store)}
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المتاجر</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة جميع المتاجر المسجلة في المنصة
          </p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            type="button"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form
            onSubmit={e => e.preventDefault()}
            className="flex-1"
            autoComplete="off"
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث باسم المتجر..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              />
            </div>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            type="button"
          >
            <Filter className="h-4 w-4 ml-2" />
            فلترة
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.specialty || ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    specialty: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              >
                <option value="">جميع التخصصات</option>
                <option value="shop">متجر</option>
                <option value="restaurant">مطعم</option>
                <option value="supermarket">سوبر ماركت</option>
                <option value="roastery">محمصه</option>
                <option value="sweets shop">محل حلويات</option>
                <option value="coffee shop">محل قهوه</option>
                <option value="cafe">قاهيه</option>
                <option value="library">مكتبه</option>
                <option value="other">أخري</option>
              </select>
              <select
                value={filters.region || ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    region: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              >
                <option value="">جميع المناطق</option>
                <option value="amman">عمان</option>
                <option value="zarqa">الزرقاء</option>
                <option value="irbid">إربد</option>
                <option value="russeifa">الرصيفة</option>
                <option value="aqaba">العقبة</option>
                <option value="salt">السلط</option>
                <option value="Madaba">مادبا</option>
                <option value="jerash">جرش</option>
                <option value="ajloun">عجلون</option>
                <option value="karak">الكرك</option>
                <option value="tafilah">الطفيلة</option>
                <option value="maan">معان</option>
              </select>
              <select
                value={filters.status || ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    status: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer border-2 rounded-md hover:bg-gray-200 duration-300"
                type="button"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={realData} 
          columns={columns}
          loading={loading}
          error={null}
          pagination={{
            currentPage,
            pageSize,
            totalItems: totalItems,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* Details Modal */}
      {open && selectedStore && (
        <UserDetails
          merchantId={selectedStore.id}
          onClose={() => setOpen(false)}
        />
      )}
      
      {openEditeUser && selectedStore && (
        <AddUsersForm 
          onSuccess={() =>{
            fetchData()
          }}
          data={selectedStore as unknown as User} 
          onclose={() => setOpenEditeUser(false)} 
        />
      )}
      
      {/* Add Balance Modal */}
      {showBalanceModal && selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                إضافة رصيد - {selectedStore.commercialName}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المبلغ (د.أ)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div className="flex space-x-3 space-x-reverse pt-2 gap-2">
                  <button
                    onClick={handleAddBalance}
                    className="flex-1 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))] disabled:opacity-50 cursor-pointer"
                  >
                    إضافة رصيد
                  </button>
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      setSelectedStore(null);
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
    </div>
  );
};
export default StoreManagement;