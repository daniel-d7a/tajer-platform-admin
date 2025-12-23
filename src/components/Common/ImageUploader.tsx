import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, XCircle } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  initialImageUrl,
}) => {
  const [preview, setPreview] = useState<string | null>(
    initialImageUrl || null
  );

  const signatureMutation = useMutation({
    mutationFn: apiService.admin.media.getSignature,
  });

  const handleUpload = async (file: File) => {
    try {
      const { timestamp, signature } = await signatureMutation.mutateAsync();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await response.json();
      const secureUrl = data.secure_url;

      setPreview(secureUrl);
      onUploadSuccess(secureUrl); 
      toast.success('تم رفع الصورة بنجاح!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل رفع الصورة');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUploadSuccess(''); 
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        صورة المنتج
      </label>
      <div className="mt-1">
        {preview ? (
          <div className="relative group w-fit">
            <img
              src={preview}
              alt="Product preview"
              className="h-32 w-32 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-0 right-0 -mt-2 -mr-2 bg-white rounded-full p-1 text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 focus-within:outline-none"
                >
                  <span>ارفع ملف</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={onFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">أو اسحب وأفلت الصورة هنا</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
