"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface MerchantDetailsModalProps {
  merchantId: number;
  onClose: () => void;
}

interface MerchantApiResponse {
  data: {
    id: number;
    walletBalance: number;
    commercialName: string;
    phone: string;
    locationDetails?: string;
    createdAt?: string | null;
    email: string | null;
    city: string;
    role: string;
    referralCode: string | null;
    area: string;
    businessType: string;
    isActive: boolean;
    ip: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
    lang: string | null;
    hasVerifiedPhone: boolean;
    notificationToken: string | null;
    deletedAt: string | null;
    referredByRepId: number | null;
    referringRep: any | null;
    referredMerchants: {
      commercialName: string;
      createdAt: string;
      id: number;
    }[];
  };
}

const extractLatLng = (locationDetails?: string) => {
  if (!locationDetails) return null;
  const latMatch = locationDetails.match(/Latitude\s*:\s*([\d.]+)/);
  const lngMatch = locationDetails.match(/Longitude\s*:\s*([\d.]+)/);
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1]),
    };
  }
  return null;
};

const MerchantDetailsModal: React.FC<MerchantDetailsModalProps> = ({
  merchantId,
  onClose,
}) => {
  const [merchant, setMerchant] = useState<MerchantApiResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const res = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/public/users/${merchantId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("فشل في جلب البيانات");

        const data = await res.json();
        setMerchant(data);
        setLatLng(extractLatLng(data.locationDetails || undefined));
      } catch (err) {
        console.error("خطأ:", err);
        setMerchant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchant();
  }, [merchantId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-md p-6 shadow-lg">
          جاري تحميل البيانات ...
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-md p-6 shadow-lg">
          حدث خطأ أثناء تحميل البيانات .
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  const businessTypes: { [key: string]: string } = {
    shop: "متجر",
    supermarket: "سوبر ماركت",
    restaurant: "مطعم",
    roastery: "محمصه",
    "sweets shop": "محل حلويات",
    "coffee shop": "محل قهوه",
    cafe: "قاهيه",
    library: "مكتبه",
    other: "أخري",
  };

  const googleMapsLink = latLng
    ? `https://www.google.com/maps/search/?api=1&query=${latLng.lat},${latLng.lng}`
    : "";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "لا يوجد تاريخ محدد";
    return dateString.split("T")[0].split("-").join("/");
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            تفاصيل التاجر: "{merchant.commercialName}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 border-b pb-2">
              المعلومات الأساسية
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                الإسم التجاري
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.commercialName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                رقم الهاتف
              </label>
              <p className="text-sm text-gray-900 mt-1">{merchant.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                البريد الإلكتروني
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.email || "لا يوجد ايميل"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                المدينة
              </label>
              <p className="text-sm text-gray-900 mt-1">{merchant.city}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                المنطقة
              </label>
              <p className="text-sm text-gray-900 mt-1">{merchant.area}</p>
            </div>
          </div>

          {/* معلومات الحساب */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 border-b pb-2">
              معلومات الحساب
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                الدور
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.role === "MERCHANT"
                  ? "تاجر"
                  : merchant.role === "SALES_REP"
                  ? "مندوب مبيعات"
                  : "أدمن"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                نوع النشاط
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {businessTypes[merchant.businessType] || merchant.businessType}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                الكود المرجعي
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.referralCode || "لا يوجد كود"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                رصيد المحفظة
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.walletBalance} د.أ
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                حالة الحساب
              </label>
              <p
                className={`text-sm mt-1 ${
                  merchant.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {merchant.isActive ? "مفعل" : "غير مفعل"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 border-b pb-2">
              المعلومات التقنية
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                تاريخ الإنشاء
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {formatDate(merchant.createdAt || "لا يوجد تاريخ محدد")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                عنوان IP
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.ip || "غير متوفر"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                المتصفح
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.browser
                  ? merchant.browser.replace(/"/g, "")
                  : "غير متوفر"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                نظام التشغيل
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.os ? merchant.os.replace(/"/g, "") : "غير متوفر"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                نوع الجهاز
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.device === "mobile"
                  ? "جوال"
                  : merchant.device === "desktop"
                  ? "كمبيوتر"
                  : merchant.device || "غير متوفر"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                اللغة
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {merchant.lang || "غير متوفر"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                حالة التحقق
              </label>
              <p
                className={`text-sm mt-1 ${
                  merchant.hasVerifiedPhone ? "text-green-600" : "text-red-600"
                }`}
              >
                {merchant.hasVerifiedPhone ? "تم التحقق" : "لم يتم التحقق"}
              </p>
            </div>
          </div>
        </div>

        {/* التجار المدعوّين */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4">
            التجار المدعوّين
          </h4>
          {merchant.referredMerchants.length === 0 ? (
            <p className="text-sm text-gray-500">لا يوجد تجار مدعوّين</p>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              {merchant.referredMerchants.map((referredMerchant) => (
                <div
                  key={referredMerchant.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{referredMerchant.id} - {referredMerchant.commercialName}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(referredMerchant.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الخريطة */}
        <div className="mt-6 p-4 border border-gray-300 rounded-lg">
          <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4">
            الموقع الجغرافي
          </h4>
          {!merchant.locationDetails ? (
            <p className="text-sm text-gray-500 text-center py-8">
              لا توجد بيانات موقع
            </p>
          ) : (
            <>
              {latLng && (
                <div className="mb-4 text-center">
                  <a
                    href={googleMapsLink}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    فتح في خرائط Google
                  </a>
                </div>
              )}
              {latLng && (
                <div
                  style={{ width: "100%", height: "300px", maxWidth: "100%" }}
                >
                  <MapContainer
                    center={[latLng.lat, latLng.lng]}
                    zoom={14}
                    scrollWheelZoom={true}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                    }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[latLng.lat, latLng.lng]}
                      icon={markerIcon}
                    >
                      <Popup>
                        <span>
                          موقع التاجر: {merchant.commercialName}
                          <br />
                          <a
                            href={googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            افتح في خرائط Google
                          </a>
                        </span>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
              {!latLng && merchant.locationDetails && (
                <p className="text-sm text-gray-500 text-center py-4">
                  بيانات الموقع موجودة ولكن لا يمكن عرضها على الخريطة
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetailsModal;
