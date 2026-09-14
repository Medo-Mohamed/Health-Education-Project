import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FileText, PieChart } from "lucide-react";
import AxiosApi from "../../../../../../../../AxiosApi";
import {
  type IGroupedSeminar,
  type IServerAvailableTopic,
} from "../PlaceCreate/CreatePlacePlanContainer";

import DraftManagementTab from "./DraftManagementTab";
import StatisticalSummaryTab from "./StatisticalSummaryTab";
import { SeminarModal } from "../EditSeminarModal";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../../../../store";
import { loading, open, close } from "../../../../../../../Redux-Store/SuccessFaildState/SFS";
import { LocationType } from "../../../../types";

export interface ITargetAttendeeBreakdown {
  males: number;
  females: number;
  children: number;
}

export interface IPlacePlan {
  id: string;
  place_id: string;
  schedule_name: string;
  main_topic: string;
  sub_topic: string;
  count: number;
  target_seminars_count: number;
  location_type: LocationType;
  external_location_name?: string | null;
  media_outlets_count?: number;
  digital_media_activities_count?: number;
  target_attendees: ITargetAttendeeBreakdown;
  target_total_attendees: number;
  planned_date: string;
  status: string;
}

export interface ITableRawRow {
  _id: string;
  mainTopic: string;
  supTopic: string;
  comments?: string;
  text_color?: string;
  bg_color?: string;
  created_at?: string;
}

export interface ITableSummary {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  table_rows: ITableRawRow[];
  created_at?: string;
  updated_at?: string;
}

export interface IStatRow {
  main_topic: string;
  sub_topic: string;
  internal_count: number;
  external_count: number;
  consultation_count: number;
  meeting_count: number;
  convoy_count: number;
  media_outlets_count: number;
  digital_media_count: number;
  children: number;
  males: number;
  females: number;
}

export interface ITableGroupedStat {
  schedule_name: string;
  rows: IStatRow[];
  totals: {
    internal_count: number;
    external_count: number;
    consultation_count: number;
    meeting_count: number;
    convoy_count: number;
    media_outlets_count: number;
    digital_media_count: number;
    children: number;
    males: number;
    females: number;
  };
}

// ==========================================
// Main Component: الصفحة الرئيسية
// ==========================================
export default function PlanReviewPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<"drafts" | "stats">("drafts");

  const [plans, setPlans] = useState<IPlacePlan[]>([]);
  const [tablesSummary, setTablesSummary] = useState<ITableSummary[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedSeminarForEdit, setSelectedSeminarForEdit] =
    useState<IGroupedSeminar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // 1. جلب كافة المسودات والجداول الخاصة بالمكان
  const fetchData = useCallback(async () => {
    try {
      dispatch(loading());
      setError(null);

      const response = await AxiosApi.get(
        `/auth/withlogin/places/place-plans/get-plan-draft/${id}`,
      );

      const rootPayload = response.data;
      const serverPayload = rootPayload?.data || rootPayload;

      const draftsList = Array.isArray(serverPayload?.data)
        ? serverPayload.data
        : Array.isArray(rootPayload?.data)
          ? rootPayload.data
          : [];

      const tablesList = Array.isArray(serverPayload?.tabels)
        ? serverPayload.tabels
        : Array.isArray(rootPayload?.tabels)
          ? rootPayload.tabels
          : [];

      setPlans(draftsList);
      setTablesSummary(tablesList);
    } catch (err: any) {
      setError(err?.response?.data?.message || "حدث خطأ أثناء جلب البيانات.");
    } finally {
      dispatch(close());
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  // دالة لمطابقة المسودة والحصول على اسم الجدول الفعلي title من tabels
  const getActualTableName = useCallback(
    (mainTopic: string, subTopic: string, defaultName: string) => {
      if (!tablesSummary || tablesSummary.length === 0) return defaultName;

      for (const table of tablesSummary) {
        const found = (table.table_rows || []).some(
          (row) =>
            row.mainTopic?.trim() === mainTopic?.trim() &&
            row.supTopic?.trim() === subTopic?.trim(),
        );
        if (found && table.title) {
          return table.title;
        }
      }

      if (tablesSummary.length === 1 && tablesSummary[0].title) {
        return tablesSummary[0].title;
      }

      return defaultName;
    },
    [tablesSummary],
  );

  // 3. تحويل tablesSummary إلى هيكل متوافق مع SeminarModal
  const availableSchedules: IServerAvailableTopic[] = useMemo(() => {
    if (tablesSummary.length > 0) {
      const formattedTopics: IServerAvailableTopic[] = [];

      tablesSummary.forEach((table) => {
        const mainTopicMap = new Map<string, Set<string>>();

        (table.table_rows || []).forEach((row) => {
          const main = row.mainTopic?.trim() || "";
          const sub = row.supTopic?.trim() || "";

          if (main) {
            if (!mainTopicMap.has(main)) {
              mainTopicMap.set(main, new Set());
            }
            if (sub) {
              mainTopicMap.get(main)!.add(sub);
            }
          }
        });

        mainTopicMap.forEach((subTopicsSet, mainTopic) => {
          formattedTopics.push({
            schedule_name: table.title,
            main_topic: mainTopic,
            sub_topics: Array.from(subTopicsSet),
            rows: [],
          });
        });
      });

      if (formattedTopics.length > 0) {
        return formattedTopics;
      }
    }

    return [];
  }, [tablesSummary]);

  // فتح المودال لإضافة صف جديد
  const handleOpenAddModal = () => {
    const defaultScheduleName = availableSchedules[0]?.schedule_name || "";
    const defaultMainTopic = availableSchedules[0]?.main_topic || "";
    const defaultSubTopic = availableSchedules[0]?.sub_topics[0] || "";

    const newSeminar: IGroupedSeminar = {
      id: "new",
      schedule_name: defaultScheduleName,
      main_topic: defaultMainTopic,
      sub_topic: defaultSubTopic,
      planned_date: "",
      location_type: "internal_seminar",
      external_location_name: "",
      media_outlets_count: 0,
      digital_media_activities_count: 0,
      target_attendees: { males: 0, females: 0, children: 0 },
      count: 1,
    };

    setSelectedSeminarForEdit(newSeminar);
    setIsModalOpen(true);
  };

  // 4. فتح مودال التعديل مع تحويل IPlacePlan إلى IGroupedSeminar
  const handleOpenEditModal = (plan: IPlacePlan) => {
    const actualTableName = getActualTableName(
      plan.main_topic,
      plan.sub_topic,
      plan.schedule_name,
    );

    const formattedSeminar: IGroupedSeminar = {
      id: plan.id,
      schedule_name: actualTableName,
      main_topic: plan.main_topic,
      sub_topic: plan.sub_topic,
      planned_date: plan.planned_date ? plan.planned_date.substring(0, 10) : "",
      location_type: plan.location_type as LocationType,
      external_location_name: plan.external_location_name || "",
      media_outlets_count: plan.media_outlets_count || 0,
      digital_media_activities_count: plan.digital_media_activities_count || 0,
      target_attendees: { ...plan.target_attendees },
      count: plan.count,
    };
    // console.log("befor format", formattedSeminar);
    setSelectedSeminarForEdit(formattedSeminar);
    setIsModalOpen(true);
  };

  // 5. استقبال حفظ بيانات المودال وإرسالها عبر الدالة الموحدة
  // تعديل handlePlanAction
  const handlePlanAction = useCallback(
    async (
      planId: string,
      payload: Partial<IPlacePlan> & { action?: "DELETE" | "CREATE" } = {},
    ) => {
      if (payload.action === "DELETE") {
        if (!window.confirm("هل أنت تأكد من رغبتك في حذف هذه المسودة؟")) return;
        setDeletingId(planId);
      } else {
        setSavingId(planId);
      }
      setError(null);

      try {
        const response = await AxiosApi.patch(
          `/auth/withlogin/places/place-plans/update-plan-draft/${id}/${planId}`,
          payload,
        );
        const { action, data } = response.data;

        const isDeleteAction =
          action === "DELETED" || payload.action === "DELETE";

        // إنشاء كائن الصف الجديد فقط إذا لم تكن العملية حذفاً
        const newPlanRow: IPlacePlan | null =
          !isDeleteAction && data
            ? {
                ...data,
                id: data.id || data._id,
                count: data.count ?? data.target_seminars_count ?? 1,
              }
            : null;

        setPlans((prevPlans) => {
          let updatedList: IPlacePlan[] = [];

          if (isDeleteAction) {
            updatedList = prevPlans.filter((p) => p.id !== planId);
          } else if (action === "MERGED" && newPlanRow) {
            updatedList = prevPlans
              .filter((p) => p.id !== planId)
              .map((p) => (p.id === newPlanRow.id ? newPlanRow : p));
          } else if (action === "CREATED" && newPlanRow) {
            updatedList = [...prevPlans, newPlanRow];
          } else if (newPlanRow) {
            updatedList = prevPlans.map((p) =>
              p.id === planId ? newPlanRow : p,
            );
          } else {
            updatedList = prevPlans;
          }

          return [...updatedList].sort((a, b) => {
            const dateA = a.planned_date
              ? new Date(a.planned_date).getTime()
              : 0;
            const dateB = b.planned_date
              ? new Date(b.planned_date).getTime()
              : 0;
            return dateA - dateB;
          });
        });

        if (!isDeleteAction) {
          setSavedSuccessId(planId);
          setTimeout(() => setSavedSuccessId(null), 2000);
        }
        dispatch(
          open({
            state: "success",
            title: response.data.message || "تمت العملية بنجاح",
          }),
        );
      } catch (err: any) {
        console.log(err);
        setError(
          err?.response?.data?.message || "حدث خطأ أثناء معالجة العملية.",
        );
      } finally {
        setSavingId(null);
        setDeletingId(null);
      }
    },
    [id, dispatch],
  );
  // تعديل handleSaveFromModal لإرسال كلا المسميين لضمان التوافق الكامل
  const handleSaveFromModal = (savedSeminar: IGroupedSeminar) => {
    const totalAttendees =
      (savedSeminar.target_attendees.males || 0) +
      (savedSeminar.target_attendees.females || 0) +
      (savedSeminar.target_attendees.children || 0);

    const isNew = savedSeminar && savedSeminar.id === "new";

    const updatedPlanFields: Partial<IPlacePlan> & {
      target_seminars_count?: number;
      action?: "CREATE";
    } = {
      schedule_name: savedSeminar.schedule_name,
      main_topic: savedSeminar.main_topic,
      sub_topic: savedSeminar.sub_topic,
      planned_date: savedSeminar.planned_date,
      location_type: savedSeminar.location_type,
      external_location_name:
        savedSeminar.location_type === "external_seminar" ||
        savedSeminar.location_type === "convoy_seminars" ||
        savedSeminar.location_type === "public_meeting"
          ? savedSeminar.external_location_name
          : null,
      media_outlets_count: savedSeminar.media_outlets_count || 0,
      digital_media_activities_count:
        savedSeminar.digital_media_activities_count || 0,
      target_attendees: savedSeminar.target_attendees,
      target_total_attendees: totalAttendees,
      count: savedSeminar.count,
      target_seminars_count: savedSeminar.count, // إرسال المسمى الخاص بالباك إند أيضاً
      ...(isNew ? { action: "CREATE" } : {}),
    };

    setIsModalOpen(false);
    setSelectedSeminarForEdit(null);
    handlePlanAction(savedSeminar.id, updatedPlanFields);
  };
  // دالة تجميع البيانات الإحصائية لجميع أنواع الأنشطة والوسائل الإعلامية
  const groupedTables = useMemo(() => {
    const tableMap = new Map<string, Map<string, IStatRow>>();

    // 1. تهيئة الأسطر الابتدائية
    availableSchedules.forEach((schedule) => {
      const scheduleName = schedule.schedule_name?.trim() || "جدول غير محدد";

      if (!tableMap.has(scheduleName)) {
        tableMap.set(scheduleName, new Map());
      }

      const rowsMap = tableMap.get(scheduleName)!;

      schedule.sub_topics.forEach((subTopic) => {
        const mainTopic = schedule.main_topic?.trim() || "";
        const sub = subTopic?.trim() || "";
        const rowKey = `${mainTopic}_${sub}`;

        if (!rowsMap.has(rowKey)) {
          rowsMap.set(rowKey, {
            main_topic: mainTopic,
            sub_topic: sub,
            internal_count: 0,
            external_count: 0,
            consultation_count: 0,
            meeting_count: 0,
            convoy_count: 0,
            media_outlets_count: 0,
            digital_media_count: 0,
            children: 0,
            males: 0,
            females: 0,
          });
        }
      });
    });

    // 2. تجميع أعداد المسودات بحسب نوع الفعالية الجديد
    plans.forEach((plan) => {
      const actualTableName =
        getActualTableName(
          plan.main_topic,
          plan.sub_topic,
          plan.schedule_name,
        )?.trim() || "جدول غير محدد";

      if (!tableMap.has(actualTableName)) {
        tableMap.set(actualTableName, new Map());
      }

      const rowsMap = tableMap.get(actualTableName)!;
      const rowKey = `${plan.main_topic?.trim()}_${plan.sub_topic?.trim()}`;

      if (!rowsMap.has(rowKey)) {
        rowsMap.set(rowKey, {
          main_topic: plan.main_topic,
          sub_topic: plan.sub_topic,
          internal_count: 0,
          external_count: 0,
          consultation_count: 0,
          meeting_count: 0,
          convoy_count: 0,
          media_outlets_count: 0,
          digital_media_count: 0,
          children: 0,
          males: 0,
          females: 0,
        });
      }

      const rowData = rowsMap.get(rowKey)!;
      const count = plan.count || 1;

      switch (plan.location_type) {
        case "external_seminar":
          rowData.external_count += count;
          break;
        case "general_consultation":
          rowData.consultation_count += count;
          break;
        case "public_meeting":
          rowData.meeting_count += count;
          break;
        case "convoy_seminars":
          rowData.convoy_count += count;
          break;
        case "internal_seminar":
        default:
          rowData.internal_count += count;
          break;
      }

      rowData.media_outlets_count += plan.media_outlets_count || 0;
      rowData.digital_media_count += plan.digital_media_activities_count || 0;
      rowData.males += plan.target_attendees?.males || 0;
      rowData.females += plan.target_attendees?.females || 0;
      rowData.children += plan.target_attendees?.children || 0;
    });

    // 3. تحويل Map إلى الهيكل النهائي الحاوي على الإجماليات
    const result: ITableGroupedStat[] = [];

    tableMap.forEach((rowsMap, schedule_name) => {
      const rows = Array.from(rowsMap.values());
      const totals = rows.reduce(
        (acc, r) => ({
          internal_count: acc.internal_count + r.internal_count,
          external_count: acc.external_count + r.external_count,
          consultation_count: acc.consultation_count + r.consultation_count,
          meeting_count: acc.meeting_count + r.meeting_count,
          convoy_count: acc.convoy_count + r.convoy_count,
          media_outlets_count: acc.media_outlets_count + r.media_outlets_count,
          digital_media_count: acc.digital_media_count + r.digital_media_count,
          children: acc.children + r.children,
          males: acc.males + r.males,
          females: acc.females + r.females,
        }),
        {
          internal_count: 0,
          external_count: 0,
          consultation_count: 0,
          meeting_count: 0,
          convoy_count: 0,
          media_outlets_count: 0,
          digital_media_count: 0,
          children: 0,
          males: 0,
          females: 0,
        },
      );

      result.push({ schedule_name, rows, totals });
    });

    return result;
  }, [availableSchedules, plans, getActualTableName]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* أزرار التنقل بين الأقسام */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("drafts")}
          className={`flex items-center gap-2 py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "drafts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>إدارة وتعديل المسودات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "stats"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>التجميعة الإحصائية النهائية</span>
        </button>
      </div>

      {/* عرض المكون بناءً على التاب المختار */}
      {activeTab === "drafts" ? (
        <DraftManagementTab
          plans={plans}
          error={error}
          savingId={savingId}
          deletingId={deletingId}
          savedSuccessId={savedSuccessId}
          getActualTableName={getActualTableName}
          handleOpenAddModal={handleOpenAddModal}
          handleOpenEditModal={handleOpenEditModal}
          handlePlanAction={handlePlanAction}
        />
      ) : (
        <StatisticalSummaryTab
          groupedTables={groupedTables}
          placeId={id}
          fetchData={fetchData}
        />
      )}

      {/* المودال الخاص بالتعديل والإضافة */}
      {isModalOpen && (
        <SeminarModal
          seminar={selectedSeminarForEdit}
          availableSchedules={availableSchedules}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSeminarForEdit(null);
          }}
          onSave={handleSaveFromModal}
        />
      )}
    </div>
  );
}
