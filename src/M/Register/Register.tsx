import React, { useEffect, useState } from "react";
import "./Register.css";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { MdDeleteOutline } from "react-icons/md";
import {
  FiUser,
  FiLock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiUserPlus,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AxiosApi from "../../AxiosApi";
import { fetchUser } from "../Redux-Store/UserControle/UserDisplatSlice";
import type { AxiosError } from "axios";

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const UserStates = useSelector((state: RootState) => state.User);

  useEffect(() => {
    if (UserStates.status === "idle") {
      navigate("/");
    }
  }, [UserStates.status, navigate]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_numbers: [{ id: uuidv4(), number: "" }],
    governorate: "",
    city: "",
  });

  interface ErrorState {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_numbers: string[];
  }

  const [error, setError] = useState<ErrorState | string>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_numbers: [],
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (index: number, value: string) => {
    const updatedPhones = [...formData.phone_numbers];
    updatedPhones[index].number = value;
    setFormData({ ...formData, phone_numbers: updatedPhones });
  };

  const addPhoneField = () => {
    setFormData({
      ...formData,
      phone_numbers: [...formData.phone_numbers, { id: uuidv4(), number: "" }],
    });
  };

  const removePhoneField = (id: string) => {
    const updatedPhones = formData.phone_numbers.filter(
      (phone) => phone.id !== id,
    );
    setFormData({ ...formData, phone_numbers: updatedPhones });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      username: formData.username,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || undefined,
      phone_numbers: formData.phone_numbers.map((p) => p.number),

      location: {
        governorate: formData.governorate,
        city: formData.city,
      },
    };
    console.log("Submitting payload:", payload);
    try {
      const response = await AxiosApi.post(
        "/auth/withoutlogin/register",
        payload,
      );
      setSuccess(true);
      console.log("User created:", response.data);
      setTimeout(() => {
        dispatch(
          fetchUser({
            username: formData.username,
            password: formData.password,
            rememberMe: false,
          }),
        );
      }, 2000);
    } catch (err: unknown) {
      const error = err as AxiosError<Record<string, unknown>>;
      console.log("Error creating user:", error.response?.data);
      if (typeof error.response?.data === "object" && error.response?.data) {
        const responseData = error.response.data as Record<string, unknown>;
        const validationErrors: ErrorState = {
          username: (responseData.username as string) || "",
          password: (responseData.password as string) || "",
          first_name: (responseData.first_name as string) || "",
          last_name: (responseData.last_name as string) || "",
          email: (responseData.email as string) || "",
          phone_numbers: [],
        };
        if (
          Object.keys(responseData).find((key) => key.includes("phone_numbers"))
        ) {
          const phoneErrorsArray: string[] = [];
          console.log("Processing phone number errors");
          for (let i = 0; i < formData.phone_numbers.length; i++) {
            console.log(`Checking phone number ${i} for errors`);
            phoneErrorsArray[i] =
              (responseData["phone_numbers." + i] as string) || "";
          }
          validationErrors.phone_numbers = phoneErrorsArray;
        }
        console.log("Validation errors:", validationErrors);
        setError(validationErrors);
      } else {
        setError("حدث خطأ ما أثناء التسجيل");
      }
    }
  };

  const formBackground = useSelector((state: RootState) =>
    state.Theme.value === "light"
      ? "form-background-light"
      : "form-background-dark",
  );

  return (
    <div className="register-container min-h-screen flex flex-col justify-center items-center py-10 px-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-xl mx-auto mt-[45px]">
        <div
          className={`${formBackground} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 sm:p-10 rounded-2xl shadow-xl transition-all duration-300`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
              <FiUserPlus className="text-2xl" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              إنشاء حساب جديد
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              أدخل بياناتك للانضمام إلينا
            </p>
          </div>

          {/* Alerts */}
          {typeof error === "string" && error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
              <FiAlertCircle className="text-lg shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl mb-6 text-sm">
              <FiCheckCircle className="text-lg shrink-0" />
              <span>تم التسجيل بنجاح! جاري تحويلك...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* الاسم الأول واسم العائلة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  الاسم الأول <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <FiUser />
                  </span>
                  <input
                    type="text"
                    name="first_name"
                    onChange={handleChange}
                    required
                    placeholder="****"
                    className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                {typeof error === "object" && error.first_name && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {error.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  اسم العائلة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <FiUser />
                  </span>
                  <input
                    type="text"
                    name="last_name"
                    onChange={handleChange}
                    required
                    placeholder="****"
                    className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                {typeof error === "object" && error.last_name && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {error.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* اسم المستخدم */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                اسم المستخدم <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                  <FiUser />
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  onChange={handleChange}
                  placeholder="username123"
                  className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                />
              </div>
              {typeof error === "object" && error.username && (
                <p className="text-red-500 text-xs mt-1.5">{error.username}</p>
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                  <FiLock />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                />
              </div>
              {typeof error === "object" && error.password && (
                <p className="text-red-500 text-xs mt-1.5">{error.password}</p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                البريد الإلكتروني{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                  <FiMail />
                </span>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="example@domain.com"
                  className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                />
              </div>
              {typeof error === "object" && error.email && (
                <p className="text-red-500 text-xs mt-1.5">{error.email}</p>
              )}
            </div>

            {/* أرقام الهاتف */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                أرقام الهاتف <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal">
                  (مطلوب رقم واحد على الأقل)
                </span>
              </label>
              {formData.phone_numbers.map((phone, index) => (
                <div key={phone.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                        <FiPhone />
                      </span>
                      <input
                        type="text"
                        value={phone.number}
                        required={index === 0}
                        placeholder="01xxxxxxxxx"
                        onChange={(e) =>
                          handlePhoneChange(index, e.target.value)
                        }
                        className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    {formData.phone_numbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhoneField(phone.id)}
                        className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors duration-200"
                        title="حذف الرقم"
                      >
                        <MdDeleteOutline className="text-xl" />
                      </button>
                    )}
                  </div>
                  {typeof error === "object" && error.phone_numbers[index] && (
                    <p className="text-red-500 text-xs mt-1">
                      {error.phone_numbers[index]}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhoneField}
                className="mt-2 w-full py-2 px-3 border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <FiPlus className="text-sm" /> إضافة رقم آخر
              </button>
            </div>

            {/* الموقع الجغرافي */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  المحافظة
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <FiMapPin />
                  </span>
                  <input
                    type="text"
                    name="governorate"
                    onChange={handleChange}
                    placeholder="القاهرة"
                    className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  المدينة
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <FiMapPin />
                  </span>
                  <input
                    type="text"
                    name="city"
                    onChange={handleChange}
                    placeholder="مدينة نصر"
                    className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              تسجيل الحساب
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
