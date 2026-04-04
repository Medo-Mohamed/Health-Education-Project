import { useDispatch, useSelector } from "react-redux";
import {
  fetchUser,
  swith_LoginOrGLP,
} from "../../../M/Redux-Store/UserControle/UserDisplatSlice";
import { useState } from "react";
import type { AppDispatch, RootState } from "../../../store";

function LoginForm() {
  const UserStates = useSelector((state: RootState) => state.User);
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Logging in with:", { email, password, rememberMe });
    dispatch(
      fetchUser({
        username: email,
        password,
        rememberMe,
      }),
    );
  };
  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="group">
        <label
          className="block text-sm font-semibold mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
          htmlFor="email"
        >
          اسم المستتخدم
        </label>
        <input
          type="text"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
          placeholder="example"
          dir="ltr"
        />
      </div>

      <div className="group">
        <label
          className="block text-sm font-semibold mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
          htmlFor="password"
        >
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
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>تذكرني</span>
        </label>
        <div
          className="font-semibold cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          onClick={() => dispatch(swith_LoginOrGLP())}
        >
          نسيت كلمة المرور؟
        </div>
      </div>

      {UserStates.error && (
        <div className="p-4 text-sm font-medium text-red-600 bg-red-100/80 dark:bg-red-900/40 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
          {UserStates.error}
        </div>
      )}

      <button
        type="submit"
        disabled={UserStates.loading}
        className={`w-full py-3.5 px-4 flex justify-center rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-lg ${
          UserStates.loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-linear-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        {UserStates.loading ? (
          <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        ) : (
          "تسجيل الدخول"
        )}
      </button>
    </form>
  );
}

export default LoginForm;
