import { useState, useEffect } from "react";

type PostTimeProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { days: number; hours: number }) => void;
};

function PostTime({ isOpen, onClose, onSave }: PostTimeProps) {
  // حالات الإدخال: أيام وساعات
  const [days, setDays] = useState(30);
  const [hours, setHours] = useState(0);

  // تأثير منع التمرير (Scroll) عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // منطق معالجة الأيام (بحد أقصى 30 يوم)
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    if (val > 30) val = 30;
    if (val < 0) val = 0;

    setDays(val);
    // إذا اختار المستخدم 30 يوم، نصفر الساعات تلقائياً لأننا وصلنا للحد الأقصى
    if (val === 30) setHours(0);
  };

  // منطق معالجة الساعات (بحد أقصى 23 ساعة)
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    if (val > 23) val = 23;
    if (val < 0) val = 0;

    // منع إضافة ساعات إذا كان عدد الأيام 30
    if (days < 30) {
      setHours(val);
    }
  };

//   if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-right"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-md gap-6 bg-white p-8 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* عنوان المكون */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-indigo-900">عمر المنشور</h3>
          <p className="text-sm text-gray-500 mt-1">
            حدد مدة ظهور المنشور (الحد الأقصى شهر)
          </p>
        </div>

        {/* خانات الإدخال */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الأيام
            </label>
            <input
              type="number"
              value={days}
              onChange={handleDayChange}
              className="w-full p-3 border-2 border-indigo-50 rounded-xl focus:border-indigo-500 outline-none transition-all text-center font-bold text-indigo-600"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الساعات
            </label>
            <input
              type="number"
              value={hours}
              onChange={handleHourChange}
              disabled={days >= 30}
              className={`w-full p-3 border-2 border-indigo-50 rounded-xl focus:border-indigo-500 outline-none transition-all text-center font-bold text-indigo-600 ${
                days >= 30 ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder="0"
            />
          </div>
        </div>

        {/* ملخص الوقت المختار */}
        <div className="bg-indigo-50 p-4 rounded-2xl flex justify-between items-center">
          <span className="text-indigo-900 text-sm font-medium">
            سيتم حذف المنشور بعد:
          </span>
          <span className="text-indigo-700 font-bold">
            {days} يوم و {hours} ساعة
          </span>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3">
          <button
            onClick={() => onSave({ days, hours })}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            حفظ الإعدادات
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>

        {/* اللمعة الخلفية التقنية التي كانت في تصميمك */}
        <div className="absolute -z-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -bottom-10 -right-10"></div>
      </div>
    </div>
  );
}

export default PostTime;
