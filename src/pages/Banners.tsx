import ShowBanner from "@/components/banners/ShowBanner";
import AddBaner from "@/components/banners/addBaner";
import { Edit, Eye, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Banner {
  id: number;
  imageUrl: string;
  position: string;
  link: string;
  headline: string;
}

export default function Banners() {
  const [bannersData, setBannersData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openBannerEdite, setOpenBannerEdite] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const handleShowBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsOpen(true);
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/banners",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const res = await response.json();
        setBannersData(res);
      } else {
        toast.error("حدث خطأ أثناء جلب البيانات");
      }
    } catch {
      toast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
      return;
    }
    try {
      const response = await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/banners/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("تم حذف البانر بنجاح");
        fetchBanners();
      } else {
        toast.error("حدث خطأ أثناء حذف البانر");
      }
    } catch {
      toast.error("حدث خطأ أثناء حذف البانر");
    }
  };

  const handleEditBanner = (banner: Banner | null) => {
    setSelectedBanner(banner);
    setOpenBannerEdite(true);
  };
  const handleSaveBanner = async (formData: FormData) => {
    try {
      setLoadingSave(true);
      const url = selectedBanner?.id
        ? `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/banners/${selectedBanner.id}`
        : "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/banners";

      const method = selectedBanner?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        toast.success(
          selectedBanner?.id ? "تم تحديث البانر بنجاح" : "تم إضافة البانر بنجاح"
        );
        setOpenBannerEdite(false);
        setSelectedBanner(null);
        fetchBanners();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "حدث خطأ أثناء حفظ البانر");
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ البانر");
    } finally {
      setLoadingSave(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">بانرات المنصة</h1>
        <p className="mt-1 text-sm text-gray-500">
          قم بإدارة البانرات الأساسية في المنصة
        </p>
      </div>

      <div className="space-y-4 w-full flex justify-end">
        <button
          className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer flex items-center hover:bg-[hsl(var(--primary))]/90 transition-colors"
          onClick={() => handleEditBanner(null)}
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة بانر
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bannersData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bannersData.map((banner) => (
            <div
              key={banner.id}
              className="relative group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Banner Image Container */}
              <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={banner.imageUrl}
                  alt={`Banner ${banner.id}`}
                  loading="lazy"
                />

                {/* Overlay with information */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <div className="text-sm font-semibold truncate">
                    {banner.headline || "بدون عنوان"}
                  </div>
                  {banner.link && (
                    <div className="text-xs opacity-90 truncate mt-1">
                      {banner.link.replace(
                        "https://tajer-jo.com/en/products/",
                        "منتج: "
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => handleShowBanner(banner)}
                      className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg"
                      title="عرض البانر"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleEditBanner(banner)}
                      className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg"
                      title="تعديل البانر"
                    >
                      <Edit className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg"
                      title="حذف البانر"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner ID Badge */}
              <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                #{banner.id}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              لا يوجد أي بانرات حتى الآن
            </p>
            <p className="text-gray-400 text-sm">قم بإضافة أول بانر لتبدأ</p>
          </div>
        </div>
      )}

      {selectedBanner && isOpen && (
        <ShowBanner
          image={selectedBanner.imageUrl}
          onClose={() => {
            setIsOpen(false);
            setSelectedBanner(null);
          }}
        />
      )}

      {openBannerEdite && (
        <AddBaner
          banner={selectedBanner}
          onClose={() => {
            setOpenBannerEdite(false);
            setSelectedBanner(null);
          }}
          onSave={handleSaveBanner}
          loadingSave={loadingSave}
        />
      )}
    </div>
  );
}
