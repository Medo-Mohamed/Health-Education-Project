import React, { useEffect, useState } from "react";
import "./Register.css";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { MdDeleteOutline } from "react-icons/md";
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
  }, [UserStates.status, navigate]); // سيعمل فقط عندما تتغير الحالة
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_numbers: [{ id: uuidv4(), number: "" }], // مصفوفة لتبدأ برقم واحد على الأقل
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

  // التعامل مع تغيير الحقول العادية
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    // console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // التعامل مع مصفوفة أرقام الهاتف
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

    // تجهيز البيانات لتطابق الـ Schema
    const payload = {
      username: formData.username,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || undefined, // إرسال undefined إذا كان فارغاً
      phone_numbers: formData.phone_numbers.map((p) => p.number), // إرسال الأرقام غير الفارغة فقط

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
        // navigate("/login");
        dispatch(
          fetchUser({
            username: formData.username,
            password: formData.password,
            rememberMe: false,
          }),
        );
      }, 2000); // الانتقال بعد 2 ثانية للسماح للمستخدم برؤية رسالة النجاح
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
    <div className="register-container min-h-screen flex flex-col">
      <div className="relative  w-full element-center  bg-black/30  p-6 pt-18.75 flex-1">
        <div
          className={`${formBackground} p-8 rounded-lg shadow-md w-full max-w-md`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center ">
            إنشاء حساب جديد
          </h2>

          {typeof error === "string" && error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
              تم التسجيل بنجاح!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم الكامل */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium ">
                    الاسم الاول *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border  rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {typeof error === "object" && error.first_name && (
                    <p className="text-red-500 text-sm">{error.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    اسم العائلة *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border  rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {typeof error === "object" && error.last_name && (
                    <p className="text-red-500 text-sm">{error.last_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* اسم المستخدم */}
            <div>
              <label className="block text-sm font-medium ">
                اسم المستخدم *
              </label>
              <input
                type="text"
                name="username"
                required
                onChange={handleChange}
                className="mt-1 block w-full border  rounded-md p-2 shadow-sm"
              />
              {typeof error === "object" && error.username && (
                <p className="text-red-500 text-sm">{error.username}</p>
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium ">
                كلمة المرور *
              </label>
              <input
                type="password"
                name="password"
                required
                onChange={handleChange}
                className="mt-1 block w-full border  rounded-md p-2 shadow-sm"
              />
              {typeof error === "object" && error.password && (
                <p className="text-red-500 text-sm">{error.password}</p>
              )}
            </div>

            {/* البريد الإلكتروني (اختياري) */}
            <div>
              <label className="block text-sm font-medium ">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="mt-1 block w-full border  rounded-md p-2 shadow-sm"
              />
              {typeof error === "object" && error.email && (
                <p className="text-red-500 text-sm">{error.email}</p>
              )}
            </div>

            {/* أرقام الهاتف */}
            <div>
              <label className="block text-sm font-medium ">
                أرقام الهاتف (مطلوب واحد على الأقل)
              </label>
              {formData.phone_numbers.map((phone, index) => (
                <div key={phone.id}>
                  <div className="flex items-center gap-1 ">
                    <input
                      type="text"
                      value={phone.number}
                      required={index === 0}
                      placeholder="01xxxxxxxxx"
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      className="mt-1 block w-full border  rounded-md p-2 shadow-sm mb-2 flex-1"
                    />
                    {formData.phone_numbers.length > 1 && (
                      <div
                        onClick={() => removePhoneField(phone.id)}
                        className="text-red-600 cursor-pointer text-2xl"
                      >
                        <MdDeleteOutline />
                      </div>
                    )}
                  </div>
                  {typeof error === "object" && error.phone_numbers[index] && (
                    <p className="text-red-500 text-sm pb-1">
                      {error.phone_numbers[index]}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhoneField}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center gap-1 text-sm w-full justify-center border p-2 rounded-md"
              >
                + إضافة رقم آخر
              </button>
            </div>

            {/* الموقع الجغرافي */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium ">المحافظة</label>
                <input
                  type="text"
                  name="governorate"
                  onChange={handleChange}
                  className="mt-1 block w-full border  rounded-md p-2 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium ">المدينة</label>
                <input
                  type="text"
                  name="city"
                  onChange={handleChange}
                  className="mt-1 block w-full border  rounded-md p-2 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
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
