import React, { useId, useState } from "react";
import {
  X,
  Save,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  Layers,
  PlusCircle,
  Radio,
  Tv,
} from "lucide-react";
import type {
  IGroupedSeminar,
} from "./PlaceCreate/CreatePlacePlanContainer";
import type { LocationType } from "../../../types";

export interface ITargetAttendees {
  males: number;
  females: number;
  children: number;
}

export interface IServerAvailableTopic {
  schedule_name: string;
  main_topic: string;
  sub_topics: string[];
}

interface SeminarModalProps {
  seminar: IGroupedSeminar | null; // إذا كان null فهذا يعني إضافة ندوة جديدة
  availableSchedules: IServerAvailableTopic[];
  onClose: () => void;
  onSave: (savedSeminar: IGroupedSeminar) => void;
}

// القيم الافتراضية لإضافة ندوة جديدة
const initialFormState: IGroupedSeminar = {
  id: "",
  schedule_name: "",
  main_topic: "",
  sub_topic: "",
  planned_date: "",
  location_type: "internal_seminar",
  external_location_name: "",
  media_outlets_count: 0,
  digital_media_activities_count: 0,
  target_attendees: { males: 0, females: 0, children: 0 },
  count: 1,
};

export const SeminarModal: React.FC<SeminarModalProps> = ({
  seminar,
  availableSchedules,
  onClose,
  onSave,
}) => {
  const isEditMode = seminar && seminar.id !== "new";

  // console.log({ availableSchedules });
  const temporaryId = useId();

  // console.log({ seminar });

  const [formData, setFormData] = useState<IGroupedSeminar>(() =>
    seminar
      ? { ...seminar }
      : { ...initialFormState, id: `temp_${temporaryId}` },
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // أسماء الجداول المتاحة بدون تكرار مع التناغم مع القيمة الموجودة مسبقاً
  const uniqueScheduleNames = Array.from(
    new Set([
      ...availableSchedules.map((s) => s.schedule_name),
      ...(formData.schedule_name ? [formData.schedule_name] : []),
    ]),
  ).filter(Boolean);

  // المواضيع الرئيسية المتاحة بناءً على اسم الجدول المختار
  const availableMainTopics = Array.from(
    new Set([
      ...availableSchedules
        .filter((s) => s.schedule_name === formData.schedule_name)
        .map((s) => s.main_topic),
      ...(formData.main_topic ? [formData.main_topic] : []),
    ]),
  ).filter(Boolean);

  // المواضيع الفرعية المتاحة بناءً على الجدول والموضوع الرئيسي المختارين
  const rawSubTopics =
    availableSchedules.find(
      (s) =>
        s.schedule_name === formData.schedule_name &&
        s.main_topic === formData.main_topic,
    )?.sub_topics || [];

  const availableSubTopics = Array.from(
    new Set([
      ...rawSubTopics,
      ...(formData.sub_topic ? [formData.sub_topic] : []),
    ]),
  ).filter(Boolean);

  // عند تغيير اسم الجدول
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSchedule = e.target.value;
    const matchingMainTopicObj = availableSchedules.find(
      (s) => s.schedule_name === newSchedule,
    );
    const newMainTopic = matchingMainTopicObj?.main_topic || "";
    const newSubTopic = matchingMainTopicObj?.sub_topics[0] || "";

    setFormData((prev) => ({
      ...prev,
      schedule_name: newSchedule,
      main_topic: newMainTopic,
      sub_topic: newSubTopic,
    }));
  };

  // عند تغيير الموضوع الرئيسي
  const handleMainTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMainTopic = e.target.value;
    const matchingObj = availableSchedules.find(
      (s) =>
        s.schedule_name === formData.schedule_name &&
        s.main_topic === newMainTopic,
    );
    const newSubTopic = matchingObj?.sub_topics[0] || "";

    setFormData((prev) => ({
      ...prev,
      main_topic: newMainTopic,
      sub_topic: newSubTopic,
    }));
  };

  // عند تغيير الموضوع الفرعي
  const handleSubTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      sub_topic: e.target.value,
    }));
  };

  // التحقق من صحة البيانات بصرامة
  const validateForm = (): boolean => {
    if (!formData.schedule_name) {
      setErrorMessage("يرجى اختيار اسم الجدول.");
      return false;
    }
    if (!formData.main_topic) {
      setErrorMessage("يرجى اختيار الموضوع الرئيسي.");
      return false;
    }
    if (!formData.sub_topic) {
      setErrorMessage("يرجى اختيار الموضوع الفرعي.");
      return false;
    }
    if (!formData.planned_date) {
      setErrorMessage("يرجى تحديد تاريخ الفعالية.");
      return false;
    }
    if (
      (formData.location_type === "external_seminar" ||
        formData.location_type === "convoy_seminars" ||
        formData.location_type === "public_meeting") &&
      !formData.external_location_name?.trim()
    ) {
      setErrorMessage("يرجى إدخال اسم المكان الخارجي.");
      return false;
    }

    // التأكد من أن إجمالي عدد الحضور أكبر من 0
    const totalAttendees =
      (formData.target_attendees.males || 0) +
      (formData.target_attendees.females || 0) +
      (formData.target_attendees.children || 0);

    if (totalAttendees <= 0) {
      setErrorMessage(
        "يجب إدخال عدد الحضور المستهدفين (على الأقل فئة واحدة أكثر من 0).",
      );
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // console.log({ formData });
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-2xl p-6 space-y-5 my-8 text-right font-sans relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {isEditMode ? (
              <Calendar className="w-5 h-5 text-blue-600" />
            ) : (
              <PlusCircle className="w-5 h-5 text-green-600" />
            )}
            {isEditMode ? "تعديل بيانات الفعالية" : "إضافة فعالية جديدة"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* رسالة الخطأ إن وجدت */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* الاختيارات التسلسلية: اسم الجدول -> الموضوع الرئيسي -> الموضوع الفرعي */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> اسم الجدول
              </label>
              <select
                required
                className="w-full border rounded-lg p-2 font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={formData.schedule_name}
                onChange={handleScheduleChange}
              >
                <option value="">-- اختر اسم الجدول --</option>
                {uniqueScheduleNames.map((sName) => (
                  <option key={sName} value={sName}>
                    {sName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> الموضوع
                  الرئيسي
                </label>
                <select
                  required
                  disabled={!formData.schedule_name}
                  className="w-full border rounded-lg p-2 font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                  value={formData.main_topic}
                  onChange={handleMainTopicChange}
                >
                  <option value="">-- اختر الموضوع الرئيسي --</option>
                  {availableMainTopics.map((mTopic) => (
                    <option key={mTopic} value={mTopic}>
                      {mTopic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  الموضوع الفرعي
                </label>
                <select
                  required
                  disabled={!formData.main_topic}
                  className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                  value={formData.sub_topic}
                  onChange={handleSubTopicChange}
                >
                  <option value="">-- اختر الموضوع الفرعي --</option>
                  {availableSubTopics.map((sTopic) => (
                    <option key={sTopic} value={sTopic}>
                      {sTopic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* التاريخ والعدد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> التاريخ
              </label>
              <input
                type="date"
                required
                className="w-full border rounded-lg p-2 font-mono outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.planned_date}
                onChange={(e) =>
                  setFormData({ ...formData, planned_date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                عدد الأنشطة المتطابقة (العدد)
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full border rounded-lg p-2 font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    count: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
              />
            </div>
          </div>

          {/* المكان ونوع الفعالية */}
          <div className="border-t pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> نوع / مكان
                  الفعالية
                </label>
                <select
                  className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                  value={formData.location_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location_type: e.target.value as LocationType,
                    })
                  }
                >
                  <option value="internal_seminar">ندوة داخلية</option>
                  <option value="external_seminar">ندوة خارجية</option>
                  <option value="general_consultation">مشورة عامة</option>
                  <option value="public_meeting">لقاء جماهيري</option>
                  <option value="convoy_seminars">ندوات قوافل</option>
                </select>
              </div>

              {(formData.location_type === "external_seminar" ||
                formData.location_type === "convoy_seminars" ||
                formData.location_type === "public_meeting") && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    اسم أو عنوان المكان الخارجي
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قاعة المؤتمرات - مركز الشباب..."
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.external_location_name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        external_location_name: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* التغطية الإعلامية */}
          <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-2">
            <label className="block font-bold text-purple-900 flex items-center gap-1">
              <Radio className="w-4 h-4 text-purple-600" /> الأنشطة والوسائل
              الإعلامية المرافقة:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Tv className="w-3 h-3 text-purple-600" /> عدد استخدام الوسائل
                  الإعلامية
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-1.5 font-bold bg-white"
                  value={formData.media_outlets_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      media_outlets_count: Math.max(
                        0,
                        parseInt(e.target.value) || 0,
                      ),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-purple-600" /> عدد الأنشطة
                  الإعلامية الرقمية
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-1.5 font-bold bg-white"
                  value={formData.digital_media_activities_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      digital_media_activities_count: Math.max(
                        0,
                        parseInt(e.target.value) || 0,
                      ),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* الحضور المستهدف */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-700 flex items-center gap-1">
              <Users className="w-4 h-4 text-indigo-600" /> أعداد الحضور
              المستهدفين
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  👨 ذكور
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-1.5 font-bold bg-white"
                  value={formData.target_attendees.males}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_attendees: {
                        ...formData.target_attendees,
                        males: Math.max(0, parseInt(e.target.value) || 0),
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  👩 إناث
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-1.5 font-bold bg-white"
                  value={formData.target_attendees.females}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_attendees: {
                        ...formData.target_attendees,
                        females: Math.max(0, parseInt(e.target.value) || 0),
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  👶 أطفال
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-1.5 font-bold bg-white"
                  value={formData.target_attendees.children}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_attendees: {
                        ...formData.target_attendees,
                        children: Math.max(0, parseInt(e.target.value) || 0),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-lg font-bold shadow flex items-center gap-1.5 transition-colors ${
                isEditMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <Save className="w-4 h-4" />
              {isEditMode ? "حفظ التعديلات" : "إضافة الصف"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
