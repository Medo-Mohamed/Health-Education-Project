import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../store";

/**
 * حماية المسارات الخاصة بالدخول (listlinks وفروعه، الصفحة الشخصية):
 * حلّ مشكلة «السبام» — أي ظهور نافذة تسجيل الدخول تلقائياً عند كل تنقّل
 * أو محاولة الوصول المباشر إلى روت محمي دون دخول.
 *
 * بدلاً من فتح المودال، نُعيد التوجيه بصمتٍ إلى صفحة الاندينغ "/".
 *
 * - status === "loading" : جارٍ التحقق من الجلسة عند الإقلاع (RefreshUser).
 *   ننتظر بصفحة انتظار صامتة — لا نطرد المستخدم المسجّل الفعلي ولا نفتح مودال.
 * - status === "idle"   : الجلسة سليمة → نعرض المحتوى المحمي.
 * - غير ذلك (unAuthenticated بعد فشل فحص الجلسة أو تسجيل الخروج):
 *   إعادة توجيه فورية إلى "/" بدون أي مودال.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useSelector((state: RootState) => state.User.status);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen grid place-items-center"
        dir="rtl"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"
          role="status"
          aria-label="جارٍ التحقق من الجلسة"
        />
      </div>
    );
  }

  if (status !== "idle") {
    // غير مسجّل الدخول (أو انتهت الجلسة): توجيه مباشر للاندينغ بلا مودال
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
