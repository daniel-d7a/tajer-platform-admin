import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import ImageCroper from "../Common/ImageCroper";

interface Banner {
  id?: number;
  imageUrl: string;
  position?: string;
  link?: string;
  headline?: string;
}

interface Product {
  id: number;
  barcode: string | null;
  name: string;
  name_ar: string;
  description: string | null;
  description_ar: string | null;
  unitType: string;
  piecePrice: number | null;
  packPrice: number | null;
  piecesPerPack: number | null;
  factoryId: number;
  imageUrl: string | null;
  image_public_id: string | null;
  minOrderQuantity: number | null;
  discountAmount: number | null;
  discountType: string;
}

interface AddBannerProps {
  banner?: Banner | null;
  loadingSave: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export default function AddBanner({ banner, onClose, onSave, loadingSave }: AddBannerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpenProducts, setIsOpenProducts] = useState(false);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);

  const fetchProductId = async () => {
    if (banner?.link && banner.link.includes("/product/")) {
      try {
        const productId = banner.link.split("/product/")[1];
        const data = await fetch(`https://tajer-backend.tajerplatform.workers.dev/api/public/products/${productId}`);
        const res = await data.json();
        setSelectedProduct(res);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }
  };

  useEffect(() => {
    fetchProductId();
  }, [banner]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(
        `https://tajer-backend.tajerplatform.workers.dev/api/public/all_products`
      );
      if (response.ok) {
        const data = await response.json();
        setProductsData(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRemoveProduct = () => {
    setSelectedProduct(null);
  };

  const handleImageCrop = (formData: FormData) => {
    const imageFile = formData.get("image") as File;
    if (imageFile) {
      setCroppedImageFile(imageFile);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    
    if (croppedImageFile) {
      formData.append("image", croppedImageFile);
    }
    
    if (selectedProduct) {
      formData.append("link", `/product/${selectedProduct.id}`);
      formData.append("headline", selectedProduct.name);
    } else if (banner?.link) {
      formData.append("link", banner.link);
    }
    
    formData.append("position", "top");
    
    if (banner?.headline) {
      formData.append("headline", banner.headline);
    }

    onSave(formData);
  };

  return (
    <div  
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"    
    >    
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white"
      >
        <div className='flex justify-between items-center border-b pb-3'>
          <h2 className="text-xl font-bold text-gray-800">
            {banner ? "تعديل البانر" : "إضافة بانر جديد"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 p-1 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {banner ? "قم بتعديل الصورة الحالية" : "اختر صورة البانر"}
            </h3>
            <p className="text-sm text-gray-500">
              {banner 
                ? "يمكنك استبدال الصورة الحالية بصورة جديدة" 
                : "اختر صورة مناسبة لعرضها كبانر كامل الشاشة"
              }
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">المنتج المرتبط</label>
            {selectedProduct ? (
              <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProduct.imageUrl || "/placeholder-image.jpg"}
                      alt={selectedProduct.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                      }}
                    />
                    <div>
                      <span className="font-medium text-gray-800">{selectedProduct.name}</span>
                      <p className="text-sm text-gray-500">{selectedProduct.name_ar}</p>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 cursor-pointer p-2 hover:bg-red-50 rounded-full transition-colors"
                    onClick={handleRemoveProduct}
                    type="button"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-500">لم يتم اختيار منتج</p>
              </div>
            )}
            
            <div className="relative w-full">
              <button
                onClick={() => {
                  setIsOpenProducts((prev) => !prev);
                  if (!isOpenProducts) {
                    fetchProducts();
                  }
                }}
                className="border-2 border-gray-300 w-full p-3 rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                type="button"
              >
                <span className="text-gray-700">اختر منتج (اختياري)</span>
                <span className="text-gray-500">{isOpenProducts ? '▲' : '▼'}</span>
              </button>
              
              {isOpenProducts && (
                <div className="absolute mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {loadingProducts ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))]"></div>
                    </div>
                  ) : productsData.length > 0 ? (
                    productsData.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsOpenProducts(false);
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <img
                          className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                          src={product.imageUrl || "/placeholder-image.jpg"}
                          alt={product.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.name_ar}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      لا توجد منتجات
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ImageCroper 
            width={3840}
            height={2160}
            aspect={16/9}
            onSave={handleImageCrop}
            onClose={onClose}
            banner={banner}
            loadingSave={loadingSave}
            minDimensions={{ width: 800, height: 450 }}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loadingSave}
              type="button"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={loadingSave || (!croppedImageFile && !banner?.imageUrl)}
              className={`px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-lg transition-colors font-medium flex items-center gap-2 ${
                loadingSave || (!croppedImageFile && !banner?.imageUrl)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[hsl(var(--primary))]/90 shadow-sm"
              }`}
              type="button"
            >
              {loadingSave ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {banner ? "جاري التحديث..." : "جاري الحفظ..."}
                </>
              ) : banner ? (
                "تحديث البانر"
              ) : (
                "إضافة البانر"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}