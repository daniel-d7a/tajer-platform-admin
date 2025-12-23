import type { GetCategory } from "@/types/category";
import { UnitTypeSchema, type GetProduct } from "@/types/product";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageCroper from "../Common/ImageCroper";

interface ProductFormProps {
  product?: GetProduct | null;
  onSuccess: () => void;
}

type ProductFormState = {
  barcode: string;
  name: string;
  description: string;
  description_ar: string;
  unitType: string;
  piecePrice: number | "";
  packPrice: number | "";
  piecesPerPack: number | "";
  factoryId: number;
  imageUrl: string | File | null;
  minOrderQuantity: number | "";
  categoryIds: number[];
  name_ar: string;
  image_public_id: string;
  discountAmount: number | string;
  discountType: string;
};

interface Factory {
  id: number;
  name: string;
  name_ar: string;
  imageUrl: string;
}

type ProductFormErrors = Partial<Record<keyof ProductFormState, string>>;

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
}) => {
  const [searchCategories, setSearchCategories] = useState("");
  const [categoriesData, setCategoriesData] = useState<GetCategory[]>([]);
  const [categoriesChoose, setCategoriesChoose] = useState<GetCategory[]>([]);
  const [factoryData, setFactoryData] = useState<Factory[]>([]);
  const [factoryChoose, setFactoryChoose] = useState<Factory | null>(null);
  const [categoriesIds, setCategoriesIDS] = useState<number[]>(
    product?.categories?.map((c) => c.id) ?? []
  );
  const [factoryId, setFactoryId] = useState<number>(product?.factoryId ?? 0);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFactories, setLoadingFactories] = useState(true);
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [isOpenFactories, setIsOpenFactories] = useState(false);

  // States for image editing

  const handlefetchFactories = async () => {
    try {
      const res = await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factories/all_factories",
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setFactoryData(data);
      } else {
        toast.error("حصل خطأ أثناء جلب الشركات");
      }
    } catch {
      toast.error("حصل خطأ أثناء جلب الشركات");
    } finally {
      setLoadingFactories(false);
    }
  };

  const handleFetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/public/all_categories?search=${searchCategories}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setCategoriesData(data as GetCategory[]);
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
    handleFetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCategories]);

  useEffect(() => {
    handlefetchFactories();
  }, []);

  useEffect(() => {
    setCategoriesIDS(categoriesChoose.map((c) => c.id));
  }, [categoriesChoose]);

  const [form, setForm] = useState<ProductFormState>({
    barcode: product?.barcode ?? "",
    name: product?.name ?? "",
    name_ar: product?.name_ar ?? "",
    description: product?.description ?? "",
    description_ar: product?.description_ar ?? "",
    unitType: product?.unitType ?? "piece_only",
    piecePrice: product?.piecePrice ?? "",
    packPrice: product?.packPrice ?? "",
    piecesPerPack: product?.piecesPerPack ?? "",
    factoryId: product?.factoryId ?? 0,
    imageUrl: product?.imageUrl ?? null,
    minOrderQuantity: product?.minOrderQuantity ?? "",
    categoryIds: product?.categories?.map((c) => c.id) ?? [],
    image_public_id: product?.image_public_id ?? "",
    discountAmount: product?.discountAmount ?? 0,
    discountType: product?.discountType ?? "percentage",
  });

  useEffect(() => {
    if (product?.categories) {
      setCategoriesChoose(product.categories);
    }
  }, [product]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, categoryIds: categoriesIds }));
  }, [categoriesIds]);

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [loading, setLoading] = useState(false);
  const handleSave = (formData: FormData) => {
    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      setForm((prev) => ({
        ...prev,
        imageUrl: imageFile,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!form.name.trim()) newErrors.name = "اسم المنتج مطلوب";
    if (!form.barcode.trim()) newErrors.barcode = "الباركود مطلوب";
    if (!form.unitType) newErrors.unitType = "نوع الوحدة مطلوب";
    if (form.unitType === "piece_only" || form.unitType === "piece_or_pack") {
      if (!form.piecePrice && form.piecePrice !== 0)
        newErrors.piecePrice = "سعر القطعة مطلوب";
    }
    if (form.unitType === "pack_only" || form.unitType === "piece_or_pack") {
      if (!form.packPrice && form.packPrice !== 0)
        newErrors.packPrice = "سعر العبوة مطلوب";
      if (!form.piecesPerPack && form.piecesPerPack !== 0)
        newErrors.piecesPerPack = "عدد القطع في العبوة مطلوب";
    }
    if (!form.description.trim()) newErrors.description = "الوصف مطلوب";
    if (!form.description_ar.trim())
      newErrors.description_ar = "الوصف باللغه العربيه مطلوب";
    if (!form.minOrderQuantity)
      newErrors.minOrderQuantity = "مطلوب الحد الأدنى للطلب ";
    if (!form.categoryIds.length)
      newErrors.categoryIds = "اختر تصنيف واحد على الأقل";
    if (!form.name_ar.length)
      newErrors.name_ar = "اسم المنتج باللغة العربية مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const name = target.name as keyof ProductFormState;
    let value: string | number = target.value;

    if (target instanceof HTMLInputElement && target.type === "number") {
      value = value === "" ? "" : Number(value);
    }

    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleFilterCategory = (id: number) => {
    setCategoriesChoose((prev) => prev.filter((c) => c.id !== id));
    setCategoriesIDS((prev) => prev.filter((cid) => cid !== id));
  };

  const handleFilterFactory = () => {
    setFactoryChoose(null);
    setFactoryId(0);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("يرجى تصحيح الأخطاء");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("name_ar", form.name_ar);
    formData.append("barcode", form.barcode);
    formData.append("unitType", form.unitType);

    if (form.unitType === "piece_only" || form.unitType === "piece_or_pack") {
      formData.append("piecePrice", String(form.piecePrice));
    }

    if (form.unitType === "pack_only" || form.unitType === "piece_or_pack") {
      formData.append("packPrice", String(form.packPrice));
      formData.append("piecesPerPack", String(form.piecesPerPack));
    }

    formData.append("description", form.description);
    formData.append("description_ar", form.description_ar);
    formData.append("factoryId", String(factoryId));
    formData.append("minOrderQuantity", String(form.minOrderQuantity));
    formData.append("discountAmount", String(form.discountAmount));
    formData.append("discountType", form.discountType);

    if (form.imageUrl instanceof File) {
      formData.append("image", form.imageUrl);
    } else if (
      typeof form.imageUrl === "string" &&
      form.imageUrl.trim() !== ""
    ) {
      formData.append("imageUrl", form.imageUrl);
    }

    formData.append(
      "categoryIds",
      JSON.stringify(categoriesChoose.map((c) => c.id))
    );

    try {
      setLoading(true);
      const response = await fetch(
        product
          ? `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/products/${product.id}`
          : "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        toast.error("حدث خطأ في إنشاء المنتج");
      } else {
        toast.success("تمت إضافة المنتج بنجاح!");
        onSuccess();
      }
    } catch {
      toast.error("حدث خطأ في إنشاء المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[550px] overflow-auto p-4">
      {/* Image Editor Modal */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            اسم المنتج
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            اسم المنتج باللغة العربية
          </label>
          <input
            name="name_ar"
            value={form.name_ar}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          />
          {errors.name_ar && (
            <p className="text-red-500 text-xs mt-1">{errors.name_ar}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            مقدار الخصم
          </label>
          <input
            name="discountAmount"
            value={form.discountAmount}
            type="number"
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          />
          {errors.discountAmount && (
            <p className="text-red-500 text-xs mt-1">{errors.discountAmount}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            نوع الخصم
          </label>
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          >
            <option value="percentage">خصم نسبة</option>
            <option value="fixed_amount">خصم سعر ثابت</option>
          </select>
          {errors.discountType && (
            <p className="text-red-500 text-xs mt-1">{errors.discountType}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            الباركود
          </label>
          <input
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          />
          {errors.barcode && (
            <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            نوع الوحدة
          </label>
          <select
            name="unitType"
            value={form.unitType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          >
            {UnitTypeSchema.options.map((type) => (
              <option key={type} value={type}>
                {type === "piece_only" && "قطعة فقط"}
                {type === "pack_only" && "عبوة فقط"}
                {type === "piece_or_pack" && "قطعة أو عبوة"}
              </option>
            ))}
          </select>
          {errors.unitType && (
            <p className="text-red-500 text-xs mt-1">{errors.unitType}</p>
          )}
        </div>
        {(form.unitType === "piece_only" ||
          form.unitType === "piece_or_pack") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              سعر القطعة (د.أ)
            </label>
            <input
              type="number"
              name="piecePrice"
              value={form.piecePrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
            />
            {errors.piecePrice && (
              <p className="text-red-500 text-xs mt-1">{errors.piecePrice}</p>
            )}
          </div>
        )}
        {(form.unitType === "pack_only" ||
          form.unitType === "piece_or_pack") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              سعر العبوة (د.أ)
            </label>
            <input
              type="number"
              name="packPrice"
              value={form.packPrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
            />
            {errors.packPrice && (
              <p className="text-red-500 text-xs mt-1">{errors.packPrice}</p>
            )}
          </div>
        )}
        {(form.unitType === "pack_only" ||
          form.unitType === "piece_or_pack") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              عدد القطع في العبوة
            </label>
            <input
              type="number"
              name="piecesPerPack"
              value={form.piecesPerPack}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
            />
            {errors.piecesPerPack && (
              <p className="text-red-500 text-xs mt-1">
                {errors.piecesPerPack}
              </p>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            اقل عدد للطلب
          </label>
          <input
            name="minOrderQuantity"
            value={form.minOrderQuantity}
            onChange={handleChange}
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
          />
          {errors.minOrderQuantity && (
            <p className="text-red-500 text-xs mt-1">
              {errors.minOrderQuantity}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">الوصف</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          الوصف باللغه العربيه
        </label>
        <textarea
          name="description_ar"
          value={form.description_ar}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-1"
        />
        {errors.description_ar && (
          <p className="text-red-500 text-xs mt-1">{errors.description_ar}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          التصنيفات المختارة
        </label>
        {categoriesChoose.length === 0 ? (
          <p className="text-sm text-center text-gray-500 p-3 border rounded">
            لا توجد تصنيفات بعد
          </p>
        ) : (
          <div className="border rounded p-3 overflow-y-auto space-y-2 max-h-40">
            {categoriesChoose.map((category) => (
              <div
                key={category.id}
                className="flex gap-3 items-center justify-between"
              >
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
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative w-full">
        <button
          onClick={() => setIsOpenCategories((prev) => !prev)}
          className="border border-gray-500 w-full p-1 rounded-md bg-white flex justify-between items-center"
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
              className="w-full p-1 border-b outline-none rounded-t-lg"
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
      <div>
        <label className="block text-sm font-medium text-gray-700">
          المصانع المختارة
        </label>
        {!factoryChoose ? (
          <p className="text-sm text-center text-gray-500 p-3 border rounded">
            لا توجد مصانع بعد
          </p>
        ) : (
          <div className="border rounded p-3 overflow-y-auto space-y-2 max-h-40">
            <div className="flex gap-3 items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={factoryChoose.imageUrl ?? ""}
                  alt={factoryChoose.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <span>{factoryChoose.name}</span>
              </div>
              <button
                onClick={handleFilterFactory}
                className="text-red-500 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="relative w-full">
        <button
          onClick={() => setIsOpenFactories((prev) => !prev)}
          className="border border-gray-500 w-full p-1 rounded-md bg-white flex justify-between items-center"
        >
          <span>اختر مصنع</span>
          <span className="text-gray-500">▼</span>
        </button>
        {isOpenFactories && (
          <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50">
            <div className="max-h-40 overflow-y-auto">
              {loadingFactories ? (
                <h2 className="text-center p-4">جاري التحميل...</h2>
              ) : factoryData.length > 0 ? (
                factoryData.map((factory) => (
                  <div
                    key={factory.id}
                    onClick={() => {
                      setFactoryChoose(factory);
                      setFactoryId(factory.id);
                      setIsOpenFactories(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <img
                      className="w-12 h-12 rounded-md object-cover"
                      src={factory.imageUrl ?? ""}
                      alt={factory.name}
                    />
                    {factory.name}
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
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          صورة المنتج
        </label>
        <ImageCroper
          aspect={1 / 1}
          height={1200}
          width={1200}
          loadingSave={loading}
          onSave={handleSave}
          onClose={() => {}}
          banner={product?.imageUrl ? { imageUrl: product.imageUrl } : null}
          minDimensions={{
            width: 1200,
            height: 1200,
          }}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={
            loading
              ? "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-not-allowed opacity-70"
              : "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer hover:opacity-90"
          }
        >
          {loading ? "جاري الحفظ..." : product ? "تحديث المنتج" : "حفظ المنتج"}
        </button>
      </div>
    </div>
  );
};
export default ProductForm;
