import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import {
  checkIfCanGetLostPasswordBack,
  clearState,
  confirmChangePassword,
  confirmOTP,
  swith_LoginOrGLP,
} from "../../../M/Redux-Store/UserControle/UserDisplatSlice";
import { useEffect, useMemo, useState } from "react";
let oldStage: number = 0;
function GetPasswordBackForm() {
  const stage = useSelector(
    (state: RootState) => state.User.logIn_or_lostPassword.stage,
  );
  const userError = useSelector((state: RootState) => state.User.error);
  const userMessage = useSelector((state: RootState) => state.User.message);
  const userLoading = useSelector((state: RootState) => state.User.loading);
  const dispatch = useDispatch<AppDispatch>();
  const [textInput, setTextInput] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stage !== oldStage) setTextInput("");
    oldStage = stage as number;
    if (stage === 3) {
      setTimeout(() => {
        dispatch(swith_LoginOrGLP());
        dispatch(clearState());
      }, 2000);
    }
    return () => setTextInput("");
  }, [dispatch, stage]);

  const fieldInputInfo = useMemo(() => {
    if (stage === 1) {
      return {
        textShow: "إدخل رمز OTP",
        type: "text",
        id: "OTP",
        placeholder: "******",
      };
    }
    if (stage === 2) {
      return {
        textShow: "كلمة المرور الجديدة",
        type: "password",
        id: "new-password",
        placeholder: "********",
      };
    }
    return {
      textShow: "",
      type: "",
      id: "",
      placeholder: "",
    };
  }, [stage]);

  function handelSubmit() {
    if (stage === 0) return dispatch(checkIfCanGetLostPasswordBack(username));
    if (stage === 1)
      return dispatch(confirmOTP({ otpCode: textInput, username }));
    if (stage === 2)
      return dispatch(confirmChangePassword({ newPassword: textInput }));
  }
  return (
    <div className="space-y-6">
      <div className="group">
        <label
          className="block text-sm font-semibold mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
          htmlFor={"username"}
        >
          {"أسم المستخدم"}
        </label>
        <input
          type={"text"}
          id={"username"}
          disabled={(stage as number) > 0}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
          placeholder={"example"}
          dir="ltr"
        />
      </div>
      {(stage as number) >= 1 && (
        <div className="group">
          <label
            className="block text-sm font-semibold mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
            htmlFor={fieldInputInfo.id}
          >
            {fieldInputInfo.textShow}
          </label>
          <input
            type={fieldInputInfo.type}
            id={fieldInputInfo.id}
            disabled={userLoading}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
            placeholder={fieldInputInfo.placeholder}
            dir="ltr"
          />
        </div>
      )}

      {userError && (
        <div className="p-4 text-sm font-medium text-red-600 bg-red-100/80 dark:bg-red-900/40 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
          {userError}
        </div>
      )}

      {!userError && userMessage && (
        <div className="p-4 text-sm font-medium text-green-600 bg-green-100/80 rounded-xl border border-green-200  animate-pulse">
          {userMessage}
        </div>
      )}

      <div className=" flex items-center justify-end">
        <div
          className="cursor-pointer text-sm font-semibold  text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          onClick={() => dispatch(swith_LoginOrGLP())}
        >
          تسجيل الدخول ؟
        </div>
      </div>

      <button
        disabled={userLoading || stage === 3}
        className={`w-full py-3.5 px-4 flex justify-center rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-lg ${
          userLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-linear-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 hover:shadow-xl hover:-translate-y-1"
        }`}
        onClick={handelSubmit}
      >
        {userLoading ? (
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
        ) : stage === 2 ? (
          "حفظ كلمة السر الجديدة"
        ) : stage === 3 ? (
          "حفظ كلمة السر الجديدة"
        ) : (
          "المتابعة"
        )}
      </button>
    </div>
  );
}

export default GetPasswordBackForm;
