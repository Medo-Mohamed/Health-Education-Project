import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../store";
import { loading, open } from "../../../../Redux-Store/SuccessFaildState/SFS";
import { createTopicTable } from "../../../../Redux-Store/TopicTablesControle/TopicTables";
import AxiosApi from "../../../../../AxiosApi";
import type { Table } from "./TopicTableDetails";

const CreateTopicModal = ({
  isOpen,
  onClose,
  type,
  info,
  id,
  setTable,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "create" | "updata";
  info?: { title: string; description: string };
  id?: string;
  setTable?: (data: Table) => void;
}) => {
  const [formData, setFormData] = useState(
    info || {
      title: "",
      description: "",
    },
  );

  const close = () => {
    onClose();
    setFormData({ title: "", description: "" });
  };
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (isOpen) {
      // إيقاف التمرير عند فتح المودال
      document.body.style.overflow = "hidden";
    } else {
      // إعادة التمرير لوضعه الطبيعي عند الإغلاق
      document.body.style.overflow = "auto";
    }

    // دالة التنظيف (Cleanup function)
    // ضرورية جداً لضمان عودة التمرير إذا تم حذف المكون من الـ DOM فجأة
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. تفعيل حالة التحميل
    dispatch(loading());

    try {
      // 2. تنفيذ الأكشن وانتظار النتيجة باستخدام unwrap
      // unwrap تسمح لك بالانتقال مباشرة للـ catch في حال فشل الطلب

      if (type === "create") {
        await dispatch(
          createTopicTable({
            title: formData.title,
            description: formData.description,
          }),
        ).unwrap();

        // 3. في حالة النجاح
        dispatch(open({ title: "تم إنشاء الجدول بنجاح", state: "success" }));
        //   setFormData({ title: "", description: "" }); // إعادة التعيين فقط عند النجاح
      } else if (type === "updata" && id) {
        console.log(formData);
        const response = await AxiosApi.patch(
          "/auth/withlogin/topictabels/titleanddesc",
          {
            id,
            newTitle: formData.title,
            newDescription: formData.description,
          },
        );
        if (setTable) setTable(response.data.data);

        if (response.data)
          dispatch(
            open({
              title: response.data?.data?.message || "تم التعديل بنجاح",
              state: "success",
            }),
          );
      }
      // }
      // يمكنك هنا إغلاق المودال أيضاً
      close();
    } catch (error: any) {
      // console.log(error.message);
      // 4. في حالة الفشل (سيأتي الخطأ من الـ returnWithValue في الثنك)
      dispatch(
        open({
          title: error.response?.data?.message || "حدث خطأ أثناء الإنشاء",
          state: "faild",
        }),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      {/* حاوية المودال */}

      <div
        className=" createTopicModelBox w-full max-w-md max-h-full overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الهيدر */}
        <div className="flex items-center justify-between p-6 border-b ">
          <h2 className="text-xl font-bold ">إنشاء جدول مواضيع جديد</h2>
          <button
            onClick={close}
            className="p-1 rounded-full hover:bg-gray-100/10 transition-colors group"
          >
            <XMarkIcon className="w-6 h-6 group-hover:text-red-500" />
          </button>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              عنوان الجدول (Title)
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="مثال: قسم الطوارئ"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              الوصف (Description)
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="اكتب وصفاً مختصراً لمحتويات هذا الجدول..."
              className="w-full px-4 py-2 border  rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors "
            >
              حفظ وإنشاء
            </button>
            <button
              type="button"
              onClick={close}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;
