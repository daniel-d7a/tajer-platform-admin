"use client";

import DataTable from "@/components/Common/DataTable";
import Modal from "@/components/Common/Modal";
import ProductForm from "@/components/products/ProductFormModal";
import type { GetCategory as Category } from "@/types/category";
import type { GetProduct as Product } from "@/types/product";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FeaturedProduct {
  id: number;
  product: Product;
}

interface Pagination {
  last_page: number;
  per_page: number;
  page: number;
  total: number;
}

export default function FeaturedProducts() {
  const [data, setData] = useState<FeaturedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<Product | Category | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "add">("featured");
  const [searchProducts, setSearchProducts] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [productsPagination, setProductsPagination] = useState<Pagination>({
    last_page: 1,
    per_page: 25,
    page: 1,
    total: 0,
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/featured/featured-products",
        { credentials: "include" }
      );
      const json = await res.json();
      setData(json || []);
    } catch (err) {
      setError(err);
      toast.error("فشل في تحميل المنتجات المميزة");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async (
    page: number = 1,
    limit: number = itemsPerPage,
    search: string = ""
  ) => {
    try {
      setLoadingProducts(true);
      const url = `https://tajer-platform-api.eyadabdou862.workers.dev/api/public/products?categoryId=&factoryId=&search=${search}&page=${page}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();

      if (json.data) {
        setAllProducts(json.data);
        setProductsPagination(
          json.meta || {
            last_page: 1,
            per_page: limit,
            page: page,
            total: json.data.length,
          }
        );
      }
    } catch (err) {
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "add") {
      const timeoutId = setTimeout(() => {
        fetchAllProducts(1, itemsPerPage, searchProducts);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchProducts, activeTab, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAllProducts(page, itemsPerPage, searchProducts);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    fetchAllProducts(1, limit, searchProducts);
  };

  const handleOpenModal = (item: Product | Category | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddFeatured = async (product: Product) => {
    try {
      const res = await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/featured/featured-products",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            position: null,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("فشل في إضافة المنتج");
      }

      toast.success("تم إضافة المنتج إلى المنتجات المميزة بنجاح!");
      fetchFeaturedProducts();

      if (activeTab === "add") {
        fetchAllProducts(currentPage, itemsPerPage, searchProducts);
      }
    } catch (err) {
      toast.error("فشل في إضافة المنتج إلى المميزة");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "هل انت متأكد من أنك تريد حذف هذا العنصر من المنتجات المميزة؟"
      )
    ) {
      setLoadingDelete(true);
      try {
        const res = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/featured/featured-products/${id}`,
          {
            credentials: "include",
            method: "DELETE",
          }
        );

        if (!res.ok) {
          throw new Error("فشل في حذف المنتج");
        }

        toast.success("تم حذف المنتج من المنتجات المميزة بنجاح!");
        fetchFeaturedProducts();
      } catch {
        toast.error("حدث خطأ أثناء الحذف");
      } finally {
        setLoadingDelete(false);
      }
    }
  };

  const handleSuccess = () => {
    toast.success("تمت العملية بنجاح");
    handleCloseModal();
    if (activeTab === "featured") {
      fetchFeaturedProducts();
    }
  };

  const featuredColumns = [
    { key: "id", title: "ID" },
    {
      key: "imageUrl",
      title: "الصورة",
      render: (item: FeaturedProduct) =>
        item.product?.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product?.name}
            className="h-20 min-w-30 object-contain rounded-md border"
          />
        ) : (
          "-"
        ),
    },
    {
      key: "name",
      title: "اسم المنتج",
      render: (item: FeaturedProduct) => item.product?.name || "-",
    },
    {
      key: "piecePrice",
      title: "السعر",
      render: (item: FeaturedProduct) =>
        item.product?.piecePrice
          ? `${item.product.piecePrice.toFixed(2)} د.أ`
          : "-",
    },
    {
      key: "barcode",
      title: "الباركود",
      render: (item: FeaturedProduct) => item.product?.barcode || "-",
    },
    {
      key: "unitType",
      title: "الوحدة",
      render: (item: FeaturedProduct) => {
        const unitType = item.product?.unitType;
        if (unitType === "piece_only") return "قطعة";
        if (unitType === "pack_only") return "حزمة";
        if (unitType === "piece_or_pack") return "قطعة و حزمة";
        return unitType || "-";
      },
    },
    {
      key: "minOrderQuantity",
      title: "الحد الأدنى للطلب",
      render: (item: FeaturedProduct) => item.product?.minOrderQuantity || "-",
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (item: FeaturedProduct) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleOpenModal(item.product)}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer hover:scale-110 duration-150"
            title="تعديل"
            type="button"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-600 cursor-pointer hover:text-red-800 flex items-center gap-1"
            disabled={loadingDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Check if product is already featured
  const isProductFeatured = (productId: number) => {
    return data.some((item) => item.product?.id === productId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          إدارة المنتجات المميزة
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          تحكم في جميع المنتجات المميزة المعروضة على المنصة الرئيسية
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8 space-x-reverse"
          aria-label="Tabs"
        >
          <button
            onClick={() => setActiveTab("featured")}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === "featured"
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            type="button"
          >
            المنتجات المميزة ({data.length})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === "add"
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            type="button"
          >
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة منتج مميز
          </button>
        </nav>
      </div>

      {activeTab === "featured" && (
        <div className="bg-white shadow rounded-lg p-4">
          <DataTable
            data={data}
            columns={featuredColumns}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {activeTab === "add" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              اختر منتج لإضافته إلى المميزة
            </h3>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن منتج بالاسم أو الباركود..."
                value={searchProducts}
                onChange={(e) => setSearchProducts(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-500 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              />
            </div>

            {loadingProducts && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
              </div>
            )}

            {!loadingProducts && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {allProducts.map((product) => {
                    const isFeatured = isProductFeatured(product.id);
                    return (
                      <div
                        key={product.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-32 object-contain mb-3 rounded-md"
                          />
                        )}
                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-1">
                          السعر: {product.piecePrice?.toFixed(2)} د.أ
                        </p>
                        <p className="text-gray-600 text-sm mb-1">
                          الباركود: {product.barcode || "لا يوجد"}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">
                          الوحدة:{" "}
                          {product.unitType === "piece_only"
                            ? "قطعة"
                            : product.unitType === "pack_only"
                            ? "حزمة"
                            : product.unitType === "piece_or_pack"
                            ? "قطعة و حزمة"
                            : product.unitType}
                        </p>
                        <button
                          onClick={() => handleAddFeatured(product)}
                          disabled={isFeatured}
                          className={`w-full inline-flex items-center justify-center px-3 py-2 rounded-md cursor-pointer text-sm ${
                            isFeatured
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                          }`}
                          type="button"
                        >
                          <PlusCircle className="h-4 w-4 ml-1" />
                          {isFeatured ? "مضاف بالفعل" : "إضافة إلى المميزة"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {productsPagination.last_page > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>العناصر في الصفحة:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) =>
                          handleItemsPerPageChange(Number(e.target.value))
                        }
                        className="border rounded px-2 py-1 cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>إجمالي العناصر: {productsPagination.total}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: Math.min(5, productsPagination.last_page) },
                          (_, i) => {
                            let pageNum;
                            if (productsPagination.last_page <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              currentPage >=
                              productsPagination.last_page - 2
                            ) {
                              pageNum = productsPagination.last_page - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[hsl(var(--primary))] text-white"
                                    : "border hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === productsPagination.last_page}
                        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-sm text-gray-600">
                      الصفحة {currentPage} من {productsPagination.last_page}
                    </div>
                  </div>
                )}

                {allProducts.length === 0 && !loadingProducts && (
                  <div className="text-center py-8 text-gray-500">
                    {searchProducts
                      ? "لا توجد منتجات مطابقة للبحث"
                      : "لا توجد منتجات متاحة"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "تعديل منتج" : "إضافة منتج جديد"}
      >
        {isModalOpen && (
          <ProductForm
            product={editingItem as Product | null}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </div>
  );
}
