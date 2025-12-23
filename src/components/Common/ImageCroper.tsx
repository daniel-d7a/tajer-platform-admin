import { UploadCloud, X } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import type { Crop } from "react-image-crop";
import setCanvasPreview from "./setCanvasPreview";

interface ImageCroperProps {
  width: number;
  height: number;
  banner?: {
    imageUrl: string;
  } | null;
  onSave: (formData: FormData) => void;
  onClose: () => void;
  loadingSave: boolean;
  aspect: number;
  minDimensions?: {
    width: number;
    height: number;
  };
}

export default function ImageCroper({
  width,
  height,
  banner,
  onSave,
  aspect,
  minDimensions = { width: 300, height: 300 },
}: ImageCroperProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState(banner?.imageUrl || "");
  const [crop, setCrop] = useState<Crop>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lastSavedHash, setLastSavedHash] = useState<string>("");
  console.log(imageFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const createFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleAutoSave = useCallback(
    async (fileToSave: File) => {
      const fileHash = await createFileHash(fileToSave);
      if (fileHash === lastSavedHash) {
        return;
      }
      const formData = new FormData();
      formData.append("image", fileToSave);

      setLastSavedHash(fileHash);
      onSave(formData);
    },
    [lastSavedHash, onSave]
  );

  useEffect(() => {
    if (!crop || !imageLoaded) return;

    const image = imageRef.current;
    const canvas = previewCanvasRef.current;

    if (!image || !canvas) return;

    try {
      const pixelCrop = convertToPixelCrop(
        crop,
        image.naturalWidth,
        image.naturalHeight
      );

      if (pixelCrop.width <= 0 || pixelCrop.height <= 0) return;

      setCanvasPreview(image, canvas, pixelCrop);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error(
              "toBlob returned null — possible CORS (canvas tainted)"
            );
            toast.error(
              "فشل إنشاء ملف الصورة. إذا كانت الصورة من دومين آخر فتأكد من وجود CORS على السيرفر."
            );
            return;
          }

          const file = new File([blob], "cropped_image.png", {
            type: "image/png",
          });

          setImageFile(file);

          await handleAutoSave(file);
        },
        "image/png",
        0.95
      );
    } catch (error) {
      console.error("Error in cropping:", error);
    }
  }, [crop, imageLoaded, handleAutoSave]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageLoaded(true);

    const initialCrop = makeAspectCrop(
      {
        unit: "%",
        width: 80,
      },
      aspect,
      naturalWidth,
      naturalHeight
    );

    const centeredCrop = centerCrop(initialCrop, naturalWidth, naturalHeight);
    setCrop(centeredCrop);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة فقط");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setImageLoaded(false);
      setImageFile(null);
      setLastSavedHash("");
    };
    reader.onerror = () => {
      toast.error("خطأ في قراءة الملف");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove(
      "bg-gray-100",
      "border-[hsl(var(--primary))]"
    );

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى سحب ملف صورة فقط");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setImageLoaded(false);
      setImageFile(null);
      setLastSavedHash("");
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    setImgSrc("");
    setCrop(undefined);
    setImageFile(null);
    setImageLoaded(false);
    setLastSavedHash("");
    const canvas = previewCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="space-y-4">
      {imgSrc ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">قص الصورة</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                الحفظ التلقائي مفعل
              </span>
              <button
                onClick={resetImage}
                className="w-7 h-7 bg-red-500 flex items-center justify-center rounded-full hover:bg-red-600 transition-colors"
                title="إزالة الصورة"
              >
                <X className="text-white w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              keepSelection
              aspect={aspect}
              minWidth={100}
              minHeight={100}
              className="max-h-[60vh] flex justify-center bg-gray-50"
            >
              <img
                ref={imageRef}
                src={imgSrc || banner?.imageUrl}
                alt="تحميل"
                className="max-h-[60vh] object-contain"
                onLoad={onImageLoad}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  display: "block",
                }}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>

          {crop && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                معاينة الصورة المقطوعة:
              </p>
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "300px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  الأبعاد المستهدفة: {width} × {height} بكسل
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  نسبة العرض إلى الارتفاع: {aspect.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add(
              "bg-gray-100",
              "border-[hsl(var(--primary))]"
            );
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove(
              "bg-gray-100",
              "border-[hsl(var(--primary))]"
            );
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors">
              <UploadCloud className="h-8 w-8 text-gray-400 group-hover:text-[hsl(var(--primary))] transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 cursor-pointer">
                  اختر ملف
                </span>
                <span className="text-gray-600"> أو اسحب الصورة هنا</span>
              </p>
              <p className="text-xs text-gray-500">
                أبعاد مثالية: {width} × {height} بكسل
              </p>
              <p className="text-xs text-gray-400">
                الحد الأدنى: {minDimensions.width} × {minDimensions.height} بكسل
              </p>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        onChange={handleImageChange}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
