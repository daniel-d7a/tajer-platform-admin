"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ConfirmRole from "./confirmRole";
import { X } from "lucide-react";

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

interface AddUserProps { 
  onclose: () => void;
  data?: User | null;
  onSuccess?: () => void;
};

export default function AddUser({ onclose, data, onSuccess }: AddUserProps) {

  const [userInfo, setUserInfo] = useState<Partial<User>>({});
  const [formData, setFormData] = useState({
    commercialName: "",
    phone: "",
    email: "",
    password: "",
    city: "amman",
    area: "",
    active: true,
    businessType: "shop",
    role: "MERCHANT",
    referralCode: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const businessTypes = [
    { value: "shop", label: "متجر" },
    { value: "supermarket", label: "سوبر ماركت" },
    { value: "restaurant", label: "مطعم" },
    { value: "roastery", label: "محمصه" },
    { value: "sweets shop", label: "محل حلويات" },
    { value: "coffee shop", label: "محل قهوه" },
    { value: "cafe", label: "قاهيه" },
    { value: "library", label: "مكتبه" },
    { value: "other", label: "أخري" }
  ];

  const cities = [
    { value: "amman", label: "عمان" },
    { value: "zarqa", label: "الزرقاء" },
    { value: "irbid", label: "إربد" },
    { value: "russeifa", label: "الرصيفة" },
    { value: "aqaba", label: "العقبة" },
    { value: "salt", label: "السلط" },
    { value: "Madaba", label: "مادبا" },
    { value: "jerash", label: "جرش" },
    { value: "ajloun", label: "عجلون" },
    { value: "karak", label: "الكرك" },
    { value: "tafilah", label: "الطفيلة" },
    { value: "maan", label: "معان" }
  ];

  const GetUserInformation = async () => {
    try {
      const res = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/public/users/${data?.id}` , {credentials:'include'}
      );
      const info = await res.json();
      setUserInfo(info);
    } catch  {
      toast.error("فشل في جلب بيانات المستخدم");
    };
  };

  useEffect(() => {
    if(data) {
      GetUserInformation();
    };
    //eslint-disable-next-line
  }, [data]);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        commercialName: userInfo.commercialName || "",
        phone: userInfo.phone || "",
        email: userInfo.email || "",
        password: "",
        city: userInfo.city || "amman",
        area: userInfo.area || "",
        businessType: userInfo.businessType || "shop",
        role: userInfo.role || "MERCHANT",
        referralCode: userInfo.referralCode || "",
        confirmPassword: "",
        active: Boolean(userInfo.isActive),
      });
    }
  }, [userInfo]);

  const validate = () => {
    if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      toast.error("رقم الهاتف غير صحيح");
      return false;
    }
    
    if (!data && !formData.password) {
      toast.error("كلمة السر مطلوبة");
      return false;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("يجب ان تكون كلمة السر وتأكيدها متطابقتان!");
      return false;
    }
    
    if (formData.password && formData.password.length < 8) {
      toast.error("كلمة السر يجب أن تكون 8 حروف/أرقام على الأقل");
      return false;
    }
    
    if (formData.commercialName.length < 2) {
      toast.error("يجب أن يحتوي اسم المحل على أكثر من حرفين");
      return false;
    }
    
    if (formData.area.length < 2) {
      toast.error("يجب أن يحتوي اسم المنطقة على أكثر من حرفين");
      return false;
    }
    
    if (formData.city.length < 2) {
      toast.error("يجب أن تحتوي المدينة على أكثر من حرفين");
      return false;
    }
    
    if ((formData.role === "ADMIN" || formData.role === "SALES_REP") && !formData.email) {
      toast.error("البريد الإلكتروني إلزامي للأدمن ومندوب المبيعات");
      return false;
    }
    
    return true;
  };

  const handleSendAPI = async () => {
    try {
      const url = data
        ? `https://tajer-backend.tajerplatform.workers.dev/api/admin/users/${data.id}`
        : "https://tajer-backend.tajerplatform.workers.dev/api/admin/users";

      const method = data ? "PUT" : "POST";

      const payload: any = {
        commercialName: formData.commercialName,
        phone: formData.phone,
        email: formData.email || null,
        city: formData.city,
        area: formData.area,
        locationDetails: null,
        businessType: formData.businessType,
        role: formData.role,
        referralCode: formData.referralCode || null,
        referredByRepId: null,
        walletBalance: data ? data.walletBalance : 0,
        isActive: Boolean(formData.active),
        createdAt: null,
        notificationToken: null,
        deletedAt: null,
        ip: null,
        browser: null,
        os: null,
        device: null,
        lang: null,
        otp: null,
        hasVerifiedPhone: null
      };

      if (!data && formData.password) {
        payload.passwordHash = formData.password;
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(data ? "تم تعديل المستخدم بنجاح" : "تم إنشاء المستخدم بنجاح");
        if (!data) {
          setFormData({
            commercialName: "",
            phone: "",
            email: "",
            password: "",
            city: "amman",
            area: "",
            businessType: "shop",
            role: "MERCHANT",
            referralCode: "",
            confirmPassword: "",
            active: true,
          });
        }
        onSuccess?.();
        onclose();
      } else {
        const errorMessage = result.error?.issues?.[0]?.message || result.message || "حاول مره أخرى";
        toast.error("حصل خطأ: " + errorMessage);
      }
    } catch {
      toast.error("فشل الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    if (formData.role === "SALES_REP" || formData.role === "ADMIN") {
      setOpen(true);
    } else {
      setOpen(false);
      handleSendAPI();
    }
  };

  const isBusinessTypeDisabled = formData.role === "ADMIN" || formData.role === "SALES_REP";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-xl shadow-lg rounded-md bg-white">
        {open && (
          <ConfirmRole
            type={data ? "تعديل" : "إنشاء"}
            note={`إذا قمت ب${data ? "تعديل" : "إنشاء"} مستخدم ${
              formData.role === "SALES_REP" ? "مندوب مبيعات" : "أدمن"
            } فسيكون لديه كل صلاحيات ${
              formData.role === "SALES_REP" ? "مندوب مبيعات" : "أدمن"
            }`}
            onConfirm={handleSendAPI}
            onClose={() => {
              setOpen(false);
              setLoading(false);
            }}
            role={formData.role}
            text={`هل انت متأكد أنك تريد ${
              data ? "تعديل" : "إنشاء"
            } حساب ${formData.role === "SALES_REP" ? "مندوب مبيعات" : "أدمن"}`}
          />
        )}

        <div className="w-full flex justify-between items-center">
          <h2 className="text-lg font-bold mb-4">
            {data ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
          </h2>
          <button className="cursor-pointer" onClick={onclose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="commercialName" className="block mb-1">
              الاسم التجاري *
            </label>
            <input
              id="commercialName"
              placeholder="ادخل الاسم التجاري (حد أدنى حرفين)"
              type="text"
              value={formData.commercialName}
              onChange={(e) =>
                setFormData({ ...formData, commercialName: e.target.value })
              }
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              required
              minLength={2}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-1">
              رقم الهاتف *
            </label>
            <input
              id="phone"
              type="text"
              placeholder="ادخل رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1">
              البريد الإلكتروني
              {(formData.role === "ADMIN" || formData.role === "SALES_REP") && (
                <span className="text-red-500 mr-1">*</span>
              )}
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              placeholder={
                formData.role === "ADMIN" || formData.role === "SALES_REP" 
                  ? "ادخل البريد الإلكتروني (إلزامي)" 
                  : "ادخل البريد الإلكتروني (اختياري)"
              }
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              required={formData.role === "ADMIN" || formData.role === "SALES_REP"}
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="active" className="block mb-1">
              تفعيل المستخدم
            </label>
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1">
              كلمة السر {!data && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              id="password"
              placeholder={data ? "اتركه فارغاً للحفاظ على كلمة السر الحالية" : "ادخل كلمة السر (8 أحرف على الأقل)"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              minLength={8}
              required={!data}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1">
              تأكيد كلمة السر {!data && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              placeholder={data ? "اتركه فارغاً للحفاظ على كلمة السر الحالية" : "تأكيد كلمة السر"}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              minLength={8}
              required={!data}
            />
          </div>

          <div>
            <label htmlFor="businessType" className="block mb-1">
              نوع النشاط *
            </label>
            <select
              id="businessType"
              value={formData.businessType}
              onChange={(e) =>
                setFormData({ ...formData, businessType: e.target.value })
              }
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              disabled={isBusinessTypeDisabled}
              required
            >
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {isBusinessTypeDisabled && (
              <p className="text-xs text-gray-500 mt-1">نوع النشاط معطل للأدمن ومندوب المبيعات</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block mb-1">
              الدور *
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value;
                setFormData({ 
                  ...formData, 
                  role: newRole,
                  businessType: (newRole === "ADMIN" || newRole === "SALES_REP") ? "other" : formData.businessType
                });
              }}
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              required
            >
              <option value="MERCHANT">تاجر</option>
              <option value="SALES_REP">مندوب مبيعات</option>
              <option value="ADMIN">أدمن</option>
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block mb-1">
              المدينة *
            </label>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              required
            >
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="area" className="block mb-1">
              المنطقة *
            </label>
            <input
              id="area"
              placeholder="ادخل المنطقة (حد أدنى حرفين)"
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
              required
              minLength={2}
            />
          </div>
              {formData.role === 'MERCHANT' && (
                <>
                 <div>
            <label htmlFor="referralCode" className="block mb-1">
              الكود التصنيفي
            </label>
            <input
              type="text"
              placeholder="ادخل الكود التصنيفي (اختياري)"
              id="referralCode"
              value={formData.referralCode}
              onChange={(e) =>
                setFormData({ ...formData, referralCode: e.target.value })
              }
              className="border-1 border-gray-300 rounded px-2 py-1 w-full"
            />
                </div>
                <div></div>
                </>
              )}
         
         
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))]/90 disabled:opacity-70"
          >
            {loading
              ? data
                ? "جاري التعديل..."
                : "جاري الإنشاء..."
              : data
              ? "تعديل المستخدم"
              : "إنشاء المستخدم"}
          </button>

          <button
            onClick={onclose}
            type="button"
            className="cursor-pointer px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            إلغاء
          </button>
        </form>
      </div>
    </div> 
  );
};