import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure, closeLoginModal } from "../Redux-Store/LoginSlice";
import type { RootState } from "../../store";

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error, isLoginModalOpen } = useSelector((state: RootState) => state.Login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    // محاكاة الاتصال بالسيرفر
    setTimeout(() => {
      // يمكنك تعديل الشرط هنا ليتناسب مع البيانات الحقيقية أو إرسال طلب API حقيقي
      if (email === "admin@test.com" && password === "123456") {
        dispatch(loginSuccess("mock-jwt-token-12345"));
        dispatch(closeLoginModal());
      } else {
        dispatch(loginFailure("البريد الإلكتروني أو كلمة المرور غير صحيحة"));
      }
    }, 1500);
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden" dir="rtl">
      {/* خلفية ديناميكية زجاجية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"></div>

      <div className="w-full max-w-md p-8 m-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/40 border border-white/30 dark:bg-black/40 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 relative z-10 transition-all duration-300 hover:shadow-blue-500/10">
        
        {/* زر الإغلاق */}
        <button type="button" onClick={() => dispatch(closeLoginModal())} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors z-20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-blue-600 to-red-500 rounded-full flex items-center justify-center shadow-lg mb-4">
             <span className="text-white text-3xl font-bold tracking-widest">HEP</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">مرحباً بعودتك!</h2>
          <p className="text-sm mt-3 opacity-80">
            يرجى إدخال بيانات حسابك للمتابعة
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
              placeholder="example@test.com"
              dir="ltr"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" htmlFor="password">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span>تذكرني</span>
            </label>
            <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              نسيت كلمة المرور؟
            </a>
          </div>

          {error && (
            <div className="p-4 text-sm font-medium text-red-600 bg-red-100/80 dark:bg-red-900/40 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 flex justify-center rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium">
          <span className="opacity-70">ليس لديك حساب؟ </span>
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            سجل الآن
          </a>
        </div>
      </div>
    </div>
  );
}
