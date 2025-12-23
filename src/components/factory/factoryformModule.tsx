import { Edit, X } from "lucide-react";
import { useEffect, useState } from "react";
import UpdateProductStatus from "./updateProductStatus";

interface Product {
  id: number;
  name: string;
  name_ar: string;
  barcode: string;
  imageUrl: string;
  unitType?: string;
  factory?: {
    name: string;
  };
}

interface FactoryItem {
  id: number;
  product: Product;
  quantity: number;
  priceAtTimeOfOrder: number;
  factoryStatus: string;
  factoryBatchId: number;
}

interface FactoryDetails {
  id: number;
  name: string;
  name_ar: string;
  totalCost: number;
  items: FactoryItem[];
}

interface BatchDetails {
  batchTime: string;
  batchDate: string;
  status: string;
  totalItems: number;
  totalCost: number;
  factories: FactoryDetails[];
}

interface FactoryformModuleProps {
  onClose: () => void;
  factory: { id: number };
}

export default function FactoryformModule({
  onClose,
  factory,
}: FactoryformModuleProps) {
  const [dataFactory, setDataFactory] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [openProductId, setOpenProductId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(
          `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/factory-batches/${factory.id}`,
          { credentials: "include" }
        );
        const res = await data.json();
        setDataFactory(res);
        console.log(dataFactory);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [factory.id]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-x-auto h-auto w-full z-50 ">
      {loading ? (
        <div className="flex items-center justify-center h-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="relative mx-auto p-5 border w-11/12 max-w-3xl shadow-lg overflow-x-scroll rounded-md bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              تفاصيل عن هذا الطلب من المصنع
              <span className="text-[hsl(var(--primary))] text-2xl font-bold">
                #{factory.id}
              </span>
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={onClose}
            >
              <X />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                وقت الدفعة :
              </h3>
              <p className="text-gray-600">{dataFactory?.batchTime}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                تاريخ الدفعة :
              </h3>
              <p className="text-gray-600">
                {dataFactory?.batchDate?.split("T")[0]}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">الحالة :</h3>
              <p className="text-gray-600">
                {dataFactory?.status === "ORDERED_FROM_FACTORY"
                  ? "مطلوب من المصنع"
                  : dataFactory?.status === "PENDING_FACTORY"
                  ? "مطلوب من المصنع"
                  : "وصل إلى المستودع"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                إجمالي المنتجات :
              </h3>
              <p className="text-gray-600">{dataFactory?.totalItems}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                القيمة الإجمالية :
              </h3>
              <p className="text-gray-600">
                {dataFactory?.totalCost
                  ? dataFactory.totalCost.toFixed(2)
                  : "0"}{" "}
                د.أ
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              طلبات المصانع :
            </h3>
            {dataFactory?.factories && dataFactory.factories.length > 0 ? (
              <div className="flex flex-col gap-4">
                {dataFactory.factories.map((factoryItem) => (
                  <details
                    key={factoryItem.id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <summary className="cursor-pointer font-bold flex items-center justify-between">
                      <span>
                        {factoryItem.name_ar || factoryItem.name} (#
                        {factoryItem.id})
                      </span>
                      <span className="text-sm text-gray-500 font-normal">
                        التكلفة الإجمالية:{" "}
                        <span className="font-bold text-green-700">
                          {factoryItem.totalCost.toFixed(2)} د.أ
                        </span>
                        {" | "}
                        عدد المنتجات:{" "}
                        <span className="font-bold text-blue-700">
                          {factoryItem.items.length}
                        </span>
                      </span>
                    </summary>
                    <div className="mt-5">
                      <div className="mb-2 flex gap-4">
                        <div>
                          <span className="font-medium text-gray-800">
                            اسم المصنع:
                          </span>{" "}
                          {factoryItem.name_ar || factoryItem.name}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">
                            رقم المصنع:
                          </span>{" "}
                          {factoryItem.id}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-[hsl(var(--primary))]">
                          المنتجات:
                        </h4>
                        <div className="overflow-x-auto w-full">
                          <table className="min-w-[1500px] divide-y divide-gray-300 mb-2">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  صورة المنتج
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  اسم المنتج
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  الباركود
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  الكمية
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  الحاله
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  سعر الوحدة
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  نوع المنتج
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-bold text-gray-600">
                                  التكلفة الإجمالية
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {factoryItem.items.map((item) => (
                                <tr
                                  key={item.id}
                                  className="bg-white hover:bg-gray-300"
                                >
                                  {openProductId === item.id && (
                                    <UpdateProductStatus
                                      onClose={() => setOpenProductId(null)}
                                      factoryBatchId={item.factoryBatchId}
                                      product={item.product}
                                    />
                                  )}
                                  <td className="px-2 py-2 text-right">
                                    <img
                                      src={item.product.imageUrl}
                                      alt={
                                        item.product.name_ar ||
                                        item.product.name
                                      }
                                      className="w-14 h-14 rounded object-cover border"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-right font-medium">
                                    {item.product.name_ar || item.product.name}
                                  </td>
                                  <td className="px-2 py-2 text-right text-sm text-gray-600">
                                    {item.product.barcode}
                                  </td>
                                  <td className="px-2 py-2 text-right font-semibold">
                                    {item.quantity}
                                  </td>
                                  <td className="px-2 py-2 text-right font-semibold flex gap-2">
                                    {item.factoryStatus ===
                                    "ORDERED_FROM_FACTORY"
                                      ? "مطلوب من المصنع"
                                      : item.factoryStatus === "PENDING_FACTORY"
                                      ? "مطلوب من المصنع"
                                      : "وصل إلى المستودع"}
                                    <button
                                      onClick={() => setOpenProductId(item.id)}
                                      className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  </td>

                                  <td className="px-2 py-2 text-right font-semibold">
                                    {item.priceAtTimeOfOrder.toFixed(2)} د.أ
                                  </td>
                                  <td className="px-2 py-2 text-right font-semibold">
                                    {item.product.unitType === "piece_only"
                                      ? "قطعه فقط"
                                      : item.product.unitType === "pack_only"
                                      ? "حزمه فقط"
                                      : "قطعه او حزمه"}
                                  </td>
                                  <td className="px-2 py-2 text-right font-bold text-green-700">
                                    {(
                                      item.quantity * item.priceAtTimeOfOrder
                                    ).toFixed(2)}{" "}
                                    د.أ
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 py-6 text-center">
                لا توجد طلبات مصانع في هذه الدفعة.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
