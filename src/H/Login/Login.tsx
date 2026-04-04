import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../store";
import { closeLoginModal } from "../../M/Redux-Store/UserControle/UserDisplatSlice";
import { Link } from "react-router-dom";
import LoginForm from "./Components/LoginForm";
import GetPasswordBackForm from "./Components/GetPasswordBackForm";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const UserStates = useSelector((state: RootState) => state.User);

  // no effect needed; state is reset when modal is closed or submission is handled

  if (!UserStates.showLoginModal) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden"
      dir="rtl"
    >
      {/* خلفية ديناميكية زجاجية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0"></div>
      <div
        className="absolute bottom-0 left-0 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"></div>

      <div className="w-full max-w-md p-8 m-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/40 border border-white/30 dark:bg-black/40 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 relative z-10 transition-all duration-300 hover:shadow-blue-500/10">
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={() => {
            dispatch(closeLoginModal());
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors z-20"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-linear-to-tr from-blue-600 to-red-500 rounded-full flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl font-bold tracking-widest">
              HEP
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            مرحباً بعودتك!
          </h2>
          <p className="text-sm mt-3 opacity-80">
            يرجى إدخال بيانات حسابك للمتابعة
          </p>
        </div>
        {UserStates.logIn_or_lostPassword.state === "login" ? (
          <LoginForm />
        ) : (
          <GetPasswordBackForm />
        )}

        <div className="mt-8 text-center text-sm font-medium">
          <span className="opacity-70">ليس لديك حساب؟ </span>
          <Link
            to={"/register"}
            onClick={() => dispatch(closeLoginModal())}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            سجل الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
