import { X, UploadCloud } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface Factory {
  id: number;
  name: string;
  name_ar: string;
  imageUrl?: string;
  image_public_id?: string;
}

interface FactoryDetailsProps {
  factory: Factory | null;
  onClose: () => void;
}

export default function FactoryDetails({ factory, onClose }: FactoryDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(factory?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  
  const [updatedData, setUpdatedData] = useState({
    name: factory?.name || '',
    name_ar: factory?.name_ar || '',
    discountAmount: 0,
    discountType: 'percentage',
  });

  const validate = () => {
    return updatedData.name.trim() !== '' && updatedData.name_ar.trim() !== '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error('حجم الملف يجب أن يكون أقل من 10MB');
        return;
      }
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setNewImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdate = async () => {
    if (!validate()) {
      toast.error('من فضلك قم بإدخال جميع الحقول');
      return;
    }
    setLoading(true); 
    try {
      let url: string;
      let method: string;
      const formData = new FormData();
      
      formData.append('name', updatedData.name);
      formData.append('name_ar', updatedData.name_ar);
      formData.append('discountType', updatedData.discountType);
      formData.append('discountAmount', updatedData.discountAmount.toString());

      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      if (factory && factory.id) {
        url = `https://tajer-backend.tajerplatform.workers.dev/api/admin/factories/${factory.id}`;
        method = 'PUT';
      } else {
        url = 'https://tajer-backend.tajerplatform.workers.dev/api/admin/factories';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        toast.success(factory ? 'تم تحديث بيانات المصنع بنجاح' : 'تمت إضافة مصنع جديد بنجاح');
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'فشل الحفظ، يرجى المحاولة في وقت لاحق');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
        <div className="relative mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white my-8">
        <div className='flex w-full justify-between items-center'>
          <h2 className="text-xl font-semibold">
            {factory ? `تعديل بيانات ${factory.name}` : 'إضافة مصنع جديد'}
          </h2>
          <button 
            onClick={onClose} 
            className='text-gray-400 hover:text-gray-600 cursor-pointer'
            disabled={loading}
          >
            <X />
          </button>
        </div>
        
        <div className='flex flex-col gap-5'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='name' className='font-medium'>اسم المصنع بالإنجليزية</label>
            <input
              value={updatedData.name}
              onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
              id='name'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              placeholder='أدخل اسم المصنع بالإنجليزية ...'
              type="text"
              disabled={loading}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='name_ar' className='font-medium'>اسم المصنع بالعربية</label>
            <input
              value={updatedData.name_ar}
              onChange={(e) => setUpdatedData({ ...updatedData, name_ar: e.target.value })}
              id='name_ar'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              placeholder='أدخل اسم المصنع بالعربية ...'
              type="text"
              disabled={loading}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='discountAmount' className='font-medium'>مقدار الخصم علي منتجات المصنع د.أ</label>
            <input
              value={updatedData.discountAmount}
              onChange={(e) => setUpdatedData({ ...updatedData, discountAmount: Number(e.target.value) })}
              id='discountAmount'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              placeholder='ادخل مقدار الخصم ...'
              type="number"
              step={0.1}
              min={0}
              disabled={loading}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='discountType' className='font-medium'>نوع الخصم علي المصنع</label>
            <select
              value={updatedData.discountType}
              onChange={(e) => setUpdatedData({ ...updatedData, discountType: e.target.value })}
              id='discountType'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              disabled={loading}
            >
              <option value='percentage'>نسبة خصم</option>
              <option value='fixed_amount'>سعر ثابت</option>
            </select>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-medium'>صورة المصنع</label>
            
            {imagePreview ? (
              <div className="relative mb-4 mt-2 inline-block">
                <img 
                  src={imagePreview} 
                  alt="معاينة الصورة" 
                  className="w-40 h-40 object-cover rounded-md border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={loading}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs shadow-md hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-green-500 rounded-lg p-6 text-center cursor-pointer hover:bg-green-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 rounded-full bg-green-100">
                    <UploadCloud className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-700">
                      <span className="text-green-500 hover:text-green-600">اختر ملف</span>
                      <span className="text-gray-600"> أو اسحب الصورة هنا</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB</p>
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
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className={
                loading
                  ? "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-not-allowed opacity-70"
                  : "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[hsl(var(--primary))]/90"
              }
            >
              {loading ? 'جاري الحفظ ...' : "حفظ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}