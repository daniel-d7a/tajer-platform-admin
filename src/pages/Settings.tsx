import type React from "react";
import { useState, useEffect } from "react";
import { User, Shield, X, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import ImageCroper from "@/components/Common/ImageCroper";

interface SettingsData {
  commercialName: string;
  email: string;
  phone: string;
  area: string;
}

interface HomePageSettings {
  id: number;
  slogan: string | null;
  slogan_ar: string | null;
  androidAppLink: string | null;
  iosAppLink: string | null;
  newAccountCredits: number | null;
  appImageUrl: string | null;
  callToAction: string | null;
  callToActionAr: string | null;
  howItWorks: string | null;
  howItWorksAr: string | null;
  referralBonus: number | null;
  deactivatedFor: string | null;
  image: string | null;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Home_Page");

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState({
    imageUrl: "",
  });

  const [settingsData, setSettingsData] = useState<SettingsData>({
    commercialName: "",
    email: "",
    phone: "",
    area: "",
  });

  const [settingsDataUpdate, setSettingsDataUpdate] = useState<SettingsData>({
    commercialName: "",
    email: "",
    phone: "",
    area: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [updatedHomePage, setUpdatedHomePage] = useState({
    callToAction: "",
    callToActionAr: "",
    androidAppLink: "",
    iosAppLink: "",
    newAccountCredits: 0,
    Bonus: 0,
    appImageUrl: "",
    deactivatedFor: [] as string[],
  });

  const [selectedBusinessType, setSelectedBusinessType] = useState("");

  const businessTypes = [
    { value: "shop", label: "متجر" },
    { value: "restaurant", label: "مطعم" },
    { value: "supermarket", label: "سوبر ماركت" },
    { value: "roastery", label: "محمصه" },
    { value: "sweets shop", label: "محل حلويات" },
    { value: "coffee shop", label: "محل قهوه" },
    { value: "cafe", label: "قاهيه" },
    { value: "library", label: "مكتبه" },
    { value: "other", label: "أخري" },
  ];

  const fetchSettingsData = async () => {
    try {
      const data = await fetch(
        "https://tajer-backend.tajerplatform.workers.dev/api/public/users/1",
        {
          credentials: "include",
        }
      );
      if (data.ok) {
        const res = await data.json();
        setSettingsData({
          commercialName: res.commercialName || "",
          email: res.email || "",
          phone: res.phone || "",
          area: res.area || "",
        });
        setSettingsDataUpdate({
          commercialName: res.commercialName || "",
          email: res.email || "",
          phone: res.phone || "",
          area: res.area || "",
        });
      }
    } catch {
      toast.error("حدث خطأ في جلب بيانات المستخدم");
    }
  };
  const handleImageCrop = (formData: FormData) => {
    const imageFile = formData.get("image") as File;
    if (imageFile) {
      setCroppedImageFile(imageFile);
    }
  };

  const getHomePageData = async () => {
    try {
      const response = await fetch(
        "https://tajer-backend.tajerplatform.workers.dev/api/admin/settings",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data: HomePageSettings = await response.json();
        setImageObject({
          imageUrl: data.appImageUrl || "",
        });
        const deactivatedArray = data.deactivatedFor
          ? data.deactivatedFor.split(",")
          : [];
        setLoadingSettings(false);
        setUpdatedHomePage({
          callToAction: data.callToAction || "",
          callToActionAr: data.callToActionAr || "",
          Bonus: data.referralBonus || 0,
          androidAppLink: data.androidAppLink || "",
          iosAppLink: data.iosAppLink || "",
          newAccountCredits: data.newAccountCredits || 0,
          deactivatedFor: deactivatedArray,
          appImageUrl: data.appImageUrl || "",
        });
        if (data.appImageUrl) {
          setCroppedImageFile(data.appImageUrl as unknown as File);
        }
      }
    } catch {
      toast.error("حدث خطأ في جلب بيانات الصفحة الرئيسية");
    }
  };
  const updateHomePage = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("callToAction", updatedHomePage.callToAction);
      formData.append("callToActionAr", updatedHomePage.callToActionAr);
      formData.append("androidAppLink", updatedHomePage.androidAppLink);
      formData.append("iosAppLink", updatedHomePage.iosAppLink);
      formData.append("referralBonus", updatedHomePage.Bonus.toString());
      formData.append(
        "newAccountCredits",
        updatedHomePage.newAccountCredits.toString()
      );

      if (updatedHomePage.deactivatedFor.length > 0) {
        formData.append(
          "deactivatedFor",
          updatedHomePage.deactivatedFor.join(",")
        );
      } else {
        formData.append("deactivatedFor", "");
      }
      if (croppedImageFile) {
        formData.append("image", croppedImageFile);
      }

      const response = await fetch(
        "https://tajer-backend.tajerplatform.workers.dev/api/admin/settings",
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("تم تحديث إعدادات الصفحة الرئيسية بنجاح!");
        getHomePageData();
      } else {
        toast.error("حدث خطأ في تحديث إعدادات الصفحة الرئيسية");
      }
    } catch {
      toast.error("حدث خطأ في تحديث إعدادات الصفحة الرئيسية");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      setLoadingUser(true);
      const update = await fetch(
        "https://tajer-backend.tajerplatform.workers.dev/api/public/users",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commercialName: settingsDataUpdate.commercialName,
            email: settingsDataUpdate.email,
            city: "amman",
            area: settingsDataUpdate.area,
            locationDetails: null,
            businessType: "other",
            referralCode: null,
          }),
        }
      );
      if (update.ok) {
        toast.success("تم حفظ معلوماتك الشخصية بنجاح!");
        fetchSettingsData();
      } else {
        toast.error("حدث خطأ في حفظ معلوماتك الشخصية");
      }
    } catch {
      toast.error("حدث خطأ في حفظ معلوماتك الشخصية");
    } finally {
      setLoadingUser(false);
    }
  };

  const updateSecurity = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    try {
      setLoadingSecurity(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("تم تحديث كلمة المرور بنجاح!");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("حدث خطأ في تحديث كلمة المرور");
    } finally {
      setLoadingSecurity(false);
    }
  };

  const addBusinessType = () => {
    if (
      selectedBusinessType &&
      !updatedHomePage.deactivatedFor.includes(selectedBusinessType)
    ) {
      setUpdatedHomePage({
        ...updatedHomePage,
        deactivatedFor: [
          ...updatedHomePage.deactivatedFor,
          selectedBusinessType,
        ],
      });
      setSelectedBusinessType("");
    }
  };

  const removeBusinessType = (typeToRemove: string) => {
    setUpdatedHomePage({
      ...updatedHomePage,
      deactivatedFor: updatedHomePage.deactivatedFor.filter(
        (type) => type !== typeToRemove
      ),
    });
  };

  useEffect(() => {
    fetchSettingsData();
    getHomePageData();
  }, []);

  const tabs = [
    { id: "Home_Page", name: "اعدادات عامه", icon: Settings2 },
    { id: "profile", name: "الملف الشخصي", icon: User },
    { id: "security", name: "الأمان", icon: Shield },
  ];

  const handleSave = () => {
    if (activeTab === "profile") {
      updateSettings();
    } else if (activeTab === "Home_Page") {
      updateHomePage();
    } else if (activeTab === "security") {
      updateSecurity();
    }
  };

  const getCurrentLoading = () => {
    if (activeTab === "profile") return loadingUser;
    if (activeTab === "Home_Page") return loading;
    if (activeTab === "security") return loadingSecurity;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة إعدادات النظام والحساب
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-2  space-x-reverse px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                معلومات الملف الشخصي
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={settingsDataUpdate.commercialName}
                    onChange={(e) =>
                      setSettingsDataUpdate({
                        ...settingsDataUpdate,
                        commercialName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settingsDataUpdate.email}
                    onChange={(e) =>
                      setSettingsDataUpdate({
                        ...settingsDataUpdate,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *رقم الهاتف *غير قابل للتعديل حاليا
                  </label>
                  <input
                    type="tel"
                    value={settingsData.phone}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنطقة
                  </label>
                  <input
                    type="text"
                    value={settingsDataUpdate.area}
                    onChange={(e) =>
                      setSettingsDataUpdate({
                        ...settingsDataUpdate,
                        area: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Home_Page" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                إعدادات الصفحه الرئيسيه
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قيمة الإحالة
                  </label>
                  <input
                    type="number"
                    value={updatedHomePage.Bonus}
                    onChange={(e) =>
                      setUpdatedHomePage({
                        ...updatedHomePage,
                        Bonus: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قيمة المحفظه الإفتراضيه{" "}
                  </label>
                  <input
                    type="number"
                    value={updatedHomePage.newAccountCredits}
                    onChange={(e) =>
                      setUpdatedHomePage({
                        ...updatedHomePage,
                        newAccountCredits: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    دعوة للعمل باللغة الإنجليزية
                  </label>
                  <input
                    type="text"
                    value={updatedHomePage.callToAction}
                    onChange={(e) =>
                      setUpdatedHomePage({
                        ...updatedHomePage,
                        callToAction: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    دعوة للعمل باللغة العربية
                  </label>
                  <input
                    type="text"
                    value={updatedHomePage.callToActionAr}
                    onChange={(e) =>
                      setUpdatedHomePage({
                        ...updatedHomePage,
                        callToActionAr: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط التطبيق على Google Play
                  </label>
                  <input
                    type="text"
                    value={updatedHomePage.androidAppLink}
                    onChange={(e) =>
                      setUpdatedHomePage({
                        ...updatedHomePage,
                        androidAppLink: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط التطبيق على App Store
                  </label>
                  <input
                    type="text"
                    value={updatedHomePage.iosAppLink}
                    onChange={(e) =>
                      setUpdatedHomePage({
                        ...updatedHomePage,
                        iosAppLink: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  أنواع الأعمال المعطلة
                </label>

                <div className="flex flex-wrap gap-2">
                  {updatedHomePage.deactivatedFor.map((type) => {
                    const businessType = businessTypes.find(
                      (b) => b.value === type
                    );
                    return (
                      <div
                        key={type}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg border"
                      >
                        <span className="text-sm">
                          {businessType?.label || type}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeBusinessType(type)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedBusinessType}
                    onChange={(e) => setSelectedBusinessType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  >
                    <option value="">اختر نوع العمل</option>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addBusinessType}
                    disabled={!selectedBusinessType}
                    className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    إضافة
                  </button>
                </div>
              </div>
              {!loadingSettings && (
                <ImageCroper
                  aspect={1 / 1}
                  height={800}
                  width={840}
                  onSave={handleImageCrop}
                  minDimensions={{ width: 440, height: 400 }}
                  loadingSave={false}
                  onClose={() => setCroppedImageFile(null)}
                  banner={imageObject}
                />
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                إعدادات الأمان
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <div className="flex gap-2 justify-end space-x-3 space-x-reverse">
              <button
                onClick={handleSave}
                disabled={getCurrentLoading()}
                className={`px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[hsl(var(--primary))]/90 cursor-pointer ${
                  getCurrentLoading() ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {getCurrentLoading() ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
