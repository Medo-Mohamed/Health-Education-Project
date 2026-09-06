import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BookOpen,
  FileText,
  Layers,
  Hash,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Info,
  Lock,
  Loader2,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../../store";
import AxiosApi from "../../../../../../../AxiosApi";
import { LocationType } from "../../../types";

interface Row {
  _id?: string;
  mainTopic: string;
  supTopic: string;
  comments?: string;
  text_color?: string;
  bg_color?: string;
}

interface Table {
  _id: string;
  title: string;
  description?: string;
  table_rows?: Row[];
}

interface Instructor {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
}

interface CurrentUser {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
}

const LOCAL_STORAGE_KEY = "last_place_event_settings";

export const CreatePlaceEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // جلب بيانات المستخدم من Redux State
  const reduxUser = useSelector((state: RootState) => state.User?.data?.user);

  // حالات الصلاحيات والحالة العامة
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [canCreateForOthers, setCanCreateForOthers] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // حالة التحكم بإغلاق/فتح قائمة المحاضرين
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] =
    useState(false);
  const instructorDropdownRef = useRef<HTMLDivElement>(null);

  // حالات الجداول والمواضيع والمحاضرين
  const [schedules, setSchedules] = useState<{ _id: string; title: string }[]>(
    [],
  );
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // حالات تفاصيل الجدول المحدد
  const [selectedTableData, setSelectedTableData] = useState<Table | null>(
    null,
  );
  const [availableMainTopics, setAvailableMainTopics] = useState<string[]>([]);
  const [availableSubTopics, setAvailableSubTopics] = useState<Row[]>([]);
  const [selectedSubTopicDetails, setSelectedSubTopicDetails] =
    useState<Row | null>(null);

  const [fetchingTableDetails, setFetchingTableDetails] = useState(false);

  // حالة نموذج البيانات
  const [formData, setFormData] = useState({
    schedule_id: "",
    main_topic: "",
    sub_topic: "",
    seminars_count: 1,
    location_type: LocationType.INTERNAL_SEMINAR as LocationType,
    external_location_name: "",
    attendees: {
      males: 0,
      females: 0,
      children: 0,
    },
    instructor_info: "",
    event_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // إغلاق قائمة المحاضرين عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        instructorDropdownRef.current &&
        !instructorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsInstructorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // إجمالي الحضور
  const totalAttendees =
    Number(formData.attendees.males) +
    Number(formData.attendees.females) +
    Number(formData.attendees.children);

  // تحديد ما إذا كان النوع يتطلب مكان خارجي بحسب الشروط المسجلة في الفنكشن
  const requiresExternalLocation =
    formData.location_type === LocationType.EXTERNAL_SEMINAR ||
    formData.location_type === LocationType.PUBLIC_MEETING ||
    formData.location_type === LocationType.CONVOY_SEMINARS;

  // 1️⃣ التحقق من الصلاحيات وجلب البيانات الأساسية
  useEffect(() => {
    const checkPermissionsAndLoadData = async () => {
      if (!id) return;
      try {
        setCheckingAuth(true);
        const res = await AxiosApi.get(
          `/auth/withlogin/places/place-events/check-can-create/${id}`,
        );
        const data = res.data;

        if (data.canCreate) {
          setHasPermission(true);
          setCanCreateForOthers(!!data.canCreateForOthers);

          const activeUser = data.user || reduxUser;
          setCurrentUser(activeUser);

          const fetchedInstructors: Instructor[] = Array.isArray(
            data.instructors,
          )
            ? data.instructors
            : [];
          const fetchedTables: { _id: string; title: string }[] = Array.isArray(
            data.tables,
          )
            ? data.tables
            : [];

          setInstructors(fetchedInstructors);
          setSchedules(fetchedTables);

          // استعادة الإعدادات السابقة من LocalStorage
          const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
          let savedParsed: any = {};
          if (savedSettings) {
            try {
              savedParsed = JSON.parse(savedSettings);
            } catch (e) {
              console.error("خطأ في قراءة بيانات LocalStorage", e);
            }
          }

          let initialScheduleId = "";
          if (
            savedParsed.schedule_id &&
            fetchedTables.some((t) => t._id === savedParsed.schedule_id)
          ) {
            initialScheduleId = savedParsed.schedule_id;
          } else {
            initialScheduleId = fetchedTables[0]?._id || "";
          }

          let initialInstructor = "";
          if (data.canCreateForOthers) {
            if (
              savedParsed.instructor_info &&
              fetchedInstructors.some(
                (i) => i._id === savedParsed.instructor_info,
              )
            ) {
              initialInstructor = savedParsed.instructor_info;
            } else {
              initialInstructor =
                activeUser?._id || fetchedInstructors[0]?._id || "";
            }
          } else {
            initialInstructor = activeUser?._id || "";
          }

          setFormData((prev) => ({
            ...prev,
            schedule_id: initialScheduleId,
            instructor_info: initialInstructor,
            location_type: savedParsed.location_type || prev.location_type,
            external_location_name: savedParsed.external_location_name || "",
          }));
        } else {
          setHasPermission(false);
        }
      } catch (err: any) {
        console.error("خطأ في التحقق من الصلاحيات:", err);
        setHasPermission(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkPermissionsAndLoadData();
  }, [id, reduxUser]);

  // 2️⃣ جلب تفاصيل الجدول المختار
  useEffect(() => {
    if (!formData.schedule_id) {
      setSelectedTableData(null);
      setAvailableMainTopics([]);
      return;
    }

    const fetchTableDetails = async () => {
      try {
        setFetchingTableDetails(true);
        const res = await AxiosApi.get(
          `/auth/withlogin/topictabels/displayonetable/${formData.schedule_id}`,
        );

        const tableData: Table = res.data?.data || res.data;

        if (tableData && Array.isArray(tableData.table_rows)) {
          setSelectedTableData(tableData);

          const mainTopics = Array.from(
            new Set(tableData.table_rows.map((row) => row.mainTopic)),
          );
          setAvailableMainTopics(mainTopics);
        } else {
          setSelectedTableData(null);
          setAvailableMainTopics([]);
        }
      } catch (err) {
        console.error("خطأ في جلب تفاصيل الجدول:", err);
        setSelectedTableData(null);
        setAvailableMainTopics([]);
      } finally {
        setFetchingTableDetails(false);
      }
    };

    fetchTableDetails();
  }, [formData.schedule_id]);

  // 3️⃣ فلترة المواضيع الفرعية عند تغيير الموضوع الرئيسي
  useEffect(() => {
    if (selectedTableData && formData.main_topic) {
      const filteredSubTopics =
        selectedTableData.table_rows?.filter(
          (row) => row.mainTopic === formData.main_topic,
        ) || [];
      setAvailableSubTopics(filteredSubTopics);
    } else {
      setAvailableSubTopics([]);
    }
  }, [formData.main_topic, selectedTableData]);

  // 4️⃣ تحديد تفاصيل الموضوع الفرعي
  useEffect(() => {
    if (formData.sub_topic && availableSubTopics.length > 0) {
      const subDetails =
        availableSubTopics.find((row) => row.supTopic === formData.sub_topic) ||
        null;
      setSelectedSubTopicDetails(subDetails);
    } else {
      setSelectedSubTopicDetails(null);
    }
  }, [formData.sub_topic, availableSubTopics]);

  // التعامل مع تغيير مدخلات النموذج
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "schedule_id") {
        updated.main_topic = "";
        updated.sub_topic = "";
      } else if (name === "main_topic") {
        updated.sub_topic = "";
      }

      return updated;
    });
  };

  // التعامل مع أعداد الحضور
  const handleAttendeesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "males" | "females" | "children",
  ) => {
    const rawVal = e.target.value;
    const value = rawVal === "" ? 0 : Math.max(0, parseInt(rawVal, 10) || 0);
    setFormData((prev) => ({
      ...prev,
      attendees: {
        ...prev.attendees,
        [type]: value,
      },
    }));
  };

  // جلب المحاضر المحدد حالياً
  const selectedInstructorObj = canCreateForOthers
    ? instructors.find((inst) => inst._id === formData.instructor_info)
    : currentUser;

  // إرسال البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (totalAttendees <= 0) {
      setError("لابد أن يكون هناك حضور في الندوة (شخص واحد على الأقل).");
      return;
    }

    if (!formData.instructor_info) {
      setError("يرجى تحديد محاضر الفعالية.");
      return;
    }

    if (requiresExternalLocation && !formData.external_location_name.trim()) {
      setError("اسم المكان الخارجي مطلوب لهذا النوع من الأنشطة.");
      return;
    }

    try {
      setLoading(true);
      await AxiosApi.post(
        `/auth/withlogin/places/place-events/save-event/${id}`,
        {
          place_id: id,
          schedule_id: formData.schedule_id,
          schedule_name: selectedTableData?.title || "",
          main_topic: formData.main_topic,
          sub_topic: formData.sub_topic,
          seminars_count: Number(formData.seminars_count),
          location_type: formData.location_type,
          external_location_name: requiresExternalLocation
            ? formData.external_location_name
            : null,
          attendees: formData.attendees,
          instructor_info: formData.instructor_info,
          event_date: formData.event_date,
        },
      );

      const settingsToSave = {
        schedule_id: formData.schedule_id,
        instructor_info: formData.instructor_info,
        location_type: formData.location_type,
        external_location_name: formData.external_location_name,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settingsToSave));

      setSuccess("تم إدخال الندوة وتحديث التفضيلات بنجاح!");

      setFormData((prev) => ({
        ...prev,
        main_topic: "",
        sub_topic: "",
        seminars_count: 1,
        attendees: { males: 0, females: 0, children: 0 },
        event_date: new Date().toISOString().split("T")[0],
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message || "حدث خطأ أثناء حفظ الندوة.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">
          جاري التحقق من الصلاحيات والبيانات...
        </p>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div
        className="max-w-xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center dir-rtl"
        dir="rtl"
      >
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">
          غير مصرح لك بالإجراء
        </h2>
        <p className="text-sm text-red-600 mb-6">
          عذراً، لا تملك الصلاحية اللازمة لإضافة ندوات جديدة لهذا المكان.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          العودة للخلف
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto dir-rtl" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between mb-4 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            إضافة ندوة / فعالية جديدة
          </h1>
        </div>
      </div>

      {/* التنبيهات */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-r-4 border-green-500 text-green-700 rounded flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* النموذج */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اختيار اسم جدول العمل */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اسم جدول العمل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              <select
                name="schedule_id"
                value={formData.schedule_id}
                onChange={handleChange}
                required
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- اختر جدول العمل --</option>
                {schedules.map((sch) => (
                  <option key={sch._id} value={sch._id}>
                    {sch.title}
                  </option>
                ))}
              </select>
            </div>
            {fetchingTableDetails && (
              <span className="text-xs text-indigo-600 mt-1 block">
                جاري تحميل موضوعات الجدول...
              </span>
            )}
          </div>

          {/* اختيار المحاضر المخصص */}
          <div ref={instructorDropdownRef} className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              محاضر الفعالية <span className="text-red-500">*</span>
            </label>

            {canCreateForOthers ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsInstructorDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between pr-3 pl-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedInstructorObj?.avatar_url ? (
                      <img
                        src={selectedInstructorObj.avatar_url}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-sm text-gray-800 font-medium truncate">
                      {selectedInstructorObj
                        ? `${selectedInstructorObj.first_name} ${selectedInstructorObj.last_name}`
                        : "-- اختر المحاضر --"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </button>

                {isInstructorDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {instructors.map((inst) => (
                      <div
                        key={inst._id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            instructor_info: inst._id,
                          }));
                          setIsInstructorDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 p-2.5 cursor-pointer transition hover:bg-indigo-50 ${
                          formData.instructor_info === inst._id
                            ? "bg-indigo-50/70 font-semibold"
                            : ""
                        }`}
                      >
                        {inst.avatar_url ? (
                          <img
                            src={inst.avatar_url}
                            alt={`${inst.first_name}`}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <UserIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-gray-800 truncate">
                            {inst.first_name} {inst.last_name}
                          </span>
                          {inst.email && (
                            <span className="text-xs text-gray-400 truncate">
                              {inst.email}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pr-3 pl-3 py-2 border border-gray-200 bg-gray-50 rounded-lg">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm text-gray-600 font-semibold truncate">
                  {currentUser
                    ? `${currentUser.first_name} ${currentUser.last_name} (أنت)`
                    : ""}
                </span>
              </div>
            )}
          </div>

          {/* الموضوع الرئيسي */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الموضوع الرئيسي <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Layers className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              <select
                name="main_topic"
                value={formData.main_topic}
                onChange={handleChange}
                required
                disabled={
                  !formData.schedule_id || availableMainTopics.length === 0
                }
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.schedule_id
                    ? "-- اختر جدول العمل أولاً --"
                    : "-- اختر الموضوع الرئيسي --"}
                </option>
                {availableMainTopics.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* الموضوع الفرعي */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الموضوع الفرعي <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              <select
                name="sub_topic"
                value={formData.sub_topic}
                onChange={handleChange}
                required
                disabled={
                  !formData.main_topic || availableSubTopics.length === 0
                }
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.main_topic
                    ? "-- اختر الموضوع الرئيسي أولاً --"
                    : "-- اختر الموضوع الفرعي --"}
                </option>
                {availableSubTopics.map((row, index) => (
                  <option key={row._id || index} value={row.supTopic}>
                    {row.supTopic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* صندوق عرض الملاحظات الخاص بالـ SubTopic */}
        {selectedSubTopicDetails && selectedSubTopicDetails.comments && (
          <div
            className="p-4 rounded-lg border flex items-start gap-3 shadow-sm transition-all"
            style={{
              backgroundColor: selectedSubTopicDetails.bg_color || "#f9fafb",
              color: selectedSubTopicDetails.text_color || "#1f2937",
              borderColor: selectedSubTopicDetails.text_color
                ? `${selectedSubTopicDetails.text_color}40`
                : "#e5e7eb",
            }}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm mb-1">
                ملاحظات حول الموضوع الفرعي:
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {selectedSubTopicDetails.comments}
              </p>
            </div>
          </div>
        )}

        {/* قسم تاريخ الفعالية وعدد الندوات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              عدد الندوات <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="number"
                name="seminars_count"
                min="1"
                value={formData.seminars_count}
                onChange={handleChange}
                required
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تاريخ الندوة / الفعالية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* قسم موقع الانعقاد المحدث بخيارات الـ 5 المتاحة */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            موقع انعقاد الندوة <span className="text-red-500">*</span>
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* ندوة داخلية */}
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer font-medium text-xs transition ${
                  formData.location_type === LocationType.INTERNAL_SEMINAR
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="location_type"
                  value={LocationType.INTERNAL_SEMINAR}
                  checked={
                    formData.location_type === LocationType.INTERNAL_SEMINAR
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                ندوة داخلية
              </label>

              {/* ندوة خارجية */}
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer font-medium text-xs transition ${
                  formData.location_type === LocationType.EXTERNAL_SEMINAR
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="location_type"
                  value={LocationType.EXTERNAL_SEMINAR}
                  checked={
                    formData.location_type === LocationType.EXTERNAL_SEMINAR
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                ندوة خارجية
              </label>

              {/* مشورة عامة */}
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer font-medium text-xs transition ${
                  formData.location_type === LocationType.GENERAL_CONSULTATION
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="location_type"
                  value={LocationType.GENERAL_CONSULTATION}
                  checked={
                    formData.location_type === LocationType.GENERAL_CONSULTATION
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                مشورة عامة
              </label>

              {/* لقاء جماهيري */}
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer font-medium text-xs transition ${
                  formData.location_type === LocationType.PUBLIC_MEETING
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="location_type"
                  value={LocationType.PUBLIC_MEETING}
                  checked={
                    formData.location_type === LocationType.PUBLIC_MEETING
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                لقاء جماهيري
              </label>

              {/* ندوات قوافل */}
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer font-medium text-xs transition ${
                  formData.location_type === LocationType.CONVOY_SEMINARS
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="location_type"
                  value={LocationType.CONVOY_SEMINARS}
                  checked={
                    formData.location_type === LocationType.CONVOY_SEMINARS
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                ندوات قوافل
              </label>
            </div>

            {/* إظهار اسم المكان الخارجي للأنواع الثلاثة المطلوبة بـ Backend */}
            {requiresExternalLocation && (
              <div className="relative mt-2">
                <MapPin className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  name="external_location_name"
                  value={formData.external_location_name}
                  onChange={handleChange}
                  required={requiresExternalLocation}
                  placeholder="اكتب اسم المكان الخارجي..."
                  className="w-full pr-10 pl-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-indigo-50/30 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* تفكيك الحضور */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              تفكيك أعداد الحضور
            </h3>
            <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
              إجمالي الحضور: {totalAttendees}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                الرجال
              </label>
              <input
                type="number"
                min="0"
                value={formData.attendees.males}
                onChange={(e) => handleAttendeesChange(e, "males")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                النساء
              </label>
              <input
                type="number"
                min="0"
                value={formData.attendees.females}
                onChange={(e) => handleAttendeesChange(e, "females")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                الأطفال
              </label>
              <input
                type="number"
                min="0"
                value={formData.attendees.children}
                onChange={(e) => handleAttendeesChange(e, "children")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* زر الإرسال */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition disabled:bg-indigo-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ الندوة"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
