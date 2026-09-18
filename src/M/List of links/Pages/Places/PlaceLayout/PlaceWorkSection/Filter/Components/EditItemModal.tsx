import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Save,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  Layers,
  Radio,
  Tv,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { locationTypeLabels, LocationType } from "../../../../types";

export interface ISubTopic {
  name: string;
}

export interface IMainTopic {
  name: string;
  subTopics: string[];
}

export interface IScheduleItem {
  id: string;
  title: string;
  mainTopics: IMainTopic[];
}

export interface InstructorOption {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
}

interface EditItemModalProps {
  isOpen: boolean;
  item: any;
  activeTab: "plans" | "events";
  availableSchedules?: IScheduleItem[];
  instructors?: InstructorOption[];
  canCreateForOthers?: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  item,
  activeTab,
  availableSchedules = [],
  instructors = [],
  canCreateForOthers = false,
  onClose,
  onSave,
}) => {
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // console.log(item);
  const initialFormData = useMemo(() => {
    if (!item) return null;

    const rawDate = item.event_date || item.planned_date || "";
    let formattedDate = "";
    if (rawDate) {
      try {
        formattedDate = new Date(rawDate).toISOString().split("T")[0];
      } catch {
        formattedDate = rawDate;
      }
    }

    // استخراج بيانات المحاضر ومعرفه
    const instructorObj =
      typeof item.instructor_info === "object" ? item.instructor_info : null;
    const currentInstructorId =
      instructorObj?._id || item.instructor_id || item.instructor_info || "";
    const currentInstructorName = instructorObj
      ? `${instructorObj.first_name || ""} ${instructorObj.last_name || ""}`.trim()
      : item.executor_name || item.presenter_name || "";
    const currentInstructorAvatar = instructorObj?.avatar_url || "";

    return {
      ...item,
      schedule_name:
        item.schedule_name || item.scheduleId?.title || item.table_title || "",
      main_topic: item.main_topic || item.mainTopic || "",
      sub_topic: item.sub_topic || item.subTopic || "",
      date: formattedDate,
      location_type: item.location_type || "internal_seminar",
      external_location_name: item.external_location_name || "",
      instructor_info: currentInstructorId, // تخزين المعرف Hنا
      executor_name: currentInstructorName,
      executor_avatar: currentInstructorAvatar,
      count:
        item.target_seminars_count || item.seminars_count || item.count || 1,
      digital_media_activities_count: item.digital_media_activities_count || 0,
      media_outlets_count: item.media_outlets_count || 0,
      attendees: {
        males: item.target_attendees?.males ?? item.attendees?.males ?? 0,
        females: item.target_attendees?.females ?? item.attendees?.females ?? 0,
        children:
          item.target_attendees?.children ?? item.attendees?.children ?? 0,
      },
    };
  }, [item]);

  const [formData, setFormData] = useState<any>(initialFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(initialFormData);
    setErrorMessage(null);
  }, [initialFormData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsInstructorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !formData) return null;

  const uniqueScheduleNames = Array.from(
    new Set([
      ...availableSchedules.map((s) => s.title),
      ...(formData.schedule_name ? [formData.schedule_name] : []),
    ]),
  ).filter(Boolean);

  const availableMainTopics = Array.from(
    new Set([
      ...availableSchedules
        .filter(
          (s) => !formData.schedule_name || s.title === formData.schedule_name,
        )
        .flatMap((s) => s.mainTopics?.map((m) => m.name) || []),
      ...(formData.main_topic ? [formData.main_topic] : []),
    ]),
  ).filter(Boolean);

  const availableSubTopics = Array.from(
    new Set([
      ...availableSchedules
        .filter(
          (s) => !formData.schedule_name || s.title === formData.schedule_name,
        )
        .flatMap((s) => s.mainTopics || [])
        .filter((m) => m.name === formData.main_topic)
        .flatMap((m) => m.subTopics || []),
      ...(formData.sub_topic ? [formData.sub_topic] : []),
    ]),
  ).filter(Boolean);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScheduleTitle = e.target.value;
    const selectedSchedule = availableSchedules.find(
      (s) => s.title === newScheduleTitle,
    );
    const firstMainTopic = selectedSchedule?.mainTopics?.[0];
    const firstSubTopic = firstMainTopic?.subTopics?.[0] || "";

    setFormData((prev: any) => ({
      ...prev,
      schedule_name: newScheduleTitle,
      main_topic: firstMainTopic?.name || "",
      sub_topic: firstSubTopic,
    }));
  };

  const handleMainTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMainTopicName = e.target.value;
    const currentSchedule = availableSchedules.find(
      (s) => s.title === formData.schedule_name,
    );
    const selectedMainTopic = currentSchedule?.mainTopics?.find(
      (m) => m.name === newMainTopicName,
    );

    const fallbackMainTopic = availableSchedules
      .flatMap((s) => s.mainTopics || [])
      .find((m) => m.name === newMainTopicName);

    const firstSubTopic =
      selectedMainTopic?.subTopics?.[0] ||
      fallbackMainTopic?.subTopics?.[0] ||
      "";

    setFormData((prev: any) => ({
      ...prev,
      main_topic: newMainTopicName,
      sub_topic: firstSubTopic,
    }));
  };

  // تم تحديث الدالة لتقبل المعرف (id) بالإضافة للاسم والصورة
  const selectInstructor = (id: string, name: string, avatar?: string) => {
    setFormData((prev: any) => ({
      ...prev,
      instructor_info: id,
      instructor_id: id,
      executor_name: name,
      executor_avatar: avatar || "",
    }));
    setIsInstructorDropdownOpen(false);
  };

  const handleAttendeeChange = (field: string, value: number) => {
    const numValue = Math.max(0, isNaN(value) ? 0 : value);
    setFormData((prev: any) => ({
      ...prev,
      attendees: {
        ...prev.attendees,
        [field]: numValue,
      },
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.main_topic || !formData.sub_topic) {
      setErrorMessage("يرجى اختيار الموضوع الرئيسي والفرعي.");
      return false;
    }
    if (!formData.date) {
      setErrorMessage("يرجى تحديد التاريخ.");
      return false;
    }
    if (activeTab === "events" && !formData.executor_name?.trim()) {
      setErrorMessage("يرجى اختيار أو إدخال اسم القائم بالندوة/الفعالية.");
      return false;
    }
    if (
      ["external_seminar", "convoy_seminars", "public_meeting"].includes(
        formData.location_type,
      ) &&
      !formData.external_location_name?.trim()
    ) {
      setErrorMessage("يرجى إدخال اسم المكان الخارجي.");
      return false;
    }

    const totalAttendees =
      (formData.attendees.males || 0) +
      (formData.attendees.females || 0) +
      (formData.attendees.children || 0);

    if (totalAttendees <= 0) {
      setErrorMessage("يجب إدخال عدد الحضور (على الأقل فئة واحدة أكثر من 0).");
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData };
    payload.mainTopic = formData.main_topic;
    payload.subTopic = formData.sub_topic;

    if (activeTab === "plans") {
      payload.planned_date = formData.date;
      payload.target_seminars_count = formData.count;
      payload.target_attendees = formData.attendees;
    } else {
      payload.event_date = formData.date;
      payload.seminars_count = formData.count;
      payload.attendees = formData.attendees;
      payload.executor_name = formData.executor_name;
      // إرسال معرف المحاضر صراحةً
      payload.instructor_info =
        formData.instructor_info || formData.instructor_id;
      payload.instructor_id =
        formData.instructor_info || formData.instructor_id;
    }

    onSave(payload);
  };

  const isCurrentInstructorNotInList =
    formData.executor_name &&
    !instructors.some(
      (ins) =>
        `${ins.first_name} ${ins.last_name}`.trim() === formData.executor_name,
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 my-auto text-right font-sans relative max-h-[90vh] flex flex-col">
        {/* الهيدر */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              تعديل بيانات{" "}
              {activeTab === "plans" ? "الخطة المقررة" : "الفعالية المنفذة"}
            </span>
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* رسالة الخطأ */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold shrink-0">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* النموذج - قابل للتمرير داخل المودال */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-xs overflow-y-auto custom-scrollbar pl-1 pr-0.5 flex-1"
        >
          {/* قسم جدول الخطة/المواضيع */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-3">
            {uniqueScheduleNames.length > 0 && (
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />{" "}
                  اسم الجدول
                </label>
                <select
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
                  value={formData.schedule_name}
                  onChange={handleScheduleChange}
                >
                  <option value="" className="dark:bg-gray-800">
                    -- اختر اسم الجدول --
                  </option>
                  {uniqueScheduleNames.map((sName) => (
                    <option
                      key={sName}
                      value={sName}
                      className="dark:bg-gray-800"
                    >
                      {sName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />{" "}
                  الموضوع الرئيسي
                </label>
                {availableMainTopics.length > 0 ? (
                  <select
                    required
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
                    value={formData.main_topic}
                    onChange={handleMainTopicChange}
                  >
                    <option value="" className="dark:bg-gray-800">
                      -- اختر الموضوع الرئيسي --
                    </option>
                    {availableMainTopics.map((mTopic) => (
                      <option
                        key={mTopic}
                        value={mTopic}
                        className="dark:bg-gray-800"
                      >
                        {mTopic}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    value={formData.main_topic}
                    onChange={(e) =>
                      setFormData({ ...formData, main_topic: e.target.value })
                    }
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  الموضوع الفرعي
                </label>
                {availableSubTopics.length > 0 ? (
                  <select
                    required
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
                    value={formData.sub_topic}
                    onChange={(e) =>
                      setFormData({ ...formData, sub_topic: e.target.value })
                    }
                  >
                    <option value="" className="dark:bg-gray-800">
                      -- اختر الموضوع الفرعي --
                    </option>
                    {availableSubTopics.map((sTopic) => (
                      <option
                        key={sTopic}
                        value={sTopic}
                        className="dark:bg-gray-800"
                      >
                        {sTopic}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    value={formData.sub_topic}
                    onChange={(e) =>
                      setFormData({ ...formData, sub_topic: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* القائم بالفعالية */}
          {activeTab === "events" && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 sm:p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-2">
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />{" "}
                القائم بالندوة / الفعالية
              </label>

              {canCreateForOthers ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsInstructorDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 focus:ring-2 focus:ring-amber-500 transition-all text-right"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-950 flex-shrink-0 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                        {formData.executor_avatar ? (
                          <img
                            src={formData.executor_avatar}
                            alt={formData.executor_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <span className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate">
                        {formData.executor_name || "-- اختر القائم بالندوة --"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform ${
                        isInstructorDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isInstructorDropdownOpen && (
                    <div className="absolute right-0 left-0 mt-1 bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {isCurrentInstructorNotInList && (
                        <button
                          type="button"
                          onClick={() =>
                            selectInstructor(
                              formData.instructor_info ||
                                formData.instructor_id,
                              formData.executor_name,
                              formData.executor_avatar,
                            )
                          }
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-right"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900 flex-shrink-0 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                            {formData.executor_avatar ? (
                              <img
                                src={formData.executor_avatar}
                                alt={formData.executor_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                              {formData.executor_name}
                            </div>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              (المُسجل حالياً)
                            </span>
                          </div>
                        </button>
                      )}

                      {instructors.map((ins) => {
                        const fullName =
                          `${ins.first_name} ${ins.last_name}`.trim();
                        return (
                          <button
                            key={ins._id}
                            type="button"
                            onClick={() =>
                              selectInstructor(
                                ins._id,
                                fullName,
                                ins.avatar_url,
                              )
                            }
                            className={`w-full flex items-center gap-3 p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-right ${
                              formData.executor_name === fullName
                                ? "bg-amber-50/80 dark:bg-amber-950/60 font-bold"
                                : ""
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900 flex-shrink-0 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                              {ins.avatar_url ? (
                                <img
                                  src={ins.avatar_url}
                                  alt={fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate">
                                {fullName}
                              </div>
                              {ins.email && (
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                  {ins.email}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900 flex-shrink-0 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                    {formData.executor_avatar ? (
                      <img
                        src={formData.executor_avatar}
                        alt={formData.executor_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent font-semibold text-xs text-gray-700 dark:text-gray-300 outline-none cursor-not-allowed"
                    value={formData.executor_name || "غير محدد"}
                  />
                </div>
              )}
            </div>
          )}

          {/* التاريخ والعدد */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />{" "}
                التاريخ
              </label>
              <input
                type="date"
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                عدد الأنشطة / الفعاليات
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-bold text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
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

          {/* نوع المكان والموقع الخارجي */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />{" "}
                  نوع / مكان الفعالية
                </label>
                <select
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs"
                  value={formData.location_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location_type: e.target.value as LocationType,
                    })
                  }
                >
                  {locationTypeLabels ? (
                    Object.entries(locationTypeLabels).map(([key, label]) => (
                      <option
                        key={key}
                        value={key}
                        className="dark:bg-gray-800"
                      >
                        {label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option
                        value="internal_seminar"
                        className="dark:bg-gray-800"
                      >
                        ندوة داخلية
                      </option>
                      <option
                        value="external_seminar"
                        className="dark:bg-gray-800"
                      >
                        ندوة خارجية
                      </option>
                      <option
                        value="general_consultation"
                        className="dark:bg-gray-800"
                      >
                        مشورة عامة
                      </option>
                      <option
                        value="public_meeting"
                        className="dark:bg-gray-800"
                      >
                        لقاء جماهيري
                      </option>
                      <option
                        value="convoy_seminars"
                        className="dark:bg-gray-800"
                      >
                        ندوات قوافل
                      </option>
                    </>
                  )}
                </select>
              </div>

              {[
                "external_seminar",
                "convoy_seminars",
                "public_meeting",
              ].includes(formData.location_type) && (
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    اسم أو عنوان المكان الخارجي
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قاعة المؤتمرات - مركز الشباب..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    value={formData.external_location_name}
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

          {/* الوسائل الإعلامية */}
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 sm:p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
            <label className="block font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
              <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />{" "}
              الأنشطة والوسائل الإعلامية المرافقة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Tv className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />{" "}
                  عدد استخدام الوسائل الإعلامية
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs"
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
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />{" "}
                  عدد الأنشطة الإعلامية الرقمية
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs"
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

          {/* أعداد الحضور */}
          <div className="bg-gray-50 dark:bg-gray-700/40 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
            <label className="block font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />{" "}
              أعداد الحضور
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 truncate">
                  👨 ذكور
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs"
                  value={formData.attendees.males}
                  onChange={(e) =>
                    handleAttendeeChange("males", parseInt(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 truncate">
                  👩 إناث
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs"
                  value={formData.attendees.females}
                  onChange={(e) =>
                    handleAttendeeChange("females", parseInt(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 truncate">
                  👶 أطفال
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs"
                  value={formData.attendees.children}
                  onChange={(e) =>
                    handleAttendeeChange("children", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
