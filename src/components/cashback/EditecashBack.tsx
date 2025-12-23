"use client";

import { useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  piecePrice: number;
  barcode:string;
  minOrderQuantity:number;
  name_ar:string;
}

interface Category {
  id: number;
  name: string;
  name_ar: string;
  parentId: number | null;
  imageUrl: string | null;
  image_public_id: string | null;
}


interface CashBackItem {
  id: number;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  type?: "percentage" | "fixed_amount";
  value?: number;
  minOrderValue?: number;
  products?: Product[];
  categories?: Category[];
}

interface CashBackEditProps {
  items: CashBackItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}


interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue: number;
  productIds: number[];
  categoryIds: number[]; 
}

export default function CashBackEdit({
  items,
  onClose,
  onSuccess,
}: CashBackEditProps) {
  const [type,setType] = useState('')
  const [productsChoose, setProductsChoose] = useState<Product[]>(items?.products ?? []);
  const [productsIds, setProductsIDS] = useState<number[]>(items?.products?.map((p) => p.id) ?? []);
  const [categoriesChoose, setCategoriesChoose] = useState<Category[]>(items?.categories ?? []);
  const [categoriesIds, setCategoriesIDS] = useState<number[]>(items?.categories?.map((c) => c.id) ?? []);
  const [formData, setFormData] = useState<FormData>({
    name: items?.name ?? "",
    description: items?.description ?? "",
    startDate: items?.startDate?.split("T")[0] ?? "",
    endDate: items?.endDate?.split("T")[0] ?? "",
    type: items?.type ?? "percentage",
    value: items?.value ?? 100,
    minOrderValue: items?.minOrderValue ?? 1,
    productIds: items?.products?.map((p) => p.id) ?? [],
    categoryIds: items?.categories?.map((c) => c.id) ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [searchProducts, setSearchProducts] = useState("");
  const [searchCategories, setSearchCategories] = useState("");
  const [isOpenProducts, setIsOpenProducts] = useState(false);
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, productIds: productsIds, categoryIds: categoriesIds }));
  }, [productsIds, categoriesIds]);

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/public/all_products?categoryId=&search=${searchProducts}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setProductsData(data as Product[]);
    } catch (err) {
      console.error("حصل خطأ في جلب المنتجات", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/public/all_categories?search=${searchCategories}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setCategoriesData(data as Category[]);
      } else {
        toast.error("حصل خطأ أثناء جلب التصنيفات");
      }
    } catch {
      toast.error("حصل خطأ أثناء جلب التصنيفات");
    } finally {
      setLoadingCategories(false);
    }
  };
 useEffect(() => {
  if (items && items.id) {
    setType("تعديل");
  } else {
    setType("إنشاء");
  }
}, [items]);
  useEffect(() => {
    handleFetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchProducts]);

  useEffect(() => {
    handleFetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCategories]);

  const handleFilterProduct = (id: number) => {
    setProductsChoose((prev) => prev.filter((p) => p.id !== id));
    setProductsIDS((prev) => prev.filter((pid) => pid !== id));
  };

  const handleFilterCategory = (id: number) => {
    setCategoriesChoose((prev) => prev.filter((c) => c.id !== id));
    setCategoriesIDS((prev) => prev.filter((cid) => cid !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    if(items && items.id) {
  try {
    
      const res = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/cashback/cashback/campaigns/${items.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        toast.success(`تم ${type} الحملة بنجاح `);
        onSuccess?.();
        onClose();
      } else {
        const errorData = await res.json();
        toast.error("فشل التعديل");
        console.error("خطأ:", errorData);
      }
    } catch (err) {
      toast.error("حصل خطأ أثناء الحفظ");
      console.error("حصل خطأ", err);
    } finally {
      setLoading(false);
    }
    }else{
        try {
    
      const res = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/cashback/cashback/campaigns`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        toast.success(`تم ${type} الحملة بنجاح `);
        onSuccess?.();
        onClose();
      } else {
        const errorData = await res.json();
        toast.error("فشل التعديل");
        console.error("خطأ:", errorData);
      }
    } catch (err) {
      toast.error("حصل خطأ أثناء الحفظ");
      console.error("حصل خطأ", err);
    } finally {
      setLoading(false);
    }
    }
  
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col gap-5 relative mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-medium text-gray-900">
            {type} الحملة: {items?.name}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 grid grid-cols-2 gap-4">
          <InputField
            label="اسم العرض"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <InputField
            label="بداية العرض"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />

          <InputField
            label="نهاية العرض"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">
              نوع العرض
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                handleChange("type", e.target.value as "percentage" | "fixed_amount")
              }
              className="border p-2 w-full rounded-md border-gray-500"
            >
              <option value="percentage">عرض نسبي</option>
              <option value="fixed_amount">عرض بقيمة ثابتة</option>
            </select>
          </div>

          <InputField
            label="قيمة العرض"
            type="number"
            value={formData.value}
            onChange={(e) => handleChange("value", Number(e.target.value))}
          />

          <InputField
            label="الحد الأدنى للطلب"
            type="number"
            value={formData.minOrderValue}
            onChange={(e) => handleChange("minOrderValue", Number(e.target.value))}
          />

          <div className="flex flex-col gap-2 col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              تفاصيل العرض
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="border p-2 rounded-md w-full border-gray-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            المنتجات المختارة
          </label>
          {productsChoose.length === 0 ? (
            <p className="text-sm text-center text-gray-500 p-3 border rounded">لا توجد منتجات بعد</p>
          ) : (
            <div className="border rounded p-3 overflow-y-auto space-y-2 max-h-40">
              {productsChoose.map((product) => (
                <div key={product.id} className="flex gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-20 h-15 rounded-md object-cover"
                    />
                    <span>{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>{product.piecePrice.toFixed(2)} د.أ</p>
                    <button
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleFilterProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full">
          <button
            onClick={() => setIsOpenProducts((prev) => !prev)}
            className="border border-gray-500 w-full p-2 rounded-md bg-white flex justify-between items-center"
          >
            <span>اختر منتج</span>
            <span className="text-gray-500">▼</span>
          </button>
          {isOpenProducts && (
            <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchProducts}
                onChange={(e) => setSearchProducts(e.target.value)}
                className="w-full p-2 border-b outline-none rounded-t-lg"
              />

              <div className="max-h-40 overflow-y-auto">
                {loadingProducts ? (
                  <h2 className="text-center p-4">جاري التحميل...</h2>
                ) : productsData.length > 0 ? (
                  productsData.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (!productsIds.includes(opt.id)) {
                          setProductsChoose((prev) => [...prev, opt]);
                          setProductsIDS((prev) => [...prev, opt.id]);
                        }
                        setIsOpenProducts(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          className="w-20 h-15 rounded-md object-cover"
                          src={opt.imageUrl}
                          alt={opt.name}
                        />
                        {opt.name}
                      </div>
                      <p>{opt.piecePrice.toFixed(2)} د.أ</p>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            التصنيفات المختارة
          </label>
          {categoriesChoose.length === 0 ? (
            <p className="text-sm text-center text-gray-500 p-3 border rounded">لا توجد تصنيفات بعد</p>
          ) : (
            <div className="border rounded p-3 overflow-y-auto space-y-2 max-h-40">
              {categoriesChoose.map((category) => (
                <div key={category.id} className="flex gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={category.imageUrl ?? ""}
                      alt={category.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <span>{category.name}</span>
                  </div>
                  <button
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleFilterCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full">
          <button
            onClick={() => setIsOpenCategories((prev) => !prev)}
            className="border border-gray-500 w-full p-2 rounded-md bg-white flex justify-between items-center"
          >
            <span>اختر تصنيف</span>
            <span className="text-gray-500">▼</span>
          </button>
          {isOpenCategories && (
            <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50">
              <input
                type="text"
                placeholder="ابحث عن تصنيف..."
                value={searchCategories}
                onChange={(e) => setSearchCategories(e.target.value)}
                className="w-full p-2 border-b outline-none rounded-t-lg"
              />

              <div className="max-h-40 overflow-y-auto">
                {loadingCategories ? (
                  <h2 className="text-center p-4">جاري التحميل...</h2>
                ) : categoriesData.length > 0 ? (
                  categoriesData.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => {
                        if (!categoriesIds.includes(category.id)) {
                          setCategoriesChoose((prev) => [...prev, category]);
                          setCategoriesIDS((prev) => [...prev, category.id]);
                        }
                        setIsOpenCategories(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <img
                        className="w-12 h-12 rounded-md object-cover"
                        src={category.imageUrl ?? ""}
                        alt={category.name}
                      />
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[hsl(var(--primary))] text-white w-full mt-4 p-2 rounded-md hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 cursor-pointer"
          >

            {loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white w-full mt-4 p-2 rounded-md hover:bg-gray-600 cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function InputField({ label, value, onChange, type = "text" }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="border p-2 rounded-md w-full border-gray-500"
      />
    </div>
  );
}