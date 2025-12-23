'use client';

import React from 'react';
import { X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface Merchant {
  area: string;
  businessType: string;
  city: string;
  commercialName: string;
  createdAt: Date | string ;
  email: string | null;
  id: number;
  isActive: boolean;
  locationDetails?: string;
  notificationToken: string | null;
  phone: string;
  referralCode: string | null;
  referredByRepId: number | null;
  role: string;
  walletBalance: number;

}

interface MerchantDetailsModalProps {
  merchant: Merchant;
  onClose: () => void;
}

function extractLatLng(locationDetails?: string): { lat: number; lng: number } | null {
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
 
const MerchantDetailsModal: React.FC<MerchantDetailsModalProps> = ({ merchant, onClose }) => {
  const latLng = extractLatLng(merchant.locationDetails);
  const googleMapsLink = latLng
    ? `https://www.google.com/maps/search/?api=1&query=${latLng.lat},${latLng.lng}`
    : '';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50 ">
      <div className="relative mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            تفاصيل التاجر #{merchant.id}
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
              <label className="block text-sm font-medium text-gray-700">اسم التاجر</label>
              <p className="text-sm text-gray-900">{merchant.commercialName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">هاتف التاجر</label>
              <p className="text-sm text-gray-900">{merchant.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">الحالة</label>
              <p className="text-sm text-gray-900">
                {merchant.isActive ? 'فعال' : 'غير فعال'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">الرصيد في المحفظة</label>
              <p className="text-sm text-gray-900">{merchant.walletBalance} د.أ</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">نوع النشاط</label>
              <p className="text-sm text-gray-900">{merchant.businessType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">المدينة</label>
              <p className="text-sm text-gray-900">{merchant.city}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">المنطقة</label>
              <p className="text-sm text-gray-900">{merchant.area}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">تاريخ الإنشاء</label>
              <p className="text-sm text-gray-900">
                {new Date(merchant.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 border-t w-full border-2 border-gray-500 rounded-md flex flex-col items-center gap-2">
          {!merchant.locationDetails && (
            <h2>لا توجد بيانات موقع </h2>
          )}
          {merchant.locationDetails && latLng && (
            <>
            
           
              <div style={{ width: '100%', height: '300px', maxWidth: '600px' }}>
                <MapContainer
                  center={[latLng.lat, latLng.lng]}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{ width: '100%', height: '100%', borderRadius: '12px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latLng.lat, latLng.lng]} icon={markerIcon}>
                    <Popup>
                      <span>
                        موقع التاجر<br />
                        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">افتح في خرائط Google</a>
                      </span>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
                 <a
                href={googleMapsLink}
                className="text-blue-700 underline mb-2"
                target="_blank"
                rel="noopener noreferrer"
                style={{ direction: 'ltr', wordBreak: 'break-all' }}
                title="افتح في خرائط جوجل"
              >
                رابط خرائط Google Maps <span className="text-xs">(اضغط للفتح)</span><br />
              </a>
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

export default MerchantDetailsModal;