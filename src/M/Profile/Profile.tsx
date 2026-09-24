import "./Profile.css";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { IoMdCreate, IoMdSave, IoMdAdd, IoMdTrash } from "react-icons/io";

import {
  RefreshUser,
  updateUserProfile,
  type UserForDisplay,
} from "../Redux-Store/UserControle/UserDisplatSlice";
import { useNavigate, useParams } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { close, loading, open } from "../Redux-Store/SuccessFaildState/SFS";
import { MdSunny } from "react-icons/md";
import AxiosApi from "../../AxiosApi";

interface UserForDisplayForm extends UserForDisplay {
  avatar_file?: File; // لإدارة الملف الجديد عند رفع صورة جديدة
  newPassword?: string; // لإدارة كلمة السر الجديدة في الفورم
  oldPassword?: string; // إذا كنت تريد تضمين حقل لكلمة السر القديمة للتحقق قبل التحديث
}

const ModernProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [showPassword, setShowPassword] = useState({ old: false, new: false });
  const dispatch = useDispatch<AppDispatch>();

  const userInfo = useSelector((state: RootState) => state.User.data.user);
  const userError = useSelector((state: RootState) => state.User.error);
  const UserCheck = useSelector((state: RootState) => state.User.status);
  const succsess = useSelector((state: RootState) => state.User.success);

  const [fetchedUser, setFetchedUser] = useState<UserForDisplayForm | null>(
    null,
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserForDisplayForm | null>(null);

  const navigate = useNavigate();

  // التحقق مما إذا كان للمستخدم صلاحية التعديل
  const canEdit = Boolean(
    userInfo && (userInfo._id === id || userInfo.role === "dev"),
  );

  // دالة جلب بيانات المستخدم بناءً على الـ id الممرر في params
  const fetchUserProfile = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingData(true);
      const response = await AxiosApi.get(`/auth/withlogin/profile/${id}`);
      const userData = response.data.user || response.data;
      const initialData = Object.assign(
        { newPassword: "", oldPassword: "" },
        userData,
      );
      setFetchedUser(initialData);
      setFormData(initialData);
    } catch (err: any) {
      dispatch(
        open({
          state: "faild",
          title:
            err.response?.data?.message || "حدث خطأ أثناء جلب بيانات المستخدم",
          descreption: "",
        }),
      );
      setTimeout(() => {
        navigate("/notfound");
      }, 2000);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, dispatch, navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (succsess) {
      dispatch(
        open({
          state: "success",
          title: "نجح التعديل",
          descreption: "تم التعديل الخاص بالمعلومات الشخصية",
        }),
      );
      dispatch(RefreshUser());
      fetchUserProfile(); // إعادة جلب البيانات بعد التحديث الناجح
    }

    if (
      (typeof userError === "object" && userError) ||
      (typeof userError === "string" && userError)
    )
      dispatch(
        open({
          state: "faild",
          title: typeof userError === "string" ? userError : "",
          descreption: "",
        }),
      );
    if (UserCheck === "unAuthenticated") navigate("/");
  }, [UserCheck, dispatch, navigate, succsess, userError, fetchUserProfile]);

  useEffect(() => {
    if (typeof userError === "object" && userError) {
      setIsEditing(true);
    }
  }, [userError]);

  const isEditingRef = useRef(isEditing);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    if (!isEditingRef.current && fetchedUser) {
      setFormData(fetchedUser);
    }
  }, [fetchedUser]);

  if (isLoadingData || !formData)
    return <div className="p-20 text-center">جاري التحميل...</div>;

  // 1. دالة موحدة للحقول البسيطة
  const handleChangeForInputText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // 2. دالة للتعامل مع الحقول المتداخلة (الموقع)
  const handleChangeForLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      };
    });
  };

  // 3. معالجة مصفوفة الهواتف
  const handlePhoneChange = (index: number, value: string) => {
    if (!formData) return;
    const newPhones = [...(formData.phone_numbers || [])];
    newPhones[index] = value;
    setFormData((prev) =>
      prev ? { ...prev, phone_numbers: newPhones } : null,
    );
  };

  const addPhone = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            phone_numbers: [...(prev.phone_numbers || []), ""],
          }
        : null,
    );
  };

  const removePhone = (index: number) => {
    if (!formData?.phone_numbers || formData.phone_numbers.length <= 1) return;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            phone_numbers: prev.phone_numbers.filter(
              (_: unknown, i: number) => i !== index,
            ),
          }
        : null,
    );
  };

  // 4. التعامل مع الروابط الاجتماعية
  const handleSocialLinkChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newLinks = [...(formData.social_links || [])];
    newLinks[index] = { ...newLinks[index], [name]: value };
    setFormData((prev) => (prev ? { ...prev, social_links: newLinks } : null));
  };

  const addSocialLink = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            social_links: [
              ...(prev.social_links || []),
              { platform: "", url: "" },
            ],
          }
        : null,
    );
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            social_links: (prev.social_links || []).filter(
              (_: unknown, i: number) => i !== index,
            ),
          }
        : null,
    );
  };

  const handleSave = async () => {
    if (!formData) return;

    const data = new FormData();

    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    if (formData.email) data.append("email", formData.email);
    if (formData.bio) data.append("bio", formData.bio);
    data.append("location", JSON.stringify(formData.location));

    const phones = (formData.phone_numbers || []).filter(
      (v): v is string => !!v,
    );
    data.append("phone_numbers", JSON.stringify(phones));
    setFormData((prev) => (prev ? { ...prev, phone_numbers: phones } : null));

    if (formData.social_links) {
      const validLinks = formData.social_links.filter(
        (link) => link.platform && link.url,
      );
      setFormData((prev) =>
        prev ? { ...prev, social_links: validLinks } : null,
      );
      data.append("social_links", JSON.stringify(validLinks));
    }

    if (formData.avatar_file) {
      data.append("avatar", formData.avatar_file);
    }
    if (formData.newPassword) {
      data.append("newPassword", formData.newPassword);
    }

    data.append("oldPassword", formData.oldPassword || "");

    dispatch(loading());
    await dispatch(updateUserProfile({ formData: data, id: id ?? "" }));
    dispatch(close());

    setIsEditing(false);
  };

  return (
    <div
      className="max-w-5xl mx-auto my-10 px-4 font-sans container pt-18.75 pb-10 "
      dir="rtl"
    >
      {/* بطاقة الرأس */}
      <div className="relative rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 profileContainer">
        <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600 opacity-30"></div>
        <div className="px-4 sm:px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
              {/* صورة المستخدم */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-800 bg-gray-200 overflow-hidden shadow-lg">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      className="w-full h-full object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-300 select-none">
                      {formData.first_name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}

                  {/* طبقة التظليل التي تظهر فقط عند التعديل وعند عمل Hover */}
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span className="text-sm font-medium">تغيير الصورة</span>
                    </label>
                  )}
                </div>

                {/* حقل الرفع المخفي */}
                {isEditing && (
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();

                        reader.onloadend = () => {
                          setFormData({
                            ...formData,
                            avatar_url: reader.result as string,
                            avatar_file: file,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                )}
              </div>

              {/* اسم المستخدم */}
              <div className="text-center md:text-right">
                <h1 className="text-2xl font-bold">
                  {formData.first_name} {formData.last_name}
                </h1>
                <p className=" text-sm">{formData.username}</p>
              </div>
            </div>

            {/* أزرار التحرير (تظهر فقط إذا تحققت الصلاحية canEdit) */}
            {canEdit && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-300/50"
                  >
                    <IoMdCreate /> تعديل الحساب
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        if (fetchedUser) setFormData(fetchedUser);
                      }}
                      className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                    >
                      <IoMdSave /> حفظ
                    </button>
                  </>
                )}
              </div>
            )}

            {formData?.role && formData.role !== "user" && (
              <div
                className={`absolute -top-18 -left-7 element-center ${
                  formData.role === "admin" ? "text-yellow-500" : "text-red-400"
                }`}
              >
                <MdSunny size={100} />
                <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-black font-extrabold -rotate-30">
                  {formData.role === "admin"
                    ? "مشرف"
                    : formData.role === "dev"
                      ? "مسئول"
                      : ""}
                </span>
              </div>
            )}
          </div>

          {/* الحقول */}
          <div>
            <h2 className=" mt-2 text-lg font-weight-bold text-center md:text-right">
              أنضم منذ :{" "}
              {formData.created_at &&
                new Date(formData.created_at).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* الاسم الأول */}
            <div className="space-y-4">
              <label className="block text-sm font-bold pr-2">
                الاسم الأول
              </label>
              <input
                name="first_name"
                disabled={!isEditing}
                className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                value={formData.first_name || ""}
                onChange={handleChangeForInputText}
              />
              {userError && typeof userError === "object" ? (
                <p className="text-red-500 text-sm">{userError.first_name}</p>
              ) : null}
            </div>

            {/* الاسم الأخير */}
            <div className="space-y-4">
              <label className="block text-sm font-bold pr-2">
                الاسم الأخير
              </label>
              <input
                name="last_name"
                disabled={!isEditing}
                className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                value={formData.last_name || ""}
                onChange={handleChangeForInputText}
              />
              {userError && typeof userError === "object" ? (
                <p className="text-red-500 text-sm">{userError.last_name}</p>
              ) : null}
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-bold pr-2">
                البريد الإلكتروني
              </label>
              <input
                name="email"
                disabled={!isEditing}
                className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                value={formData.email || ""}
                onChange={handleChangeForInputText}
              />
              {userError && typeof userError === "object" ? (
                <p className="text-red-500 text-sm">{userError.email}</p>
              ) : null}
            </div>

            {/* السيرة الذاتية */}
            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-bold pr-2">
                السيرة الذاتية
              </label>
              <textarea
                name="bio"
                disabled={!isEditing}
                className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60 resize-none h-24"
                value={formData.bio || ""}
                onChange={handleChangeForInputText}
              />
            </div>

            {/* تحديد المكان */}
            <div className="space-y-4">
              <label className="block text-sm font-bold pr-2">المحافظة</label>
              <input
                name="governorate"
                disabled={!isEditing}
                className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                value={formData.location?.governorate || ""}
                onChange={handleChangeForLocation}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold pr-2">المدينة</label>
              <input
                name="city"
                disabled={!isEditing}
                className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                value={formData.location?.city || ""}
                onChange={handleChangeForLocation}
              />
            </div>

            {/* أرقام الهواتف */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-bold pr-2">
                أرقام الهواتف
              </label>
              {formData.phone_numbers?.map((phone: string, index: number) => (
                <div key={index} className="">
                  <div className="flex gap-2">
                    <input
                      disabled={!isEditing}
                      className="flex-1 p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                    />
                    {isEditing && formData.phone_numbers.length > 1 && (
                      <button
                        onClick={() => removePhone(index)}
                        className="p-2 text-red-500 cursor-pointer rounded-xl"
                        title={`حذف رقم ${phone}`}
                      >
                        <IoMdTrash size={22} />
                      </button>
                    )}
                  </div>
                  {userError &&
                  typeof userError === "object" &&
                  userError["phone_numbers." + index] ? (
                    <p className="text-red-500 text-sm">
                      {userError["phone_numbers." + index]}
                    </p>
                  ) : null}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={addPhone}
                  className="flex items-center gap-1 text-indigo-600 text-sm font-bold mt-2 cursor-pointer"
                >
                  <IoMdAdd /> إضافة رقم
                </button>
              )}
            </div>

            {/* روابط التواصل الاجتماعي */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-bold pr-2">
                الروابط الاجتماعية
              </label>
              {formData.social_links?.map((link, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex gap-2 flex-col md:flex-row flex-1">
                    <div className="flex-1 flex-col">
                      <input
                        disabled={!isEditing}
                        className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                        value={link.platform}
                        name="platform"
                        placeholder="اسم المنصة"
                        onChange={(e) => handleSocialLinkChange(index, e)}
                      />
                      {userError &&
                      typeof userError === "object" &&
                      userError[`social_links.${index}.platform`] ? (
                        <p className="text-red-500 text-sm">
                          {userError[`social_links.${index}.platform`]}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex-3">
                      <input
                        disabled={!isEditing}
                        className="w-full p-3.5 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60"
                        value={link.url}
                        name="url"
                        placeholder="رابط الملف الشخصي"
                        onChange={(e) => handleSocialLinkChange(index, e)}
                      />
                      {userError &&
                      typeof userError === "object" &&
                      userError[`social_links.${index}.url`] ? (
                        <p className="text-red-500 text-sm">
                          {userError[`social_links.${index}.url`]}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-red-500 cursor-pointer rounded-xl"
                    >
                      <IoMdTrash size={22} />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={addSocialLink}
                  className="flex items-center gap-1 text-indigo-600 text-sm font-bold mt-2 cursor-pointer"
                >
                  <IoMdAdd /> إضافة رابط
                </button>
              )}
            </div>

            {/* تعيين كلمة سر جديدة */}
            {canEdit && isEditing && (
              <>
                <div className="space-y-4 md:col-span-2">
                  <label
                    className="block text-sm font-bold pr-2"
                    htmlFor="newPassword"
                  >
                    كلمة السر الجديدة
                  </label>
                  <div className="relative w-full group">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      disabled={!isEditing}
                      className="w-full p-3.5 pl-12 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60 bg-gray-100 dark:bg-slate-700"
                      value={formData.newPassword || ""}
                      onChange={handleChangeForInputText}
                    />

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors focus:outline-none show-password-btn"
                      >
                        {showPassword.new ? (
                          <HiEyeOff className="w-6 h-6" />
                        ) : (
                          <HiEye className="w-6 h-6" />
                        )}
                      </button>
                    )}
                  </div>
                  {userError &&
                    typeof userError === "object" &&
                    userError.newPassword && (
                      <p className="text-red-500 text-sm">
                        {userError.newPassword}
                      </p>
                    )}
                </div>

                {/* التأكد من كلمة السر القديمة */}
                <div className="space-y-4 md:col-span-2">
                  <label
                    className="block text-sm font-bold pr-2"
                    htmlFor="oldPassword"
                  >
                    كلمة السر القديمة (للتأكيد)
                  </label>
                  <div className="relative w-full group">
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type={showPassword.old ? "text" : "password"}
                      disabled={!isEditing}
                      className="w-full p-3.5 pl-12 border-none rounded-2xl focus:ring-2 transition-all disabled:opacity-60 bg-gray-100 dark:bg-slate-700"
                      value={formData.oldPassword || ""}
                      onChange={handleChangeForInputText}
                      required
                    />

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            old: !prev.old,
                          }))
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors focus:outline-none show-password-btn"
                      >
                        {showPassword.old ? (
                          <HiEyeOff className="w-6 h-6" />
                        ) : (
                          <HiEye className="w-6 h-6" />
                        )}
                      </button>
                    )}
                  </div>
                  {userError &&
                    typeof userError === "object" &&
                    userError.oldPassword && (
                      <p className="text-red-500 text-sm">
                        {userError.oldPassword}
                      </p>
                    )}
                </div>
              </>
            )}
          </div>

          <div className="border-t-2 mt-5 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 sm:divide-x-2 font-extrabold text-2xl text-center">
            <div className="flex flex-col element-center gap-1 sm:gap-2 break-words">
              <h2 className="">المتابعون</h2>
              <h2 className="text-blue-500">{formData.stats?.followers}</h2>
            </div>
            <div className="flex flex-col element-center gap-1 sm:gap-2 break-words">
              <h2 className="">المنشورات</h2>
              <h2 className="text-blue-500">{formData.stats?.posts_count}</h2>
            </div>
            <div className="flex flex-col element-center gap-1 sm:gap-2 break-words">
              <h2 className="">اتابع</h2>
              <h2 className="text-blue-500">{formData.stats?.following}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfilePage;
