import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { useEffect, type ReactNode } from "react";

// 1. استيراد openLoginModal الصحيحة من نفس المكان (UserDisplatSlice)
import { useNavigate } from "react-router-dom";
import { openLoginModal } from "../M/Redux-Store/UserControle/UserDisplatSlice";

function CheckForStart({ children }: { children: ReactNode }) {
  const status = useSelector((state: RootState) => state.User.status);
  const Dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    // 2. إذا لم يكن مسجلاً، يفتح المودال ويحوله للرئيسية
    if (status !== "loading" && status !== "idle") {
      Dispatch(openLoginModal());
      navigate("/", { replace: true });
    }
  }, [status, Dispatch, navigate]);

  // 3. عرض مؤشر التحميل فقط عندما تكون الحالة loading بالفعل
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

  // 4. إذا كانت الحالة ليست idle وليست loading (مثلاً failed أو unauthenticated)
  if (status !== "idle") {
    return null; // سيقوم الـ useEffect أعلاه بالتوجيه تلقائياً
  }

  return <>{children}</>;
}

export default CheckForStart;
