import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

function Loading() {
  const isGLoading = useSelector(
    (state: RootState) => state.SuccFaildComponent.state,
  );
  // تأثير لمنع التمرير (Scroll) في الصفحة أثناء التحميل
  useEffect(() => {
    if (isGLoading) {
      document.body.style.overflow = "hidden"; // منع السكرول
    } else {
      document.body.style.overflow = "unset"; // إعادة السكرول
    }

    // تنظيف التأثير عند اختفاء المكون (Cleanup)
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGLoading]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-2xl">
        {/* Spinner احترافي بدلاً من حرف z */}
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

        <p className="text-indigo-900 font-bold text-lg animate-pulse">
          جاري حفظ البيانات...
        </p>

        {/* لمعة خلفية تعطي طابع طبي/تقني */}
        <div className="absolute -z-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
      </div>
    </div>
  );
}

export default Loading;
