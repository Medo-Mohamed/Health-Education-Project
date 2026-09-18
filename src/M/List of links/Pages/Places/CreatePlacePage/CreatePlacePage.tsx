// CreatePlacePage.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, CheckCircle2, Upload } from "lucide-react";
import type { PlaceType, IPlace } from "../types";
import type { AppDispatch, RootState } from "../../../../../store";
import {
  loading,
  open,
  close,
} from "../../../../Redux-Store/SuccessFaildState/SFS";
import AxiosApi from "../../../../../AxiosApi";

export const CreatePlacePage: React.FC = () => {
  // console.log("CreatePlacePage rendered 00");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 1. أخذ parentId مباشرة من مسار الـ Route Params
  const { parentId } = useParams<{ parentId?: string }>();

  // جلب بيانات المستخدم من Redux State
  const User = useSelector((state: RootState) => state.User?.data?.user);
  const isDev = User?.role === "dev";

  // حالات التحقق والنموذج
  const [parentPlace, setParentPlace] = useState<IPlace | null>(null);
  const [validatingParent, setValidatingParent] = useState<boolean>(!!parentId);

  const [name, setName] = useState("");
  const [type, setType] = useState<PlaceType>("operational");
  const [description, setDescription] = useState("");

  // إدارة ملف الصورة والكتلة المؤقتة للمعاينة
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [addressDetails, setAddressDetails] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);

  // 2. التحقق من وجود وصلاحية المكان الأب من السيرفر فور تحميل الصفحة
  useEffect(() => {
    if (parentId) {
      dispatch(loading());

      AxiosApi.get(
        `/auth/withlogin/places/place-manage/${parentId}/validate-parent`,
      )
        .then((response) => {
          // console.log(response)
          // يتوقع السيرفر إرجاع البيانات بأسلوب { place: IPlace } أو مباشر
          setParentPlace(response.data.place || response.data);
        })
        .catch((err) => {
          console.error("خطأ أثناء التحقق من المكان الأب:", err);
          const errorMessage =
            err.response?.data?.message ||
            "المكان الأب غير موجود أو ليس لديك صلاحية عليه.";
          dispatch(open({ state: "faild", title: errorMessage }));
        })
        .finally(() => {
          setValidatingParent(false);
          dispatch(close());
        });
    }
  }, [parentId, dispatch]);

  // إدارة اختيار صورة المكان مع تنظيف ذاكرة الـ Preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // إدارة أرقام الهواتف
  const handlePhoneChange = (index: number, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    setPhoneNumbers(updated);
  };

  const addPhoneInput = () => setPhoneNumbers([...phoneNumbers, ""]);
  const removePhoneInput = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  // معالجة تسليم النموذج كـ FormData للباك إند
  const handleSubmit = async (e: React.FormEvent) => {
    // // console.log("damg");
    e.preventDefault();

    // 🔒 التحقق الشرطي الأساسي للمطور فقط عند عدم وجود أب
    if (!parentId && !isDev) {
      dispatch(
        open({
          state: "faild",
          title: "غير مسموح بإنشاء مكان رئيسي (بدون أب) إلا بحساب المطور DEV.",
        }),
      );
      return;
    }

    dispatch(loading());

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type", type);
    if (parentId) {
      formData.append("parent_id", parentId);
    }

    // تجميع الكائن الفرعي للمعلومات الإضافية (Metadata)
    const filteredPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p !== "");

    const metadata = {
      description: description.trim() || undefined,
      address_details: addressDetails.trim() || undefined,
      phone_numbers: filteredPhones,
    };

    // إرسال الكائن كـ String ليتم فكه بـ validateCreatePlace في الباك
    formData.append("metadata", JSON.stringify(metadata));

    // إضافة ملف الصورة باسم الحقل المعتمد لدى الباك إند (photo)
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const response = await AxiosApi.post(
        "/auth/withlogin/places/place-manage/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const createdPlaceId = response.data?.place?._id || response.data?._id;
      // console.log("تم إنشاء المكان بنجاح:", createdPlaceId);
      dispatch(open({ state: "success", title: "تم إنشاء المكان بنجاح." }));
      navigate(`/listlinks/places/place-layout/${createdPlaceId}`);
    } catch (err: any) {
      console.error("خطأ أثناء حفظ المكان:", err);
      const errorMessage =
        err.response?.data?.message || "حدث خطأ أثناء حفظ المكان.";
      dispatch(open({ state: "faild", title: errorMessage }));
    }
  };

  if (validatingParent) {
    return null;
  }

  return (
    <div className="mx-auto dir-rtl" dir="rtl">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {parentId ? "إضافة مكان فرعي جديد" : "إضافة مكان رئيسي جديد"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          قم بتعبئة بيانات المكان التابع للمؤسسة
        </p>

        {/* عرض المكان الأب المعتمد بعد الفحص */}
        {parentPlace && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold block text-blue-600">
                المكان الأب المعتمد:
              </span>
              <span className="font-bold text-base">{parentPlace.name}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* خانة عرض اسم الأب للعرض فقط (Read-only) إذا وجد parentId */}
          {parentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المكان الأب التابع له
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={parentPlace?.name || "جاري جلب البيانات..."}
                className="w-full border border-gray-200 bg-gray-100 rounded-lg p-2.5 text-sm text-gray-700 font-semibold cursor-not-allowed outline-none"
              />
            </div>
          )}

          {/* اسم المكان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المكان الجديد <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: عيادة الباطنة"
            />
          </div>

          {/* نوع المكان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تصنيف المكان <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PlaceType)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="administrative">إداري (إشراف ومتابعة)</option>
              <option value="operational">عملي (ميداني وتسجيل ندوات)</option>
              <option value="external_location">
                خارجي (تنسيقي للفاعليات)
              </option>
            </select>
          </div>

          {/* قسم البيانات التوثيقية (Metadata) */}
          <div className="border-t pt-5 mt-4 space-y-4">
            <h4 className="font-semibold text-gray-800 text-sm">
              بيانات التواصل والتوثيق (Metadata)
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وصف المكان
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="وصف مختصر لطبيعة العمل هنا..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* رفع صورة المكان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صورة المكان
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer transition w-full justify-center">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span>{photoFile ? photoFile.name : "اختر صورة..."}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="معاينة"
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="الدور الأول - الممر الأيمن"
                />
              </div>
            </div>

            {/* أرقام التواصل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                أرقام الهواتف
              </label>
              {phoneNumbers.map((phone, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                    placeholder="01012345678"
                  />
                  {phoneNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoneInput(idx)}
                      className="p-2.5 text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhoneInput}
                className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-2 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة رقم آخر
              </button>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-end gap-3 border-t pt-5 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-500 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!!parentId && !parentPlace}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              حفظ المكان
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
