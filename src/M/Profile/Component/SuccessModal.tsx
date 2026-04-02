import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { HiCheckCircle } from "react-icons/hi"; // أيقونة النجاح
import type { AppDispatch, RootState } from "../../../store";
// استورد الأكشن المسؤول عن إعادة ضبط الحالة (مثلاً resetUpdateState)
import { closeSucssePage } from "../../Redux-Store/UserControle/UserUpdateSlice";
import { RefreshUser } from "../../Redux-Store/UserControle/UserDisplatSlice";

function SuccessModal() {
  const dispatch = useDispatch<AppDispatch>();
  // نفترض أن لديك حالة تسمى isSuccess في الـ Redux
  const isSuccess = useSelector<RootState>(
    (state: RootState) => state.UserUpdate.success,
  );

  useEffect(() => {
    if (isSuccess) {
      dispatch(RefreshUser());
      // إخفاء الرسالة تلقائياً بعد 3 ثوانٍ
      const timer = setTimeout(() => {
        dispatch(closeSucssePage());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch]);

  if (!isSuccess) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-green-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        {/* أيقونة النجاح مع حركة نبض بسيطة */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
          <HiCheckCircle className="text-green-500 w-16 h-16" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            تم التحديث بنجاح!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            تم حفظ بيانات ملفك الشخصي بأمان.
          </p>
        </div>

        <button
          onClick={() => dispatch(closeSucssePage())}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-xl font-medium transition-all active:scale-95"
        >
          موافق
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
