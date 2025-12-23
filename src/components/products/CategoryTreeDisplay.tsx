import React, { useState } from 'react';
import type { GetCategory } from '@/types/category';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';

interface CategoryTreeDisplayProps {
  categories: GetCategory[];
  onEdit: (category: GetCategory) => void;
  onDelete: (category: GetCategory) => void;
}

const CategoryTreeDisplay: React.FC<CategoryTreeDisplayProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  // central state to track expanded nodes
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategoryNode = (category: GetCategory, level: number) => (
    <div key={`category-${category.id}`} className="mb-2">
      <div
        className="flex items-center py-2 px-3 rounded-md hover:bg-gray-50"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {category.children && category.children.length > 0 ? (
          <button
            onClick={() => toggleExpand(category.id)}
            className="mr-2 cursor-pointer"
            type="button"
          >
            {expanded[category.id] ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-6"></div>
        )}
        <span className="font-medium text-gray-900 flex-1" dir="rtl">
          ({category.name_ar}) {category.name}
        </span>
        <div className="flex flex-row-reverse space-x-2 space-x-reverse">
          <button
            onClick={() => onEdit(category)}
            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer"
            title="تعديل"
            type="button"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className={`text-red-600 hover:text-red-800 cursor-pointer ${
              category.children && category.children.length > 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            title={
              category.children && category.children.length > 0
                ? 'لا يمكن حذف تصنيف يحتوي على تصنيفات فرعية'
                : 'حذف'
            }
            disabled={category.children && category.children.length > 0}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {expanded[category.id] && category.children && category.children.length > 0 && (
        <div className="ml-4">
          {category.children.map(child => renderCategoryNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">لا توجد تصنيفات لعرضها.</div>
      ) : (
        categories.map(category => renderCategoryNode(category, 0))
      )}
    </div>
  );
};

export default CategoryTreeDisplay;
