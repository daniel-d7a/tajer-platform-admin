import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface UpdateProductStatusProps {
  onClose: () => void;
  factoryBatchId: number;
  product: {
    id: number;
    name: string;
  };
}

export default function UpdateProductStatus({
  onClose,
  factoryBatchId,
  product,
}: UpdateProductStatusProps) {
  const [state, setState] = useState("PENDING_FACTORY");
  const [loading, setLoading] = useState(false);

  const handleUpdateProductStatus = async () => {
    try {
      setLoading(true);
      await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches/${factoryBatchId}/items`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            status: state,
          }),
        }
      );
      onClose();
      toast.success("تم تحديث حالة المنتج بنجاح");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-x-auto h-auto w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-11/12 max-w-3xl shadow-lg overflow-x-scroll rounded-md bg-white">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2>قم بتحديث حالة المنتج {product.name} </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <h2>اختر حالة المنتج الآن </h2>
          <select
            onChange={(e) => setState(e.target.value)}
            value={state}
            className="w-full h-10 border border-gray-300 rounded-md"
          >
            <option value={"PENDING_FACTORY"}>قيد الانتظار</option>
            <option value={"ORDERED_FROM_FACTORY"}>تم الطلب من المصنع</option>
            <option value={"ARRIVED_AT_WAREHOUSE"}>وصل المستودع</option>
          </select>
          <button
            disabled={loading}
            className={
              loading
                ? "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-not-allowed opacity-70"
                : "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer"
            }
            onClick={handleUpdateProductStatus}
          >
            {loading ? "جاري الحفظ ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
