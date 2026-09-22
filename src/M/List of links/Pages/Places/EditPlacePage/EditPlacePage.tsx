// EditPlacePage.tsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload } from "lucide-react";
import type { PlaceType, IPlace } from "../types";
import type { AppDispatch } from "../../../../../store";
import {
  loading,
  open,
  close,
} from "../../../../Redux-Store/SuccessFaildState/SFS";
import AxiosApi from "../../../../../AxiosApi";

export const EditPlacePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 1. أخذ placeId للمكان المراد تعديله من مسار الـ Route Params
  const { placeId } = useParams<{ placeId: string }>();

  // حالات التحقق والنموذج
  const [fetchingPlace, setFetchingPlace] = useState<boolean>(true);
  const [currentPlace, setCurrentPlace] = useState<IPlace | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<PlaceType>("operational");
  const [description, setDescription] = useState("");

  // إدارة ملف الصورة والكتلة المؤقتة للمعاينة
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [addressDetails, setAddressDetails] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);

  // 2. جلب بيانات المكان الحالي وتعبئة النموذج فور تحميل الصفحة
  useEffect(() => {
    if (placeId) {
      dispatch(loading());

      AxiosApi.get(`/auth/withlogin/places/place-manage/${placeId}`)
        .then((response) => {
          const placeData: IPlace = response.data.place || response.data;
          setCurrentPlace(placeData);
          //   console.log(placeData)

          // تعبئة البيانات الأساسية
          setName(placeData.name || "");
          setType(placeData.type || "operational");

          // تعبئة الـ Metadata إن وجدت
          const meta = placeData.metadata || {};
          setDescription(meta.description || "");
          setAddressDetails(meta.address_details || "");

          if (
            meta.phone_numbers &&
            Array.isArray(meta.phone_numbers) &&
            meta.phone_numbers.length > 0
          ) {
            setPhoneNumbers(meta.phone_numbers);
          } else {
            setPhoneNumbers([""]);
          }

          if (meta.photo_url) {
            setPhotoPreview(meta.photo_url);
          }
        })
        .catch((err) => {
          console.error("خطأ أثناء جلب بيانات المكان:", err);
          const errorMessage =
            err.response?.data?.message ||
            "المكان غير موجود أو ليس لديك صلاحية للوصول إليه.";
          dispatch(open({ state: "faild", title: errorMessage }));
        })
        .finally(() => {
          setFetchingPlace(false);
          dispatch(close());
        });
    }
  }, [placeId, dispatch]);

  // إدارة اختيار صورة المكان مع تنظيف ذاكرة الـ Preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (photoPreview && photoPreview.startsWith("blob:")) {
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

  // معالجة تسليم النموذج والتعديل عبر الباك إند
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!placeId) return;

    dispatch(loading());

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type", type);

    // تجميع الكائن الفرعي للمعلومات الإضافية (Metadata)
    const filteredPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p !== "");

    const metadata = {
      description: description.trim() || undefined,
      address_details: addressDetails.trim() || undefined,
      phone_numbers: filteredPhones,
      photo_url: currentPlace?.metadata?.photo_url, // الحفاظ على الصورة القديمة إن لم تتغير
    };

    formData.append("metadata", JSON.stringify(metadata));

    // إضافة الصورة الجديدة إذا تم اختيارها
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const response = await AxiosApi.put(
        `/auth/withlogin/places/place-manage/update/${placeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const updatedPlaceId = response.data?.place?._id || placeId;
      dispatch(
        open({ state: "success", title: "تم تحديث بيانات المكان بنجاح." }),
      );
      navigate(`/listlinks/places/place-layout/${updatedPlaceId}`);
    } catch (err: any) {
      console.error("خطأ أثناء تعديل المكان:", err);
      const errorMessage =
        err.response?.data?.message || "حدث خطأ أثناء تعديل المكان.";
      dispatch(open({ state: "faild", title: errorMessage }));
    }
  };

  if (fetchingPlace) {
    return null;
  }

  return (
    <div className="mx-auto dir-rtl" dir="rtl">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          تعديل بيانات المكان
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          تعديل تفاصيل المعطيات والمعلومات الخاصة بالمكان
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* اسم المكان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المكان <span className="text-red-500">*</span>
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
              {/* رفع / تغيير صورة المكان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صورة المكان
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer transition w-full justify-center">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span>
                      {photoFile ? photoFile.name : "تغيير الصورة..."}
                    </span>
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
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
