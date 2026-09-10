import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  ShieldAlert,
  X,
  ListPlus,
  CalendarDays,
  CalendarOff,
  Users,
  MapPin,
  Clock,
  Radio,
  Tv,
} from "lucide-react";
import AxiosApi from "../../../../../../../../AxiosApi.ts";
import { SeminarModal } from "../EditSeminarModal.tsx";
import { useParams } from "react-router-dom";
import { locationTypeLabels, type LocationType } from "../../../../types.ts";

export type SelectionType = "SINGLE" | "RANDOM_GROUP" | "RANDOM_ALL";
export type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";

export interface ITargetAttendees {
  males: number;
  females: number;
  children: number;
}

export interface IServerAvailableTopic {
  schedule_name: string;
  main_topic: string;
  sub_topics: string[];
  rows: { mainTopic: string; supTopic: string }[];
}

export interface ICustomTopicGroup {
  id: string;
  name: string;
  topics: {
    schedule_name: string;
    main_topic: string;
    sub_topic: string;
  }[];
}

export interface IPlanCondition {
  id: string;
  selection_type: SelectionType;
  selected_main_topic?: string;
  selected_sub_topic?: string;
  selected_group_id?: string;

  recurrence_type: RecurrenceType;
  selected_days_of_week?: number[];
  selected_days_of_month?: number[];
  specific_date?: string;

  seminars_per_occurrence: number;

  location_type: LocationType;
  external_location_name?: string;

  // الحقول الإعلامية الجديدة
  media_outlets_count: number;
  digital_media_activities_count: number;

  target_attendees: ITargetAttendees;
}

export interface IGroupedSeminar {
  id: string;
  schedule_name: string;
  main_topic: string;
  sub_topic: string;
  planned_date: string;
  location_type: LocationType;
  external_location_name?: string;
  media_outlets_count: number;
  digital_media_activities_count: number;
  target_attendees: ITargetAttendees;
  count: number;
}

export const CreatePlacePlanContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // 1. الصلاحيات والجداول
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [availableSchedules, setAvailableSchedules] = useState<
    IServerAvailableTopic[]
  >([]);
  const [loadingCheck, setLoadingCheck] = useState<boolean>(true);

  // 2. النطاق الزمني والعطلات
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHolidayInput, setNewHolidayInput] = useState<string>("");

  // 3. المجموعات المخصصة
  const [customGroups, setCustomGroups] = useState<ICustomTopicGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");

  // 4. نموذج بناء الشرط
  const [condSelectionType, setCondSelectionType] =
    useState<SelectionType>("SINGLE");
  const [condMainTopic, setCondMainTopic] = useState<string>("");
  const [condSubTopic, setCondSubTopic] = useState<string>("");
  const [condGroupId, setCondGroupId] = useState<string>("");
  const [condRecurrence, setCondRecurrence] =
    useState<RecurrenceType>("WEEKLY");
  const [condDaysOfWeek, setCondDaysOfWeek] = useState<number[]>([1, 3]);
  const [condDaysOfMonth, setCondDaysOfMonth] = useState<number[]>([]);
  const [condSpecificDate, setCondSpecificDate] = useState<string>("");
  const [condSeminarsCount, setCondSeminarsCount] = useState<number>(1);

  const [condLocationType, setCondLocationType] =
    useState<LocationType>("internal_seminar");
  const [condExternalLocName, setCondExternalLocName] = useState<string>("");

  // أعداد الإعلام
  const [condMediaOutletsCount, setCondMediaOutletsCount] = useState<number>(0);
  const [condDigitalActivitiesCount, setCondDigitalActivitiesCount] =
    useState<number>(0);

  const [condAttendees, setCondAttendees] = useState<ITargetAttendees>({
    males: 0,
    females: 0,
    children: 0,
  });

  const [conditions, setConditions] = useState<IPlanCondition[]>([]);

  // 5. الجدول النهائي المقترح والتعديل
  const [seminars, setSeminars] = useState<IGroupedSeminar[]>([]);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // حالة التحكم بمودال الإضافة والتعديل
  const [activeSeminar, setActiveSeminar] = useState<IGroupedSeminar | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setActiveSeminar(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (seminar: IGroupedSeminar) => {
    setActiveSeminar(seminar);
    setIsModalOpen(true);
  };

  // دالة تجميع ودمج العناصر المتشابهة في الصفوف بما يشمل الحقول الإعلامية
  const mergeSeminars = (list: IGroupedSeminar[]): IGroupedSeminar[] => {
    const map = new Map<string, IGroupedSeminar>();

    list.forEach((item) => {
      const key = `${item.planned_date}_${item.main_topic}_${item.sub_topic}_${
        item.location_type
      }_${item.external_location_name || ""}_${item.media_outlets_count}_${
        item.digital_media_activities_count
      }_${item.target_attendees.males}_${item.target_attendees.females}_${
        item.target_attendees.children
      }`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.count += item.count;
      } else {
        map.set(key, { ...item });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime(),
    );
  };

  const handleSaveSeminar = (savedSeminar: IGroupedSeminar) => {
    setSeminars((prev) => {
      const filtered = prev.filter((s) => s.id !== savedSeminar.id);
      return mergeSeminars([...filtered, savedSeminar]);
    });
    setIsModalOpen(false);
    setActiveSeminar(null);
  };

  const daysOfWeekMap: { [key: number]: string } = {
    0: "الأحد",
    1: "الإثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
    5: "الجمعة",
    6: "السبت",
  };

  useEffect(() => {
    const verifyUserAccess = async () => {
      setLoadingCheck(true);
      try {
        const res = await AxiosApi.get(
          `/auth/withlogin/places/place-plans/check-can-create/${id}`,
        );
        const data = res.data;

        if (!data.can_create) {
          setIsAuthorized(false);
          setAuthError(
            data.message || "عفواً، ليس لديك الصلاحية لإنشاء خطط لهذا المكان.",
          );
        } else {
          setIsAuthorized(true);
          setAvailableSchedules(data.available_schedules || []);
        }
      } catch (err: any) {
        setIsAuthorized(false);
        setAuthError(
          err?.response?.data?.message || "حدث خطأ أثناء التحقق من الصلاحيات.",
        );
      } finally {
        setLoadingCheck(false);
      }
    };

    if (id) verifyUserAccess();
  }, [id]);

  const allAvailableGroups = [
    ...availableSchedules.map((s) => ({
      id: `server_${s.schedule_name}`,
      name: `جدول سيرفر: ${s.schedule_name}`,
      topics: s.sub_topics.map((sub) => ({
        main_topic: s.main_topic,
        sub_topic: sub,
      })),
    })),
    ...customGroups,
  ];

  const handleAddHoliday = () => {
    if (newHolidayInput && !holidays.includes(newHolidayInput)) {
      setHolidays([...holidays, newHolidayInput]);
      setNewHolidayInput("");
    }
  };

  const handleRemoveHoliday = (dateStr: string) => {
    setHolidays(holidays.filter((h) => h !== dateStr));
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: ICustomTopicGroup = {
      id: Math.random().toString(36).substring(2, 9),
      name: newGroupName,
      topics: [],
    };
    setCustomGroups([...customGroups, newGroup]);
    setNewGroupName("");
  };

  const handleAddTopicToGroup = (
    groupId: string,
    scheduleName: string,
    main: string,
    sub: string,
  ) => {
    if (!main || !sub) return;

    setCustomGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              topics: [
                ...g.topics,
                {
                  schedule_name: scheduleName || "جدول الخطة التشغيلية",
                  main_topic: main,
                  sub_topic: sub,
                },
              ],
            }
          : g,
      ),
    );
  };

  const handleRemoveTopicFromGroup = (
    groupId: string,
    indexToRemove: number,
  ) => {
    setCustomGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              topics: g.topics.filter((_, index) => index !== indexToRemove),
            }
          : g,
      ),
    );
  };

  const handleAddCondition = () => {
    if (condSelectionType === "SINGLE" && (!condMainTopic || !condSubTopic)) {
      alert("تنبيه: يجب اختيار موضوع رئيسي وفرعي واحد على الأقل.");
      return;
    }
    if (condSelectionType === "RANDOM_GROUP" && !condGroupId) {
      alert("تنبيه: يجب اختيار مجموعة موضوعات.");
      return;
    }
    if (condRecurrence === "WEEKLY" && condDaysOfWeek.length === 0) {
      alert("تنبيه: يجب تحديد يوم أسبوعي واحد على الأقل.");
      return;
    }
    if (condRecurrence === "MONTHLY" && condDaysOfMonth.length === 0) {
      alert("تنبيه: يجب تحديد يوم واحد من الشهر على الأقل.");
      return;
    }
    if (condRecurrence === "ONCE" && !condSpecificDate) {
      alert("تنبيه: يجب تحديد تاريخ محدد لهذا الشرط.");
      return;
    }
    if (
      condLocationType === "external_seminar" &&
      !condExternalLocName.trim()
    ) {
      alert("تنبيه: يرجى كتابة اسم المكان الخارجي عند اختيار ندوة خارجية.");
      return;
    }

    const newCondition: IPlanCondition = {
      id: Math.random().toString(36).substring(2, 9),
      selection_type: condSelectionType,
      selected_main_topic: condMainTopic,
      selected_sub_topic: condSubTopic,
      selected_group_id: condGroupId,
      recurrence_type: condRecurrence,
      selected_days_of_week: [...condDaysOfWeek],
      selected_days_of_month: [...condDaysOfMonth],
      specific_date: condSpecificDate,
      seminars_per_occurrence: condSeminarsCount,
      location_type: condLocationType,
      external_location_name:
        condLocationType === "external_seminar" ||
        condLocationType === "convoy_seminars" ||
        condLocationType === "public_meeting"
          ? condExternalLocName
          : "",
      media_outlets_count: condMediaOutletsCount,
      digital_media_activities_count: condDigitalActivitiesCount,
      target_attendees: { ...condAttendees },
    };

    setConditions([...conditions, newCondition]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const handleGeneratePlan = () => {
    if (!startDate || !endDate) {
      alert("يرجى تحديد بداية ونهاية التاريخ أولاً.");
      return;
    }
    if (conditions.length === 0) {
      alert("يرجى إضافة شرط واحد على الأقل قبل الإنشاء.");
      return;
    }

    const rawList: IGroupedSeminar[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const allAvailablePairs: {
      main: string;
      sub: string;
      schedule: string;
    }[] = [];
    // console.log({ availableSchedules });

    availableSchedules.forEach((s) => {
      s.rows.forEach((o) => {
        allAvailablePairs.push({
          main: o.mainTopic,
          sub: o.supTopic,
          schedule: s.schedule_name,
        });
      });
    });

    conditions.forEach((cond) => {
      const current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];

        if (holidays.includes(dateStr)) {
          current.setDate(current.getDate() + 1);
          continue;
        }

        let shouldAdd = false;

        if (cond.recurrence_type === "DAILY") {
          shouldAdd = true;
        } else if (cond.recurrence_type === "WEEKLY") {
          if (cond.selected_days_of_week?.includes(current.getDay())) {
            shouldAdd = true;
          }
        } else if (cond.recurrence_type === "MONTHLY") {
          const dayOfMonth = current.getDate();
          if (cond.selected_days_of_month?.includes(dayOfMonth)) {
            shouldAdd = true;
          }
        } else if (cond.recurrence_type === "ONCE") {
          if (cond.specific_date === dateStr) {
            shouldAdd = true;
          }
        }

        if (shouldAdd) {
          for (let i = 0; i < cond.seminars_per_occurrence; i++) {
            let chosenMain = "";
            let chosenSub = "";
            let scheduleName = "جدول الخطة التشغيلية";

            if (cond.selection_type === "SINGLE") {
              chosenMain = cond.selected_main_topic || "";
              chosenSub = cond.selected_sub_topic || "";

              const matchedSchedule = availableSchedules.find(
                (s) =>
                  s.main_topic === chosenMain &&
                  s.sub_topics.includes(chosenSub),
              );
              if (matchedSchedule) {
                scheduleName = matchedSchedule.schedule_name;
              }
            } else if (cond.selection_type === "RANDOM_GROUP") {
              const group = allAvailableGroups.find(
                (g) => g.id === cond.selected_group_id,
              );
              if (group && group.topics.length > 0) {
                const randomIndex = Math.floor(
                  Math.random() * group.topics.length,
                );
                chosenMain = group.topics[randomIndex].main_topic;
                chosenSub = group.topics[randomIndex].sub_topic;

                const matchedSchedule = availableSchedules.find(
                  (s) =>
                    s.main_topic === chosenMain &&
                    s.sub_topics.includes(chosenSub),
                );
                if (matchedSchedule) {
                  scheduleName = matchedSchedule.schedule_name;
                }
              }
            } else if (cond.selection_type === "RANDOM_ALL") {
              if (allAvailablePairs.length > 0) {
                const randomIndex = Math.floor(
                  Math.random() * allAvailablePairs.length,
                );
                chosenMain = allAvailablePairs[randomIndex].main;
                chosenSub = allAvailablePairs[randomIndex].sub;
                scheduleName = allAvailablePairs[randomIndex].schedule;
              }
            }

            rawList.push({
              id: Math.random().toString(36).substring(2, 9),
              schedule_name: scheduleName,
              main_topic: chosenMain,
              sub_topic: chosenSub,
              planned_date: dateStr,
              location_type: cond.location_type,
              external_location_name:
                cond.location_type === "external_seminar" ||
                cond.location_type === "convoy_seminars" ||
                cond.location_type === "public_meeting"
                  ? cond.external_location_name
                  : "",
              media_outlets_count: cond.media_outlets_count,
              digital_media_activities_count:
                cond.digital_media_activities_count,
              target_attendees: { ...cond.target_attendees },
              count: 1,
            });
          }
        }

        current.setDate(current.getDate() + 1);
      }
    });

    const finalGroupedResults = mergeSeminars(rawList);
    setSeminars(finalGroupedResults);
    setIsGenerated(true);
  };

  const handleRemoveSeminar = (id: string) => {
    if (!window.confirm("هل أنت تأكد من حذف هذا الصف؟")) return;
    setSeminars((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveFinalPlan = async () => {
    if (!window.confirm("هل أنت تأكد من حفظ هذه الخطة؟")) return;
    setSaving(true);
    try {
      const flattenedSeminars: any[] = [];
      seminars.forEach((s) => {
        flattenedSeminars.push({
          schedule_name: s.schedule_name,
          main_topic: s.main_topic,
          sub_topic: s.sub_topic,
          planned_date: s.planned_date,
          location_type: s.location_type,
          external_location_name: s.external_location_name,
          media_outlets_count: s.media_outlets_count,
          digital_media_activities_count: s.digital_media_activities_count,
          target_attendees: s.target_attendees,
          target_seminars_count: s.count,
        });
      });

      const res = await AxiosApi.post(
        `/auth/withlogin/places/place-plans/save-plan-draft/${id}`,
        {
          start_date: startDate,
          end_date: endDate,
          seminars: flattenedSeminars,
        },
      );

      alert(res.data?.message || "تم حفظ الخطة بنجاح!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "حدث خطأ أثناء حفظ الخطة.");
    } finally {
      setSaving(false);
    }
  };

  // دالة تحويل البيانات للفرمات المطلوب للمودال
  const transformSchedulesForModal = (schedules: IServerAvailableTopic[]) => {
    const transformed: Array<{
      schedule_name: string;
      main_topic: string;
      sub_topics: string[];
      rows: any[];
    }> = [];

    schedules.forEach((schedule) => {
      // تجميع الموضوعات الفرعية حسب الموضوع الرئيسي من مصفوفة rows
      const topicGroupMap = new Map<string, Set<string>>();

      if (schedule.rows && schedule.rows.length > 0) {
        schedule.rows.forEach((row) => {
          if (!topicGroupMap.has(row.mainTopic)) {
            topicGroupMap.set(row.mainTopic, new Set());
          }
          topicGroupMap.get(row.mainTopic)!.add(row.supTopic);
        });

        // تحويل الخريطة إلى الهيكل المطلوب
        topicGroupMap.forEach((subTopicsSet, mainTopic) => {
          transformed.push({
            schedule_name: schedule.schedule_name,
            main_topic: mainTopic,
            sub_topics: Array.from(subTopicsSet),
            rows: [],
          });
        });
      } else {
        // حالة احتياطية إذا لم تحتوي القائمة على rows
        transformed.push({
          schedule_name: schedule.schedule_name,
          main_topic: schedule.main_topic,
          sub_topics: schedule.sub_topics || [],
          rows: [],
        });
      }
    });

    return transformed;
  };

  if (loadingCheck) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        جاري التحقق من الصلاحيات والجداول المتاحة...
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div
        className="max-w-2xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3"
        dir="rtl"
      >
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-red-800">غير مصرح بالوصول</h2>
        <p className="text-sm text-red-600">{authError}</p>
      </div>
    );
  }

  let dateCounter = 0;
  let lastSeenDate = "";

  return (
    <div className="max-w-7xl mx-auto space-y-4 text-right font-sans" dir="rtl">
      {/* SECTION 1: النطاق الزمني والعطلات */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          1. النطاق الزمني واستثناء العطلات
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              تاريخ بداية الخطة
            </label>
            <input
              type="date"
              className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              تاريخ نهاية الخطة
            </label>
            <input
              type="date"
              className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <label className="block text-xs font-semibold text-gray-600 flex items-center gap-1">
            <CalendarOff className="w-4 h-4 text-red-500" /> استثناء أيام
            العطلات الرسمية
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              type="date"
              className="border rounded-lg p-2 text-xs flex-1"
              value={newHolidayInput}
              onChange={(e) => setNewHolidayInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddHoliday}
              className="bg-gray-800 hover:bg-gray-900 text-white text-xs px-3 py-2 rounded-lg"
            >
              إضافة عطلة
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {holidays.map((hDate) => (
              <span
                key={hDate}
                className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-mono"
              >
                {hDate}
                <button onClick={() => handleRemoveHoliday(hDate)}>
                  <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: المجموعات المخصصة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
          <ListPlus className="w-5 h-5 text-indigo-600" />
          2. المجموعات المخصصة للموضوعات
        </h2>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            className="border rounded-lg p-2 text-xs flex-1"
            placeholder="اسم مجموعة مخصصة جديدة..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button
            onClick={handleCreateGroup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg font-semibold"
          >
            إنشاء مجموعة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {customGroups.map((group) => {
            const allOptions = availableSchedules.flatMap((s) =>
              (s.rows || []).map((o) => ({
                scheduleName: s.schedule_name || "جدول الخطة التشغيلية",
                mainTopic: o.mainTopic,
                supTopic: o.supTopic,
              })),
            );

            const filteredOptions = allOptions.filter((opt) => {
              return !group.topics.some(
                (t) =>
                  t.main_topic === opt.mainTopic &&
                  t.sub_topic === opt.supTopic &&
                  t.schedule_name === opt.scheduleName,
              );
            });

            // console.log({ availableSchedules, allOptions, filteredOptions });

            return (
              <div
                key={group.id}
                className="border rounded-lg p-3 bg-indigo-50/30 space-y-2"
              >
                <span className="font-bold text-xs text-indigo-900 block">
                  {group.name}
                </span>

                <div className="space-y-1">
                  {group.topics.map((t, i) => (
                    <div
                      key={i}
                      className="text-xs bg-white p-1.5 rounded border text-gray-700 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-medium text-indigo-950">
                          [{t.schedule_name}]
                        </span>{" "}
                        {t.main_topic} -{" "}
                        <span className="text-gray-500">{t.sub_topic}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTopicFromGroup(group.id, i)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0.5 rounded transition-colors text-xs font-bold"
                        title="حذف الموضوع"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <select
                  className="w-full border rounded p-1 text-xs bg-white"
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const [sched, main, sub] = e.target.value.split("||");
                    handleAddTopicToGroup(group.id, sched, main, sub);
                    e.target.value = "";
                  }}
                >
                  <option value="">+ إضافة موضوع للمجموعة من المتاح...</option>
                  {filteredOptions.map((o) => (
                    <option
                      key={`${o.scheduleName}-${o.mainTopic}-${o.supTopic}`}
                      value={`${o.scheduleName}||${o.mainTopic}||${o.supTopic}`}
                    >
                      [{o.scheduleName}] {o.mainTopic} | {o.supTopic}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: إعداد إضافة شرط مخصص */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          3. إضافة شروط توليد الندوات والأنشطة
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              نوع اختيار الموضوع
            </label>
            <select
              className="w-full border rounded-lg p-2 text-xs outline-none"
              value={condSelectionType}
              onChange={(e) =>
                setCondSelectionType(e.target.value as SelectionType)
              }
            >
              <option value="SINGLE">فعالية واحدة محددة</option>
              <option value="RANDOM_GROUP">
                اختيار عشوائي من مجموعة (سيرفر أو مخصصة)
              </option>
              <option value="RANDOM_ALL">
                اختيار عشوائي شامـل (كافة المواضيع المتاحة)
              </option>
            </select>
          </div>

          {condSelectionType === "SINGLE" && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                اختر الموضوع الرئيسي والفرعي *
              </label>
              <select
                className="w-full border rounded-lg p-2 text-xs"
                value={`${condMainTopic}||${condSubTopic}`}
                onChange={(e) => {
                  if (!e.target.value) {
                    setCondMainTopic("");
                    setCondSubTopic("");
                    return;
                  }
                  const [main, sub] = e.target.value.split("||");
                  setCondMainTopic(main);
                  setCondSubTopic(sub);
                }}
              >
                <option value="">-- اختر موضوعاً --</option>
                {availableSchedules.map((s) =>
                  s.rows.map((sub) => (
                    <option
                      key={`${sub.mainTopic}-${sub.supTopic}`}
                      value={`${sub.mainTopic}||${sub.supTopic}`}
                    >
                      {sub.mainTopic} - {sub.supTopic} ({s.schedule_name})
                    </option>
                  )),
                )}
              </select>
            </div>
          )}

          {condSelectionType === "RANDOM_GROUP" && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                اختر المجموعة *
              </label>
              <select
                className="w-full border rounded-lg p-2 text-xs"
                value={condGroupId}
                onChange={(e) => setCondGroupId(e.target.value)}
              >
                <option value="">-- اختر مجموعة --</option>
                {allAvailableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.topics.length} موضوع)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* نوع الفعالية، المكان، والوسائل الإعلامية */}
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> نوع / مكان
                الفعالية *
              </label>
              <select
                className="w-full border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={condLocationType}
                onChange={(e) =>
                  setCondLocationType(e.target.value as LocationType)
                }
              >
                <option value="internal_seminar">ندوة داخلية</option>
                <option value="external_seminar">ندوة خارجية</option>
                <option value="general_consultation">مشورة عامة</option>
                <option value="public_meeting">لقاء جماهيري</option>
                <option value="convoy_seminars">ندوات قوافل</option>
              </select>
            </div>

            {(condLocationType === "external_seminar" ||
              condLocationType === "convoy_seminars" ||
              condLocationType === "public_meeting") && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  اسم أو عنوان المكان الخارجي *
                </label>
                <input
                  type="text"
                  placeholder="مثال: قاعة المؤتمرات - مركز الشباب..."
                  className="w-full border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={condExternalLocName}
                  onChange={(e) => setCondExternalLocName(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* التغطية الإعلامية */}
          <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 space-y-2">
            <label className="block text-xs font-bold text-purple-900 flex items-center gap-1">
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
                  className="w-full border rounded-lg p-1.5 text-xs font-bold bg-white"
                  value={condMediaOutletsCount}
                  onChange={(e) =>
                    setCondMediaOutletsCount(parseInt(e.target.value) || 0)
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
                  className="w-full border rounded-lg p-1.5 text-xs font-bold bg-white"
                  value={condDigitalActivitiesCount}
                  onChange={(e) =>
                    setCondDigitalActivitiesCount(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>

          {/* أعداد الحضور المستهدفين */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Users className="w-4 h-4 text-indigo-600" /> أعداد الحضور
              المستهدفين لكل ندوة:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  👨 ذكور
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-1.5 text-xs font-bold bg-white"
                  value={condAttendees.males}
                  onChange={(e) =>
                    setCondAttendees({
                      ...condAttendees,
                      males: parseInt(e.target.value) || 0,
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
                  className="w-full border rounded-lg p-1.5 text-xs font-bold bg-white"
                  value={condAttendees.females}
                  onChange={(e) =>
                    setCondAttendees({
                      ...condAttendees,
                      females: parseInt(e.target.value) || 0,
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
                  className="w-full border rounded-lg p-1.5 text-xs font-bold bg-white"
                  value={condAttendees.children}
                  onChange={(e) =>
                    setCondAttendees({
                      ...condAttendees,
                      children: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* التكرار والتحديد الزمني */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              نمط التكرار
            </label>
            <select
              className="w-full border rounded-lg p-2 text-xs"
              value={condRecurrence}
              onChange={(e) =>
                setCondRecurrence(e.target.value as RecurrenceType)
              }
            >
              <option value="WEEKLY">أسبوعي (أيام محددة)</option>
              <option value="DAILY">يومي (كل الأيام المتاحة)</option>
              <option value="MONTHLY">شهري (أيام محددة من الشهر)</option>
              <option value="ONCE">مرة واحدة بتاريخ محدد</option>
            </select>
          </div>

          {condRecurrence === "WEEKLY" && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                أيام التنفيذ *
              </label>
              <div className="flex gap-1 flex-wrap">
                {[
                  { l: "أحد", v: 0 },
                  { l: "إثنين", v: 1 },
                  { l: "ثلاثاء", v: 2 },
                  { l: "أربعاء", v: 3 },
                  { l: "خميس", v: 4 },
                  { l: "جمعة", v: 5 },
                  { l: "سبت", v: 6 },
                ].map((d) => (
                  <button
                    key={d.v}
                    type="button"
                    onClick={() =>
                      setCondDaysOfWeek((prev) =>
                        prev.includes(d.v)
                          ? prev.filter((x) => x !== d.v)
                          : [...prev, d.v],
                      )
                    }
                    className={`px-2.5 py-1 rounded text-xs border font-medium ${
                      condDaysOfWeek.includes(d.v)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 border-gray-300 text-gray-700"
                    }`}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {condRecurrence === "MONTHLY" && (
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                حدد أيام الشهر (من 1 إلى 31) *
              </label>
              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                  const isSelected = condDaysOfMonth.includes(dayNum);
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() =>
                        setCondDaysOfMonth((prev) =>
                          isSelected
                            ? prev.filter((d) => d !== dayNum)
                            : [...prev, dayNum],
                        )
                      }
                      className={`w-7 h-7 text-xs rounded border flex items-center justify-center font-mono ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {condRecurrence === "ONCE" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                التاريخ المحدد *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-2 text-xs"
                value={condSpecificDate}
                onChange={(e) => setCondSpecificDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              عدد الأنشطة المطلوبة في كل يوم/مرة مطابقة
            </label>
            <input
              type="number"
              min="1"
              className="w-full border rounded-lg p-2 text-xs font-bold"
              value={condSeminarsCount}
              onChange={(e) =>
                setCondSeminarsCount(parseInt(e.target.value) || 1)
              }
            />
          </div>
        </div>

        <button
          onClick={handleAddCondition}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> إضافة الشرط للقائمة
        </button>

        {/* قائمة الشروط */}
        <div className="border-t pt-4 space-y-3">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <ListPlus className="w-4 h-4 text-amber-600" />
            الشروط المحددة حالياً ({conditions.length})
          </span>

          {conditions.map((cond, idx) => {
            const groupObj = allAvailableGroups.find(
              (g) => g.id === cond.selected_group_id,
            );
            return (
              <div
                key={cond.id}
                className="bg-white border rounded-xl p-3.5 shadow-sm space-y-2.5 relative border-r-4 border-r-amber-500 text-xs"
              >
                <div className="flex justify-between items-start border-b pb-2">
                  <div className="space-y-1">
                    <div>
                      <span className="font-bold text-gray-800">
                        شرط #{idx + 1}:{" "}
                      </span>
                      <span className="text-blue-700 font-bold">
                        {cond.selection_type === "SINGLE" &&
                          `موضوع محدد: ${cond.selected_main_topic} (${cond.selected_sub_topic})`}
                        {cond.selection_type === "RANDOM_GROUP" &&
                          `عشوائي من مجموعة: ${groupObj?.name || "مجموعة مخصصة"}`}
                        {cond.selection_type === "RANDOM_ALL" &&
                          "عشوائي من كافة المواضيع المتاحة"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-600 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-semibold text-gray-700">
                        التكرار:{" "}
                      </span>
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                        {cond.recurrence_type === "DAILY" && "يومي (كل الأيام)"}
                        {cond.recurrence_type === "WEEKLY" &&
                          `أسبوعي [ ${cond.selected_days_of_week
                            ?.map((d) => daysOfWeekMap[d])
                            .join(" ، ")} ]`}
                        {cond.recurrence_type === "MONTHLY" &&
                          `شهري [ الأيام: ${cond.selected_days_of_month?.join(
                            " ، ",
                          )} ]`}
                        {cond.recurrence_type === "ONCE" &&
                          `مرة واحدة [ ${cond.specific_date} ]`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCondition(cond.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-gray-600 pt-1">
                  <div>
                    <span className="font-semibold text-gray-700">النوع: </span>
                    <span className="text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                      {locationTypeLabels[cond.location_type]}
                    </span>
                    {(cond.location_type === "external_seminar" ||
                      cond.location_type === "convoy_seminars" ||
                      cond.location_type === "public_meeting") && (
                      <span className="text-gray-500 block truncate text-[11px]">
                        ({cond.external_location_name})
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      الإعلام:{" "}
                    </span>
                    <span>
                      📺 {cond.media_outlets_count} | 📡{" "}
                      {cond.digital_media_activities_count}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      الجمهور:{" "}
                    </span>
                    <span>
                      👨 {cond.target_attendees.males} | 👩{" "}
                      {cond.target_attendees.females} | 👶{" "}
                      {cond.target_attendees.children}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      العدد/المرة:{" "}
                    </span>
                    <span className="font-mono font-bold text-indigo-600">
                      {cond.seminars_per_occurrence}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={handleGeneratePlan}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5" /> توليد جدول الندوات والأنشطة من الشروط
        </button>
      </div>

      {/* SECTION 4: الجدول المقترح */}
      {isGenerated && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              الجدول التشغيلي المقترح (إجمالي الصفوف: {seminars.length})
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> إضافة نشاط يدويًا
              </button>

              <button
                onClick={handleSaveFinalPlan}
                disabled={saving || seminars.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ الخطة النهائية"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الموضوع الرئيسي والفرعي</th>
                  <th className="p-3">نوع الفعالية</th>
                  <th className="p-3">الوسائل / الأنشطة الإعلامية</th>
                  <th className="p-3">الحضور المستهدف</th>
                  <th className="p-3 text-center">العدد 🔢</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seminars.map((sem) => {
                  let displayIndex = "-";
                  if (sem.planned_date !== lastSeenDate) {
                    dateCounter += 1;
                    displayIndex = dateCounter.toString();
                    lastSeenDate = sem.planned_date;
                  }

                  return (
                    <tr key={sem.id} className="hover:bg-gray-50/80">
                      <td className="p-3 font-mono font-bold text-gray-500">
                        {displayIndex}
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-800">
                        {sem.planned_date}
                      </td>
                      <td className="p-3 space-y-1">
                        <div className="font-bold text-gray-800">
                          {sem.main_topic}
                        </div>
                        <div className="text-gray-500">{sem.sub_topic}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold inline-block">
                          {locationTypeLabels[sem.location_type]}
                        </span>
                        {(sem.location_type === "external_seminar" ||
                          sem.location_type === "convoy_seminars" ||
                          sem.location_type === "public_meeting") &&
                          sem.external_location_name && (
                            <div className="text-purple-700 text-[11px] truncate max-w-xs mt-0.5">
                              ({sem.external_location_name})
                            </div>
                          )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5 text-gray-700 font-mono text-[11px]">
                          <span>📺 وسائل: {sem.media_outlets_count}</span>
                          <span>
                            📡 رقمية: {sem.digital_media_activities_count}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 text-gray-700 font-mono">
                          <span>👨{sem.target_attendees.males}</span>
                          <span>👩{sem.target_attendees.females}</span>
                          <span>👶{sem.target_attendees.children}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-3 py-1 rounded-md font-mono">
                          {sem.count}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(sem)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل الصف"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveSeminar(sem.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف النشاط"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* المودال المشترك للإضافة والتعديل */}
      {isModalOpen && (
        <SeminarModal
          seminar={activeSeminar}
          availableSchedules={transformSchedulesForModal(availableSchedules)}
          onClose={() => {
            setIsModalOpen(false);
            setActiveSeminar(null);
          }}
          onSave={handleSaveSeminar}
        />
      )}
    </div>
  );
};
