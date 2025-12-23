import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface FaqType {
  id?: number
  question_en?: string
  answer_en?: string
  question_ar?: string
  answer_ar?: string
}

interface FormFAQProps {
  faq: FaqType | null
  onClose: () => void
  onSave: (data: FaqType) => void
  loading: boolean
}

export default function FormFAQ({ faq, onClose, onSave , loading }: FormFAQProps) {
  const isEdit = !!faq
  const [faqForm, setFaqForm] = useState<FaqType>({
    question_en: faq?.question_en ?? '',
    answer_en: faq?.answer_en ?? '',
    question_ar: faq?.question_ar ?? '',
    answer_ar: faq?.answer_ar ?? '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFaqForm({
      question_en: faq?.question_en ?? '',
      answer_en: faq?.answer_en ?? '',
      question_ar: faq?.question_ar ?? '',
      answer_ar: faq?.answer_ar ?? '',
    })
    setErrors({})
  }, [faq])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!faqForm.question_en?.trim()) {
      newErrors.question_en = " من فضلك املأ هذا الحقل"
    }
    if (!faqForm.answer_en?.trim()) {
      newErrors.answer_en = " من فضلك املأ هذا الحقل"
    }
    if (!faqForm.question_ar?.trim()) {
      newErrors.question_ar = " من فضلك املأ هذا الحقل"
    }
    if (!faqForm.answer_ar?.trim()) {
      newErrors.answer_ar = " من فضلك املأ هذا الحقل"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    onSave(faqForm)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-medium text-gray-900">
            {isEdit ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <details className="border rounded-lg p-3 flex flex-col gap-3" open>
            <summary className="cursor-pointer font-medium">
              <label htmlFor="question_en">السؤال باللغه الإنجليزيه</label>
              <input
                id="question_en"
                value={faqForm.question_en}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, question_en: e.target.value })
                }
                type="text"
                placeholder="قم باضافه سؤالك هنا باللغه الإنجليزيه ..."
                className="w-[80%] rounded-md p-2 bg-gray-100 border-2 border-gray-500"
              />
              {errors.question_en && (
                <p className="text-red-500 text-sm mt-1">{errors.question_en}</p>
              )}
            </summary>
            <label htmlFor="answer_en">الجواب باللغه الإنجليزيه</label>
            <textarea
              id="answer_en"
              value={faqForm.answer_en}
              onChange={(e) =>
                setFaqForm({ ...faqForm, answer_en: e.target.value })
              }
              placeholder="قم باضافه اجابتك هنا باللغه الإنجليزيه ..."
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
            ></textarea>
            {errors.answer_en && (
              <p className="text-red-500 text-sm mt-1">{errors.answer_en}</p>
            )}
          </details>

          <details className="border rounded-lg p-3 flex flex-col gap-3" open>
            <summary className="cursor-pointer font-medium">
              <label htmlFor="question_ar">السؤال باللغه العربيه</label>
              <input
                id="question_ar"
                value={faqForm.question_ar}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, question_ar: e.target.value })
                }
                type="text"
                placeholder="قم باضافه سؤالك هنا باللغه العربيه ..."
                className="w-[80%] rounded-md p-2 bg-gray-100 border-2 border-gray-500"
              />
              {errors.question_ar && (
                <p className="text-red-500 text-sm mt-1">{errors.question_ar}</p>
              )}
            </summary>
            <label htmlFor="answer_ar">الجواب باللغه العربيه</label>
            <textarea
              id="answer_ar"
              value={faqForm.answer_ar}
              onChange={(e) =>
                setFaqForm({ ...faqForm, answer_ar: e.target.value })
              }
              placeholder="قم باضافه اجابتك هنا باللغه العربيه ..."
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
            ></textarea>
            {errors.answer_ar && (
              <p className="text-red-500 text-sm mt-1">{errors.answer_ar}</p>
            )}
          </details>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300"
            >
              اغلاق
            </button>
            <button
              type="submit"
              className={
                loading
                  ? "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer opacity-70"
                  : "bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[hsl(var(--primary))]/90"
              }
            >
              {loading ? 'جاري الحفظ' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};