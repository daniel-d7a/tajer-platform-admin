"use client";

import DataTable from "@/components/Common/DataTable";
import CashBackEdit from "@/components/cashback/EditecashBack";
import CashBackDetails from "@/components/cashback/cashBackDetails";
import { Calendar, Edit, Eye, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
interface Category {
  id: number;
  name: string;
  name_ar: string;
  parentId: number | null;
  imageUrl: string | null;
  image_public_id: string | null;
}

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  piecePrice: number;
  barcode: string;
  minOrderQuantity: number;
  name_ar: string;
}

interface CashbackCampaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  type?: "percentage" | "fixed_amount";
  value: number;
  minOrderValue: number;

  products: Product[];
  categories: Category[];
}

export default function CashBack() {
  const [data, setData] = useState<CashbackCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCashBack, setSelectedCashBack] =
    useState<CashbackCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [OpencashBackDetails, setOpenCashBackDetails] = useState(false);
  const [OpencashBackEdite, setOpenCashBackEdite] = useState(false);
  const handleDelete = async (item: CashbackCampaign) => {
    if (window.confirm("هل ترغب حقا في حذف " + item.name)) {
      try {
        const data = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/cashback/cashback/campaigns/${item.id}`,
          {
            credentials: "include",
            method: "DELETE",
          }
        );
        if (!data.ok) {
          toast.error("فشل في حذف الحملة ربما قام شخص ما بطلب هذا العرض");
        } else {
          toast.success("تم حذف الحملة بنجاح");
        }
      } catch {
        toast.error("فشل في حذف الحملة");
      }
    }
  };
  const cashBack = async (): Promise<void> => {
    try {
      setLoading(true);
      const FetchData = await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/cashback/cashback/campaigns",
        { credentials: "include" }
      );
      if (!FetchData.ok) throw new Error("فشل في تحميل البيانات");
      const res: CashbackCampaign[] = await FetchData.json();
      setData(Array.isArray(res) ? res : [res]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cashBack();
  }, []);
  const columns = [
    { key: "id", title: "ID" },
    { key: "name", title: "الاسم" },
    {
      key: "startDate",
      title: "تاريخ البداية",
      render: (item: CashbackCampaign) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(item.startDate).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "endDate",
      title: "تاريخ النهاية",
      render: (item: CashbackCampaign) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(item.endDate).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      title: "النوع",
      render: (item: CashbackCampaign) => {
        const typeMap: { [key: string]: string } = {
          percentage: "نسبة مئوية",
          fixed_amount: "مبلغ ثابت",
        };
        return typeMap[item.type || ""] || item.type;
      },
    },
    {
      key: "value",
      title: "القيمة",
      render: (item: CashbackCampaign) => {
        if (item.type === "percentage") {
          return `${item.value}%`;
        } else {
          return `${item.value} د.أ`;
        }
      },
    },
    {
      key: "products",
      title: "المنتجات",
      render: (item: CashbackCampaign) => {
        if (item.products.length === 0) return "لا يوجد منتجات";

        const productNames = item.products.map((p) => p.name || p.name_ar);
        const displayText = productNames.join(", ");

        return (
          <span className="truncate w-30 block" title={displayText}>
            {productNames.length <= 2
              ? displayText
              : `${productNames.slice(0, 2).join(", ")} ...+${
                  productNames.length - 2
                }`}
          </span>
        );
      },
    },
    {
      key: "categories",
      title: "التصنيفات",
      render: (item: CashbackCampaign) => {
        if (item.categories.length === 0) return "لا يوجد تصنيفات";

        const categoryNames = item.categories.map((c) => c.name_ar || c.name);
        const displayText = categoryNames.join(", ");

        return (
          <span className="truncate w-30 block" title={displayText}>
            {categoryNames.length <= 2
              ? displayText
              : `${categoryNames.slice(0, 2).join(", ")} ...+${
                  categoryNames.length - 2
                }`}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (item: CashbackCampaign) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setOpenCashBackDetails(true);
              setSelectedCashBack(item);
            }}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer hover:scale-110 duration-150 p-1 rounded"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setOpenCashBackEdite(true);
              setSelectedCashBack(item);
            }}
            className="text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]/90 cursor-pointer hover:scale-110 duration-150 p-1 rounded"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110 duration-150 p-1 rounded"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          إدارة الكاشباك في المنصة
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          إداره الكاشباك قم بإنشاء حملات كاش باك من هنا !
        </p>
      </div>
      <div className="w-full flex justify-end gap-2 mb-4">
        <button
          className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer flex items-center"
          onClick={() => {
            setOpenCashBackEdite(true);
            setSelectedCashBack(null);
          }}
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافه حمله جديد
        </button>
      </div>
      {OpencashBackDetails && selectedCashBack && (
        <CashBackDetails
          items={selectedCashBack}
          onClose={() => setOpenCashBackDetails(false)}
        />
      )}
      {OpencashBackEdite && (
        <CashBackEdit
          onSuccess={() => {
            toast.success("تم تحديث العرض بنجاح !");
            cashBack();
          }}
          items={selectedCashBack}
          onClose={() => setOpenCashBackEdite(false)}
        />
      )}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        error={error}
      />
    </div>
  );
}
