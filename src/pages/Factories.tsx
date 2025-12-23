"use client";

import DataTable from "@/components/Common/DataTable";
import FactoryUpdate from "@/components/factory/FactoryUpdate";
import FactoryDetials from "@/components/factory/factoryDetials";
import { Edit, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Factory {
  id: number;
  name: string;
  name_ar: string;
  imageUrl: string;
  discountAmount: number;
  discountType: string;
}

interface ApiResponse {
  data: Factory[];
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

export default function Factories() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpenDetais, setIsOpenDetais] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (factory: Factory) => {
    if (window.confirm("هل تريد حذف هذا المصنع؟")) {
      try {
        const res = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factories/${factory.id}`,
          {
            credentials: "include",
            method: "DELETE",
          }
        );

        if (res.ok) {
          toast.success("تم حذف المصنع بنجاح");
          fetchData();
        } else {
          toast.error(
            "فشل الحذف يرجي المحاوله في وقت لاحق تاكد من ان هذا المصنع لا يحتوي علي منتجات"
          );
        }
      } catch {
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factories?page=${currentPage}&limit=${pageSize}&search=${searchTerm}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("فشل في جلب البيانات");
      }

      const data: ApiResponse = await response.json();

      setFactories(data.data);
      setTotalItems(data.meta.total || 0);
      setCurrentPage(data.meta.page || currentPage);
      // تم حذف setPageSize هنا
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(errorMessage);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm]);

  const handleOpenUpdate = (factory: Factory | null) => {
    setSelectedFactory(factory);
    setIsOpenUpdate(true);
  };

  const handleCloseDetails = () => {
    setIsOpenDetais(false);
    setSelectedFactory(null);
  };

  const handleCloseUpdate = () => {
    setIsOpenUpdate(false);
    setSelectedFactory(null);
    fetchData();
  };

  const columns = [
    {
      key: "id",
      title: "رقم المصنع",
    },
    {
      key: "imageUrl",
      title: "صورة المصنع",
      render: (item: Factory) => (
        <img
          src={item.imageUrl}
          className="w-20 h-20 rounded-lg object-cover"
          alt={item.name_ar}
        />
      ),
    },
    {
      key: "name_ar",
      title: "اسم المصنع (بالعربي)",
    },
    {
      key: "name",
      title: "اسم المصنع (بالانجليزي)",
    },
    {
      key: "discountType",
      title: "نوع الخصم",
      render: (item: Factory) => (
        <span className="font-medium">
          {item.discountType === "percentage"
            ? "نسبة مئوية"
            : item.discountType === "fixed_amount"
            ? "مبلغ ثابت"
            : item.discountType}
        </span>
      ),
    },
    {
      key: "discountAmount",
      title: "قيمة الخصم",
      render: (item: Factory) => (
        <span className="font-semibold text-[hsl(var(--secondary))]">
          {item.discountType === "percentage"
            ? `${item.discountAmount}%`
            : `${item.discountAmount} د.أ`}
        </span>
      ),
    },
    {
      key: "actions",
      title: "الخيارات",
      render: (item: Factory) => (
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => handleOpenUpdate(item)}
            className="text-[hsl(var(--primary))] cursor-pointer hover:text-[hsl(var(--primary))]/90 transition-colors"
            title="تعديل المصنع"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-800 cursor-pointer transition-colors hover:scale-110 duration-150"
            title="حذف المصنع"
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          إدارة المصانع في المتجر
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة المصانع وتعديلها في المنصة
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-[80%]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="البحث باسم المصنع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
          />
        </div>
        <button
          className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer flex items-center transition-colors"
          onClick={() => handleOpenUpdate(null)}
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة مصنع جديد
        </button>
      </div>

      {/* Modals */}
      {isOpenDetais && selectedFactory && (
        <FactoryDetials
          factory={selectedFactory}
          onClose={handleCloseDetails}
        />
      )}

      {isOpenUpdate && (
        <FactoryUpdate factory={selectedFactory} onClose={handleCloseUpdate} />
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={factories}
          columns={columns}
          loading={loading}
          error={error}
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
    </div>
  );
}
