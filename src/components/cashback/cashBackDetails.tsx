import { X } from "lucide-react";

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  parentId?: number | null;
  imageUrl: string | null;
  image_public_id?: string | null;
}

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  piecePrice: number;
  barcode: string;
  minOrderQuantity: number;
  name_ar: string;
}

interface CashbackCampaign {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type?: string;
  value: number;
  minOrderValue?: number | null;
  products: Product[];
  categories: Category[];
}

interface CashBackEditProps {
  items: CashbackCampaign;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InfoRowType {
  label: string;
  value: string | number | undefined;
}

export default function CashBackDetails({ items, onClose }: CashBackEditProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-medium text-gray-900">
            تفاصيل عن {items.name}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="اسم العرض" value={items.name} />
            <InfoRow
              label="بداية العرض"
              value={items.startDate.split("T")[0].split("-").join("/")}
            />
            <InfoRow
              label="نهاية العرض"
              value={items.endDate.split("T")[0].split("-").join("/")}
            />
            <InfoRow
              label="نوع العرض"
              value={
                items.type === "percentage"
                  ? "عرض نسبي"
                  : items.type === "fixed"
                  ? "عرض بقيمة ثابتة"
                  : "غير محدد"
              }
            />
            <InfoRow
              label="قيمة العرض"
              value={`${items.value}${items.type === "percentage" ? "%" : " د.أ"}`}
            />
            <InfoRow
              label="تفاصيل العرض"
              value={items.description ?? "لا يوجد وصف"}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">
              منتجات العرض
            </label>

            {items.products?.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-3">
                {items.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center border-b pb-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.barcode}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm">
                        سعر المنتج : {product.piecePrice.toFixed(2)} د.أ
                      </span>
                      <span className="text-sm">
                        أقل عدد للطلب: {product.minOrderQuantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">
              تصنيفات العرض
            </label>

            {items.categories?.length === 0 ? (
              <div className="text-center text-gray-400">
                لا توجد تصنيفات في هذا العرض.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-3">
                {items.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex justify-between items-center border-b pb-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {cat.imageUrl && (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{cat.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: InfoRowType) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
