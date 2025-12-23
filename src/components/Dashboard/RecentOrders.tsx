import type React from "react"
import { Clock, Edit, Eye } from "lucide-react"
import { type GetOrder, OrderStatusSchema } from "@/types/order"
import { z } from "zod";
import { useState } from "react";
import OrderDetailsModal from '../Orders/OrderDetailsModal';
import StatusUpdateModal from "../Orders/StatusUpdateModal";
interface RecentOrdersProps {
  data: GetOrder[];
  loading: boolean;
}

const statusText: Record<z.infer<typeof OrderStatusSchema>, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد التجهيز",
  OUT_FOR_DELIVERY: "قيد التوصيل",
  DELIVERED: "تم التوصيل",
}

const statusColors: Record<z.infer<typeof OrderStatusSchema>, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-[hsl(var(--primary-10))] text-[hsl(var(--primary))]",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ data, loading }) => {
  const [open ,setOpen] = useState(false);
const [selectedOrder, setSelectedOrder] = useState<GetOrder | null>(null);
  const [isOpenStatus,setIsOpenStatus] = useState(false);
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 space-x-reverse">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="p-6 text-center text-gray-500">لا توجد طلبات حديثة</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوقت</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.slice(0, 5).map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[hsl(var(--primary))]">#{order.text_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.merchant.commercialName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.totalValue.toFixed(2)} د.أ</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusText[order.status] || order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-1" />
                  {new Date(order.createdAt).toLocaleTimeString("ar-JO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2 items-center">
                <button 
                onClick={() => {
                  setOpen(true);
                  setSelectedOrder(order);
                }}
                className="text-blue-600 hover:text-blue-800 cursor-pointer">
                  <Eye className="h-4 w-4" />
                </button>
                 <button 
                onClick={() => {
                  setIsOpenStatus(true);
                  setSelectedOrder(order);
                }}
                className="text-green-600 hover:text-green-800 cursor-pointer">
                  <Edit className="h-4 w-4" />
                </button>
              </td>
               
            </tr>
          ))}
        </tbody>
      </table>
      {isOpenStatus && selectedOrder && (
        <StatusUpdateModal   loading={false}  onClose={() => setIsOpenStatus(false)}  order={selectedOrder} />
      )}
      {open && selectedOrder && (
        <OrderDetailsModal onClose={() => setOpen(false)} order={selectedOrder}/>
      )}
    </div>
  );
};
export default RecentOrders;