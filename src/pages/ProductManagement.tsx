import React, { useState, useEffect } from "react";
import { Package, Tag, PlusCircle, Edit, Trash2, Search } from "lucide-react";
import DataTable from "../components/Common/DataTable";
import Modal from "../components/Common/Modal";
import ProductForm from "../components/products/ProductFormModal";
import CategoryForm from "../components/products/CategoryForm";
import type { GetProduct as Product } from "@/types/product";
import type { GetCategory as Category } from "@/types/category";
import CategoryTreeDisplay from "../components/products/CategoryTreeDisplay";
import toast from "react-hot-toast";

interface Factory {
  id: number;
  name: string;
}

interface ApiResponse {
  data: Product[];
  meta: {
    last_page: number;
    per_page: number;
    page: number;
    total: number;
  };
}

interface CategoriesResponse {
  data: Category[];
}

const ProductManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [search, setSearch] = useState("");
  const [searchCategories, setSearchCategories] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  const [factories, setFactories] = useState<Record<number, string>>({});

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/public/products?categoryId=&search=${search}&page=${currentPage}&limit=${pageSize}`,
        { credentials: "include" }
      );
      
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      
      const res: ApiResponse = await response.json();
      setProducts(res.data || []);
      
      // Set pagination data
      if (res.meta) {
        setTotalItems(res.meta.total || 0);
        setCurrentPage(res.meta.page || currentPage);
      }
      
      // Fetch factory names
      const factoryIds: number[] = Array.from(
        new Set(res.data.map((p: Product) => p.factoryId).filter(Boolean) as number[])
      );
      
      const factoriesMap: Record<number, string> = {};
      await Promise.all(
        factoryIds.map(async (id: number) => {
          if (!factories[id]) {
            try {
              const factoryRes = await fetch(
                `https://tajer-backend.tajerplatform.workers.dev/api/admin/factories/${id}`,
                { credentials: "include" }
              );
              const factoryData: Factory = await factoryRes.json();
              factoriesMap[id] = factoryData.name;
            } catch {
              factoriesMap[id] = "غير معروف";
            }
          }
        })
      );
      setFactories((prev) => ({ ...prev, ...factoriesMap }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, currentPage, pageSize]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const res = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/public/categories?limit=&page=&search=${searchCategories}`,
        { credentials: "include" }
      );
      const data: CategoriesResponse = await res.json();
      if (Array.isArray(data?.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("فشل تحميل التصنيفات", err);
      toast.error("فشل في تحميل التصنيفات");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchCategories]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, searchCategories]);

  const handleDelete = async (item: Product | Category): Promise<void> => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا العنصر ؟ " + item.name)) {
      setLoadingDelete(true);
      const toastId = toast.loading("جاري الحذف ...");

      try {
        const isProduct = 'piecePrice' in item;
        const url = isProduct
          ? `https://tajer-backend.tajerplatform.workers.dev/api/admin/products/${item.id}`
          : `https://tajer-backend.tajerplatform.workers.dev/api/admin/categories/${item.id}`;
        
        const res = await fetch(url, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (res.ok) {
          toast.success("تم حذف العنصر بنجاح", { id: toastId });
          if (isProduct) {
            fetchProducts();
          } else {
            fetchCategories();
          }
        } else {
          toast.error("حدث خطأ أثناء الحذف ربما هو موجود في طلب ما", { id: toastId });
        }
      } catch (error) {
        toast.error("حدث خطأ في الاتصال", { id: toastId });
      } finally {
        setLoadingDelete(false);
      }
    }
  };

  const handleOpenModal = (item: Product | Category | null = null): void => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSuccess = (): void => {
    toast.success("تمت العمليه بنجاح");
    fetchProducts();
    fetchCategories();
    handleCloseModal();
  };

  const productColumns = [
    { key: "name", title: "اسم المنتج" },
    {
      key: "imageUrl",
      title: "الصوره",
      render: (item: Product) => (
        <img
          src={item.imageUrl ?? ""}
          alt={item.name}
          className="w-20 h-12 object-cover rounded-md border"
        />
      ),
    },
    {
      key: "categories",
      title: "تصنيف العنصر",
      render: (item: Product) =>
        item.categories && item.categories.length > 0
          ? item.categories.map((c) => c.name ?? "بدون اسم").join(", ")
          : "لا يوجد تصنيفات",
    },
    {
      key: "unitType",
      title: "نوع الوحده",
      render: (item: Product) =>
        item.unitType === "piece_only"
          ? "قطعة"
          : item.unitType === "pack_only"
            ? "حزمة"
            : "قطعة و حزمة",
    },
    { 
      key: "discountAmount", 
      title: "نسبه الخصم",
      render: (item: Product) => item.discountAmount?.toString() || "0"
    },
    {
      key: "discountType",
      title: "نوع الخصم",
      render: (item: Product) =>
        item.discountType === "percentage"
          ? "نسبه مئويه"
          : item.discountType === "fixed_amount"
            ? "مبلغ ثابت"
            : "لا يوجد نوع خصم",
    },
    {
      key: "barcode",
      title: "الباركود",
      render: (item: Product) => `${item.barcode ?? "لا يوجد كود معرف"}`,
    },
    {
      key: "manufacturer",
      title: "المصنع",
      render: (item: Product) => factories[item.factoryId] ?? "جاري التحميل...",
    },
    {
      key: "price",
      title: "السعر",
      render: (item: Product) => `${item.piecePrice?.toFixed(2) ?? "0.00"} د.أ`,
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (item: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenModal(item)}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer hover:scale-110 duration-150"
            title="تعديل"
            type="button"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110 duration-150"
            title="حذف"
            type="button"
            disabled={loadingDelete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            إدارة المنتجات والتصنيفات
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            إضافة وتعديل المنتجات والتصنيفات في المنصة.
          </p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === "products"
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              type="button"
            >
              <Package className="ml-2 h-5 w-5" />
              المنتجات
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === "categories"
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              type="button"
            >
              <Tag className="ml-2 h-5 w-5" />
              التصنيفات
            </button>
          </nav>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder={`البحث باسم ${activeTab === "products" ? "المنتج" : "التصنيف"}...`}
            value={activeTab === "products" ? search : searchCategories}
            onChange={(e) =>
              activeTab === "products"
                ? setSearch(e.target.value)
                : setSearchCategories(e.target.value)
            }
            className="w-full pr-10 pl-4 py-2 border border-gray-500 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
          />
        </div>

        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">قائمة المنتجات</h3>
              <button
                onClick={() => handleOpenModal(null)}
                className="inline-flex items-center px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer"
                type="button"
              >
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة منتج جديد
              </button>
            </div>
            
            <DataTable
              data={products}
              columns={productColumns}
              loading={loading}
              error={null}
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
        )}

        {activeTab === "categories" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">قائمة التصنيفات</h3>
              <button
                onClick={() => handleOpenModal(null)}
                className="inline-flex items-center px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer"
                type="button"
              >
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة تصنيف جديد
              </button>
            </div>
            <div className="p-4">
              <CategoryTreeDisplay
                categories={categories}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          activeTab === "products"
            ? editingItem
              ? "تعديل منتج"
              : "إضافة منتج جديد"
            : editingItem
              ? "تعديل تصنيف"
              : "إضافة تصنيف جديد"
        }
      >
        {isModalOpen &&
          (activeTab === "products" ? (
            <ProductForm
              product={editingItem as Product | null}
              onSuccess={handleSuccess}
            />
          ) : (
            <CategoryForm
              category={editingItem as Category | null}
              onSuccess={handleSuccess}
            />
          ))}
      </Modal>
    </>
  );
};

export default ProductManagement;