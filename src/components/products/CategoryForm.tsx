import type { GetCategory } from "@/types/category";
import { RotateCcw, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageCroper from "../Common/ImageCroper";

interface CategoryFormProps {
  category?: GetCategory | null;
  onSuccess: () => void;
}

interface FormState {
  name: string;
  name_ar: string;
  parentId: number | null;
  imageUrl: string | File | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess }) => {
  const [searchCategories, setSearchCategories] = useState("");
  const [categoriesData, setCategoriesData] = useState<GetCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<GetCategory[]>(
    category?.children?.map((e) => e) || []
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  console.log(imageFile);
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
    // eslint-disable-next-line
  }, [searchCategories]);
  const [form, setForm] = useState<FormState>({
    name: category?.name || "",
    name_ar: category?.name_ar || "",
    parentId: category?.parentId || null,
    imageUrl: category?.imageUrl || null,
  });

  const handleAddCategory = (cat: GetCategory) => {
    if (!selectedCategories.some((c) => c.id === cat.id)) {
      const updatedCategories = [...selectedCategories, cat];
      setSelectedCategories(updatedCategories);
      setForm((prev) => ({ ...prev, parentId: cat.id }));
    }
    setIsOpenCategories(false);
  };
  const handleSave = (formData: FormData) => {
    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      setForm((prev) => ({
        ...prev,
        imageUrl: imageFile,
      }));
    }
  };

  const handleRemoveCategory = (id: number) => {
    const updatedCategories = selectedCategories.filter((c) => c.id !== id);
    setSelectedCategories(updatedCategories);
    setForm((prev) => ({
      ...prev,
      parentId: updatedCategories.length > 0 ? updatedCategories[0].id : null,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      name_ar: "",
      parentId: null,
      imageUrl: null,
    });
    setSelectedCategories([]);
    setImageFile(null);
    toast.success("تم إعادة تعيين النموذج");
  };
  const onSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("name_ar", form.name_ar);
      if (form.parentId) {
        formData.append(
          "children",
          String(selectedCategories.map((c) => c.id))
        );
      }
      if (form.imageUrl instanceof File) {
        formData.append("image", form.imageUrl);
      } else if (
        typeof form.imageUrl === "string" &&
        form.imageUrl.trim() !== ""
      ) {
        formData.append("imageUrl", form.imageUrl);
      }
      const url = category
        ? `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/categories/${category.id}`
        : "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/categories";

      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        toast.success(
          category ? "تم تحديث التصنيف بنجاح" : "تم إضافة التصنيف بنجاح"
        );
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "حصل خطأ أثناء حفظ التصنيف");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("حصل خطأ أثناء حفظ التصنيف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[550px] overflow-auto p-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          اسم التصنيف
        </label>
        <input
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          value={form.name}
          id="name"
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm border-2 p-3 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-colors"
          placeholder="أدخل اسم التصنيف"
        />
      </div>

      <div>
        <label
          htmlFor="name_ar"
          className="block text-sm font-medium text-gray-700"
        >
          اسم التصنيف بالعربي
        </label>
        <input
          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
          value={form.name_ar}
          id="name_ar"
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm border-2 p-3 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-colors"
          placeholder="أدخل اسم التصنيف بالعربية"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التصنيفات الرئيسية المختارة
        </label>
        {selectedCategories.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500">لم يتم اختيار أي تصنيفات رئيسية</p>
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-lg p-4 overflow-y-auto space-y-3 max-h-40 bg-white">
            {selectedCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.imageUrl ?? ""}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <div>
                    <span className="font-medium text-gray-800">
                      {cat.name}
                    </span>
                    {cat.name_ar && (
                      <p className="text-sm text-gray-600">{cat.name_ar}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 cursor-pointer p-2 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => handleRemoveCategory(cat.id)}
                  title="إزالة التصنيف"
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
          type="button"
          onClick={() => setIsOpenCategories((prev) => !prev)}
          className="border-2 border-gray-300 w-full p-3 rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center transition-colors focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
        >
          <span className="text-gray-700">اختر تصنيفات رئيسية (اختياري)</span>
          <span className="text-gray-500 transition-transform">
            {isOpenCategories ? "▲" : "▼"}
          </span>
        </button>
        {isOpenCategories && (
          <div className="absolute mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="ابحث عن تصنيف..."
                value={searchCategories}
                onChange={(e) => setSearchCategories(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {loadingCategories ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))]"></div>
                </div>
              ) : categoriesData.length > 0 ? (
                categoriesData.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleAddCategory(cat)}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <img
                      className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                      src={cat.imageUrl ?? ""}
                      alt={cat.name}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{cat.name}</p>
                      {cat.name_ar && (
                        <p className="text-sm text-gray-600">{cat.name_ar}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-500 text-center">
                  لا توجد نتائج
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          صورة التصنيف
        </label>
        <ImageCroper
          width={1600}
          height={900}
          aspect={16 / 9}
          loadingSave={loading}
          banner={category?.imageUrl ? { imageUrl: category.imageUrl } : null}
          onSave={handleSave}
          onClose={() => {}}
          minDimensions={{
            width: 800,
            height: 450,
          }}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين
        </button>
        <button
          type="button"
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
        >
          إلغاء
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-3 bg-[hsl(var(--primary))] text-white rounded-lg cursor-pointer hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الحفظ...
            </div>
          ) : category ? (
            "تحديث التصنيف"
          ) : (
            "إضافة التصنيف"
          )}
        </button>
      </div>
    </div>
  );
};

export default CategoryForm;
