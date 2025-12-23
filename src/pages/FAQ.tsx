import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import FormFAQ from "../components/Common/formFAQ";

interface FaqType {
  id?: number;
  question_en?: string;
  answer_en?: string;
  question_ar?: string;
  answer_ar?: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FaqType[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<FaqType | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const response = await fetch(
      "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/faqs",
      { credentials: "include" }
    );
    const data = await response.json();
    setFaqs(data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (faqData: FaqType) => {
    setLoading(true);
    if (selectedFaq && selectedFaq.id) {
      await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/faqs/${selectedFaq.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_en: faqData.question_en,
            answer_en: faqData.answer_en,
            question_ar: faqData.question_ar,
            answer_ar: faqData.answer_ar,
          }),
        }
      );
      setLoading(false);
    } else {
      await fetch(
        "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/faqs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            question_en: faqData.question_en,
            answer_en: faqData.answer_en,
            question_ar: faqData.question_ar,
            answer_ar: faqData.answer_ar,
          }),
        }
      );
    }
    const response = await fetch(
      "https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/faqs",
      { credentials: "include" }
    );
    const updatedData = await response.json();
    setFaqs(updatedData);
    setOpen(false);
    setSelectedFaq(null);
  };

  const handleDelete = async (faqId?: number) => {
    if (window.confirm("هل تريد حذف هذا السؤال ؟")) {
      await fetch(
        `https://tajer-platform-api.eyadabdou862.workers.dev/api/admin/faqs/${faqId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      setFaqs((prev) => prev.filter((item) => item.id !== faqId));
    }
    if (!faqId) return;
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          إدارة الأسئلة الشائعة
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة جميع الأسئلة الشائعة في الموقع الرئيسي
        </p>
      </div>
      <div className="mt-4 w-full flex justify-end items-center">
        <button
          onClick={() => {
            setSelectedFaq(null);
            setOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary))]/90 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة سؤال جديد
        </button>
      </div>
      <div>
        {faqs.map((faq) => (
          <div
            key={faq.id || `${faq.question_en}-${faq.question_ar}`}
            className="flex justify-between items-center mb-2"
          >
            <details className="p-6 bg-gray-200 rounded-md w-full">
              <summary className="cursor-pointer font-bold">
                {faq.question_en} ({faq.question_ar})
              </summary>
              <p className="mt-2 text-gray-600">
                {faq.answer_en} ({faq.answer_ar})
              </p>
            </details>
            <div className="flex  gap-2 ml-4">
              <button
                onClick={() => {
                  setSelectedFaq(faq);
                  setOpen(true);
                }}
                className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 cursor-pointer hover:scale-110 duration-150"
                title="تعديل"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110 duration-150"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <FormFAQ
          loading={loading}
          faq={selectedFaq}
          onClose={() => {
            setOpen(false);
            setSelectedFaq(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
