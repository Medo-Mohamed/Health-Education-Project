import React, { useState, useEffect } from "react";

interface RowData {
  _id?: string;
  mainTopic: string;
  supTopic: string;
  comments?: string;
  text_color: string;
  bg_color: string;
}

interface EditRowModalProps {
  isOpen: boolean;
  rowData: { rowData?: RowData; index: number };
  onClose: () => void;
  onSave: (index: number, formData: RowData) => void;
}

const DEFAULT_ROW: RowData = {
  mainTopic: "",
  supTopic: "",
  comments: "",
  text_color: "#000000",
  bg_color: "#ffffff",
};

// تم تصحيح طريقة التعريف هنا
const EditRowModal: React.FC<EditRowModalProps> = ({
  isOpen,
  rowData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<RowData>(
    () => rowData?.rowData || DEFAULT_ROW,
  );

  const [errors, setErrors] = useState({
    mainTopic: "",
    supTopic: "",
  });

  // التحكم في السكرول عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !rowData) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="createTopicModelBox rounded-2xl shadow-xl w-full max-w-lg max-h-full overflow-y-auto animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b  flex justify-between items-center">
          <h3 className="font-bold text-lg"> بيانات الصف</h3>
          <button onClick={onClose} className=" transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 ">
              الموضوع الرئيسي
            </label>
            <input
              name="mainTopic"
              value={formData.mainTopic}
              onChange={handleChange}
              className="w-full border  rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
            {errors.mainTopic && (
              <p className="text-red-500 text-sm mt-1">{errors.mainTopic}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 ">
              الموضوع الفرعي
            </label>
            <input
              name="supTopic"
              value={formData.supTopic}
              onChange={handleChange}
              className="w-full border  rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
            {errors.supTopic && (
              <p className="text-red-500 text-sm mt-1">{errors.supTopic}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 ">ملاحظات</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              className="w-full border  rounded-lg p-2 h-20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 ">
                لون النص
              </label>
              <input
                type="color"
                name="text_color"
                value={formData.text_color || "#000000"}
                onChange={handleChange}
                className="w-full h-10 border  rounded-lg p-1 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 ">
                لون الخلفية
              </label>
              <input
                type="color"
                name="bg_color"
                value={formData.bg_color || "#ffffff"}
                onChange={handleChange}
                className="w-full h-10 border  rounded-lg p-1 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex gap-2">
          <button
            type="submit"
            onClick={() => {
              console.log("formData", formData);
              if (!formData.mainTopic.trim() || !formData.supTopic.trim()) {
                setErrors({
                  mainTopic: !formData.mainTopic.trim()
                    ? "الموضوع الرئيسي مطلوب"
                    : "",
                  supTopic: !formData.supTopic.trim()
                    ? "الموضوع الفرعي مطلوب"
                    : "",
                });
                return;
              }
              setErrors({
                mainTopic: "",
                supTopic: "",
              });
              onSave(rowData?.index, formData);
            }}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            حفظ التغييرات
          </button>
          <button
            onClick={onClose}
            className="flex-1  border  py-2 rounded-xl font-bold transition-colors hover:opacity-80"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRowModal;
