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

interface OrderApiResponse {
  data: {
    order: {
      id: number;
      merchantId: number;
      status: string;
      totalValue: number;
      createdAt: string;
      locationDetails: string;
      text_id: string;
      merchant: {
        commercialName: string;
        phone: string;
      };
    };
    items: Array<{
      id: number;
      orderId: number;
      productId: number;
      quantity: number;
      priceAtTimeOfOrder: number;
      factoryBatchId?: number;
      factoryStatus?: string;
      product: {
        id: number;
        barcode: string;
        name: string;
        name_ar: string;
        imageUrl: string;
      };
    }>;
    meta: {
      limit: number;
      offset: number;
      from: number;
      to: number;
      page: number;
      last_page: number;
      total: number;
      per_page: number;
    };
  };
}

interface UserLocationResponse {
  locationDetails?: string;
}

interface DetailsProps {
  order: Omit<OrderApiResponse["data"]["order"], "locationDetails"> & {
    locationDetails?: string;
  };
  onClose: () => void;
}

function extractLatLng(locationDetails?: string) {
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
}

const OrderDetailsModal: React.FC<DetailsProps> = ({ order, onClose }) => {
  const [fullOrder, setFullOrder] = useState<OrderApiResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setLoading(true);
    const fetchOrderData = async () => {
      try {
        const response = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/orders/orders/${order.id}`,
          { credentials: "include" }
        );
        const res: OrderApiResponse = await response.json();
        setFullOrder(res.data);
      } finally {
        setLoading(false);
      }
    };
    const fetchUserLocation = async () => {
      try {
        const response = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/public/users/${order.merchantId}`,
          { credentials: "include" }
        );
        const userData: UserLocationResponse = await response.json();
        setUserLocation(userData.locationDetails);
      } catch {
        setUserLocation(undefined);
      }
    };
    fetchOrderData();
    fetchUserLocation();
    // eslint-disable-next-line
  }, [order.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-md p-6 shadow-lg">
          جاري تحميل تفاصيل الطلب...
        </div>
      </div>
    );
  }

  if (!fullOrder) return null;

  const { order: orderData, items } = fullOrder;
  const latLng = extractLatLng(userLocation);
  const googleMapsLink = latLng
    ? `https://www.google.com/maps/search/?api=1&query=${latLng.lat},${latLng.lng}`
    : "";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            تفاصيل الطلب #{orderData.text_id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                اسم التاجر
              </label>
              <p className="text-sm text-gray-900">
                {orderData.merchant.commercialName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                هاتف التاجر
              </label>
              <p className="text-sm text-gray-900">
                {orderData.merchant.phone}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                الحالة
              </label>
              <p className="text-sm text-gray-900">
                {orderData.status === "PROCESSING"
                  ? "قيد المعالجة"
                  : orderData.status === "OUT_FOR_DELIVERY"
                  ? "خارج للتوصيل"
                  : "مكتمل"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                القيمة الإجمالية
              </label>
              <p className="text-sm text-gray-900">
                {orderData.totalValue.toFixed(2)} د.أ
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                تاريخ الإنشاء
              </label>
              <p className="text-sm text-gray-900">
                {new Date(orderData.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">
              المنتجات
            </label>
            <div className="space-y-2 border rounded p-3 max-h-60 overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center text-gray-400">
                  لا توجد منتجات في هذا الطلب.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="border-b pb-2 mb-2 last:border-b-0 last:mb-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold">
                          {item.product.name_ar || item.product.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({item.product.barcode})
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 flex flex-col items-center">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name_ar || item.product.name}
                            className="w-20 h-20 object-cover mb-1"
                          />
                        )}
                        الكمية: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      سعر وقت الطلب: {item.priceAtTimeOfOrder.toFixed(2)} د.أ
                    </div>
                    {item.factoryStatus && (
                      <div className="text-xs text-gray-400 mt-1">
                        حالة المصنع: {item.factoryStatus}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 border-t w-full border-2 border-gray-500 rounded-md flex flex-col items-center gap-2">
          {!userLocation && <h2>لا توجد بيانات موقع</h2>}
          {userLocation && latLng && (
            <>
              <a
                href={googleMapsLink}
                className="text-blue-700 underline mb-2"
                target="_blank"
                rel="noopener noreferrer"
                style={{ direction: "ltr", wordBreak: "break-all" }}
              >
                رابط خرائط Google Maps
              </a>
              <div
                style={{ width: "100%", height: "300px", maxWidth: "600px" }}
              >
                <MapContainer
                  center={[latLng.lat, latLng.lng]}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latLng.lat, latLng.lng]} icon={markerIcon}>
                    <Popup>
                      <span>
                        موقع التاجر
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
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
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
};

export default OrderDetailsModal;
