'use client';

import type React from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { type GetOrder, OrderStatusSchema } from '@/types/order';
import { z } from 'zod';
import toast from 'react-hot-toast';
interface StatusUpdateModalProps {
  order: GetOrder;
  onClose: () => void;
 

  loading: boolean; 
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  order,
  loading,
  onClose
}) => {
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [OrderValue,setOrderValue] = useState<number>(order.totalValue)
  const handleUpdate = async() =>{
    try{
      await fetch(`https://tajer-backend.tajerplatform.workers.dev/api/orders/orders/${order.id}`, {
  method: 'PATCH',
  credentials:'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: order.id,
    merchantId: order.merchantId,
    status: orderStatus,
    totalValue: OrderValue,
    createdAt: null
  })
})
    }finally{
      onClose();
      toast.success('تم تحديث حاله الطلب بنجاح');
    }
  }
  const labels = [
    {value:"PENDING", label:"قيد الانتظار"},
    {value:"PROCESSING", label:"قيد التنفيذ"},
    {value:"OUT_FOR_DELIVERY", label:"خرج للتوصيل"},
    {value:"DELIVERED", label:"تم التسليم"},
  ]
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            تحديث حالة الطلب #{order.text_id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div  className="space-y-4">
          <div>
            <label htmlFor='Status' className="block text-sm font-medium text-gray-700 mb-2">
              حالة الطلب
            </label>
            <select
              id='Status'
              value={orderStatus}
              onChange={e =>
                setOrderStatus(e.target.value as z.infer<typeof OrderStatusSchema>)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
            >
              {labels.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-4'>
            <label htmlFor='orderValue' >حدد قيمه للأوردر ان وجدت</label>
            <input
              value={OrderValue}
              id='orderValue'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              onChange={(e) => setOrderValue(Number(e.target.value))}
              type='number' 
               />
        </div>
          

          <div className="flex space-x-3 space-x-reverse pt-4 gap-2">
            <button
              type="submit"
              disabled={loading}
                  onClick={() => { handleUpdate()}}
              className="flex-1 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'جاري التحديث...' : 'تحديث'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
   
      </div>
    </div>  
  );
};

export default StatusUpdateModal;