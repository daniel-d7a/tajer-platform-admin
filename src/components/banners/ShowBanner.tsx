import { X } from 'lucide-react';

interface ShowBannerProps {
  image: string;
  onClose: () => void;
};
export default function ShowBanner({ image, onClose }: ShowBannerProps) {
  return (
    <div  
      onClick={onClose} 
className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center overflow-x-auto h-auto w-full z-50 ">    
    
      <div 
       onClick={(e) => e.stopPropagation()}
      className="relative mx-auto p-5 border w-11/12 shadow-lg overflow-x-scroll flex flex-col rounded-md gap-5 bg-white ">
        <div className='flex justify-end'>
            <button 
          onClick={onClose}
          className=" text-gray-500   p-1  hover:text-gray-700 cursor-pointer transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>
        </div>
      
        
        <div className='w-full'>
            <img src={image} alt="عرض البانر" className='w-full rounded-md' />
        </div>
      </div>
    </div>
  );
};