import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import AxiosApi from "../../../../../../../../AxiosApi";
import {
  UserCheck,
  LayoutList,
  Calendar,
  Radio,
  Globe,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  PlusCircle,
  MapPin,
} from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../../../../store";
import {
  loading,
  open,
  close,
} from "../../../../../../../Redux-Store/SuccessFaildState/SFS";
import { ApprovedStatisticalSummaryTab } from "./ApprovedStatisticalSummaryTab";
import type { IGroupedSeminar } from "../PlaceCreate/CreatePlacePlanContainer";
import { SeminarModal, type IServerAvailableTopic } from "../EditSeminarModal";
import { LocationType } from "../../../../types";

export interface ITargetAttendeeBreakdown {
  males: number;
  females: number;
  children: number;
}

export interface IPlacePlanItem {
  _id: string;
  place_id: { _id: string; name: string; code?: string } | string;
  created_by: {
    last_name: string;
    avatar_url: string | undefined;
    first_name: string;
    _id: string;
    email: string;
  };
  schedule_name: string;
  main_topic: string;
  sub_topic: string;
  target_seminars_count: number;
  location_type: LocationType;
  external_location_name?: string | null;
  media_outlets_count: number;
  digital_media_activities_count: number;
  target_attendees: ITargetAttendeeBreakdown;
  target_total_attendees: number;
  instructor_info?: { _id: string; name: string } | null;
  planned_date: string;
  status: string;
}

export interface ITopicRow {
  mainTopic: string;
  supTopic: string;
  comments?: string;
  text_color: string;
  bg_color: string;
}

export interface ITopicTable {
  _id: string;
  title: string;
  description: string;
  table_rows: ITopicRow[];
}

export interface IUserGroup {
  user: {
    last_name: string;
    avatar_url: string | undefined;
    first_name: string;
    _id: string;
    email: string;
  };
  plans: IPlacePlanItem[];
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

export const PlanApprovalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [rawPlans, setRawPlans] = useState<IPlacePlanItem[]>([]);
  const [topicsTables, setTopicsTables] = useState<ITopicTable[]>([]);
  // const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // حالات مودال التعديل/الإضافة
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSeminar, setSelectedSeminar] =
    useState<IGroupedSeminar | null>(null);

  // حالات العمليات الخاصة بالـ UX
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"users" | "approved_summary">(
    "users",
  );

  const fetchData = useCallback(async () => {
    try {
      dispatch(loading());
      const res = await AxiosApi.get(
        `/auth/withlogin/places/place-plans/get-plan-to-approve/${id}`,
      );
      if (res.data?.success) {
        setRawPlans(res.data.data.plans || []);
        setTopicsTables(res.data.data.topicsTables || []);
      }
    } catch (err) {
      console.error("خطأ أثناء جلب البيانات عبر AxiosApi:", err);
    } finally {
      dispatch(close());
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  // تحويل topicsTables إلى التنسيق المطلوب من المودال
  const availableSchedules = useMemo<IServerAvailableTopic[]>(() => {
    const list: IServerAvailableTopic[] = [];
    topicsTables.forEach((table) => {
      const scheduleName = table.title;
      const mainTopicMap = new Map<string, Set<string>>();

      table.table_rows?.forEach((row) => {
        if (!mainTopicMap.has(row.mainTopic)) {
          mainTopicMap.set(row.mainTopic, new Set());
        }
        if (row.supTopic) {
          mainTopicMap.get(row.mainTopic)!.add(row.supTopic);
        }
      });

      mainTopicMap.forEach((subTopicsSet, mainTopic) => {
        list.push({
          schedule_name: scheduleName,
          main_topic: mainTopic,
          sub_topics: Array.from(subTopicsSet),
        });
      });
    });
    return list;
  }, [topicsTables]);

  const userGroups = useMemo(() => {
    const groupedMap = new Map<string, IUserGroup>();

    rawPlans.forEach((plan) => {
      const creator = plan.created_by;
      const creatorId = creator?._id || "unknown";

      if (!groupedMap.has(creatorId)) {
        groupedMap.set(creatorId, {
          user: creator || { _id: "unknown", name: "غير معروف", email: "" },
          plans: [],
        });
      }

      groupedMap.get(creatorId)!.plans.push(plan);
    });

    return Array.from(groupedMap.values());
  }, [rawPlans]);

  const groupedTables = useMemo<ITableGroupedStat[]>(() => {
    // 1. إنشاء خريطة مبنية بالكامل على topicsTables (جميع الجداول والمواضيع من السيرفر)
    const map = new Map<string, Map<string, IStatRow>>();

    topicsTables.forEach((table) => {
      const scheduleName = table.title || "بدون اسم جدول";
      if (!map.has(scheduleName)) {
        map.set(scheduleName, new Map());
      }
      const rowsMap = map.get(scheduleName)!;

      table.table_rows?.forEach((tRow) => {
        const topicKey = `${tRow.mainTopic || ""}_${tRow.supTopic || ""}`;
        if (!rowsMap.has(topicKey)) {
          rowsMap.set(topicKey, {
            main_topic: tRow.mainTopic || "-",
            sub_topic: tRow.supTopic || "-",
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

    // 2. دمج الأرقام الفعلية من rawPlans داخل الخريطة
    rawPlans.forEach((plan) => {
      const scheduleName = plan.schedule_name || "بدون اسم جدول";
      const topicKey = `${plan.main_topic || ""}_${plan.sub_topic || ""}`;

      if (!map.has(scheduleName)) {
        map.set(scheduleName, new Map());
      }

      const rowsMap = map.get(scheduleName)!;

      // في حال وجود موضوع في الخطط غير مدرج في topicsTables يتم إنشاؤه تلقائياً
      if (!rowsMap.has(topicKey)) {
        rowsMap.set(topicKey, {
          main_topic: plan.main_topic || "-",
          sub_topic: plan.sub_topic || "-",
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

      const row = rowsMap.get(topicKey)!;

      if (plan.location_type === LocationType.INTERNAL_SEMINAR) {
        row.internal_count += plan.target_seminars_count || 1;
      } else if (plan.location_type === LocationType.EXTERNAL_SEMINAR) {
        row.external_count += plan.target_seminars_count || 1;
      } else if (plan.location_type === LocationType.GENERAL_CONSULTATION) {
        row.consultation_count += plan.target_seminars_count || 1;
      } else if (plan.location_type === LocationType.PUBLIC_MEETING) {
        row.meeting_count += plan.target_seminars_count || 1;
      } else if (plan.location_type === LocationType.CONVOY_SEMINARS) {
        row.convoy_count += plan.target_seminars_count || 1;
      }

      row.media_outlets_count += plan.media_outlets_count || 0;
      row.digital_media_count += plan.digital_media_activities_count || 0;
      row.children += plan.target_attendees?.children || 0;
      row.males += plan.target_attendees?.males || 0;
      row.females += plan.target_attendees?.females || 0;
    });

    // 3. تحويل الخريطة إلى التنسيق النهائي لحساب المجاميع الإجمالية لكل جدول
    return Array.from(map.entries()).map(([schedule_name, rowsMap]) => {
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

      return { schedule_name, rows, totals };
    });
  }, [rawPlans, topicsTables]);

  const renderLocationBadge = (plan: IPlacePlanItem) => {
    switch (plan.location_type) {
      case LocationType.EXTERNAL_SEMINAR:
        return (
          <span
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md font-bold"
            title="ندوة خارجية"
          >
            <MapPin className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />
            {plan.external_location_name || "ندوة خارجية"}
          </span>
        );
      case LocationType.GENERAL_CONSULTATION:
        return (
          <span
            className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md font-bold"
            title="مشورة عامة"
          >
            <MapPin className="w-3 h-3 shrink-0 text-purple-600 dark:text-purple-400" />
            مشورة عامة
          </span>
        );
      case LocationType.PUBLIC_MEETING:
        return (
          <span
            className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md font-bold"
            title="لقاء جماهيري"
          >
            <MapPin className="w-3 h-3 shrink-0 text-blue-600 dark:text-blue-400" />
            {plan.external_location_name || "لقاء جماهيري"}
          </span>
        );
      case LocationType.CONVOY_SEMINARS:
        return (
          <span
            className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md font-bold"
            title="ندوات القوافل"
          >
            <MapPin className="w-3 h-3 shrink-0 text-teal-600 dark:text-teal-400" />
            {plan.external_location_name || "ندوات القوافل"}
          </span>
        );
      case LocationType.INTERNAL_SEMINAR:
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold"
            title="ندوة داخلية"
          >
            <MapPin className="w-3 h-3 shrink-0 text-zinc-600 dark:text-zinc-400" />
            ندوة داخلية
          </span>
        );
    }
  };

  /* 
  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((i) => i !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };
  */

  // فتح المودال لإضافة فعالية جديدة
  const handleAddNewPlan = (userId?: string) => {
    setSelectedSeminar({
      id: "new",
      schedule_name: "",
      main_topic: "",
      sub_topic: "",
      planned_date: "",
      location_type: LocationType.INTERNAL_SEMINAR,
      external_location_name: "",
      media_outlets_count: 0,
      digital_media_activities_count: 0,
      target_attendees: { males: 0, females: 0, children: 0 },
      count: 1,
      ...(userId ? { created_by: userId } : {}),
    } as any);
    setIsModalOpen(true);
  };

  // فتح المودال للتعديل
  const handleOpenEditModal = (plan: IPlacePlanItem) => {
    setSelectedSeminar({
      id: plan._id,
      schedule_name: plan.schedule_name,
      main_topic: plan.main_topic,
      sub_topic: plan.sub_topic,
      planned_date: plan.planned_date ? plan.planned_date.substring(0, 10) : "",
      location_type: plan.location_type as any,
      external_location_name: plan.external_location_name || "",
      media_outlets_count: plan.media_outlets_count || 0,
      digital_media_activities_count: plan.digital_media_activities_count || 0,
      target_attendees: plan.target_attendees || {
        males: 0,
        females: 0,
        children: 0,
      },
      count: plan.target_seminars_count || 1,
      created_by:
        typeof plan.created_by === "object"
          ? plan.created_by._id
          : plan.created_by,
    } as any);
    setIsModalOpen(true);
  };

  // حفظ التعديلات أو الإضافة عبر استدعاء الفنكشن بالسيرفر
  const handleSaveSeminarModal = async (savedSeminar: IGroupedSeminar) => {
    const planId = savedSeminar.id || "new";
    setSavingId(planId);
    try {
      const payload = {
        schedule_name: savedSeminar.schedule_name,
        main_topic: savedSeminar.main_topic,
        sub_topic: savedSeminar.sub_topic,
        planned_date: savedSeminar.planned_date,
        location_type: savedSeminar.location_type,
        external_location_name: savedSeminar.external_location_name,
        target_seminars_count: savedSeminar.count,
        count: savedSeminar.count,
        media_outlets_count: savedSeminar.media_outlets_count,
        digital_media_activities_count:
          savedSeminar.digital_media_activities_count,
        target_attendees: savedSeminar.target_attendees,
        created_by: (savedSeminar as any).created_by,
      };
      // console.log(payload);

      const res = await AxiosApi.put(
        `/auth/withlogin/places/place-plans/update-plan-to-approve/${id}/${planId}`,
        payload,
      );

      if (res.data?.success) {
        setSavedSuccessId(planId);
        setTimeout(() => setSavedSuccessId(null), 3000);
        setIsModalOpen(false);
        fetchData(); // إعادة تحميل القائمة بعد التعديل أو الدمج
      }
    } catch (err: any) {
      console.error("خطأ أثناء حفظ التعديل:", err);
      dispatch(
        open({
          state: "faild",
          title: err.response?.data?.message || "حدث خطأ أثناء حفظ الفعالية",
        }),
      );
    } finally {
      setSavingId(null);
    }
  };

  // إرسال طلب الحذف إلى الفنكشن
  const handlePlanDelete = async (planId: string) => {
    if (window.confirm("هل أنت تأكد من رغبتك في حذف هذا الصف؟")) {
      setDeletingId(planId);
      try {
        const res = await AxiosApi.put(
          `/auth/withlogin/places/place-plans/update-plan-to-approve/${id}/${planId}`,
          { action: "DELETE" },
        );

        if (res.data?.success) {
          fetchData();
        }
      } catch (err: any) {
        console.error("خطأ أثناء الحذف:", err);
        dispatch(
          open({
            state: "faild",
            title: err.response?.data?.message || "حدث خطأ أثناء حذف الصف",
          }),
        );
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleApproveUserTable = async (userId: string) => {
    if (window.confirm("اعتماد كافة الخطط لهذا الموظف؟")) {
      try {
        const res = await AxiosApi.post(
          `/auth/withlogin/places/place-plans/approve-plan/${id}`,
          { userIdToApprove: userId },
        );
        if (res.data?.success) {
          fetchData();
        }
      } catch (err: any) {
        dispatch(
          open({
            state: "faild",
            title:
              err.response?.data?.message || "حدث خطأ أثناء اعتماد خطط الموظف",
          }),
        );
      }
    }
  };

  /* 
  const handleMergeSelectedUsers = () => {
    if (selectedUserIds.length < 2) return;
    if (
      window.confirm(
        `تأكيد دمج خطط الموظفين المحددين وعددهم (${selectedUserIds.length})؟`,
      )
    ) {
      console.log("دمج مستخدمين:", selectedUserIds);
    }
  };
  */

  return (
    <div className=" bg-slate-50 dark:bg-slate-950 min-h-screen dir-rtl font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            اعتماد ومراجعة الخطط التشغيلية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            إدارة، مراجعة، واعتماد الخطط المقدمة من الموظفين
          </p>
        </div>

        {activeTab === "users" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddNewPlan()}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-xs flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة فعالية جديدة</span>
            </button>

            {/* 
        <button
          onClick={handleMergeSelectedUsers}
          disabled={selectedUserIds.length < 2}
          className={`px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all text-xs flex items-center gap-2 ${
            selectedUserIds.length >= 2
              ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-amber-200"
              : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
          }`}
        >
          <span>🔀 دمج الخطط المحددة ({selectedUserIds.length})</span>
        </button>
        */}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "users"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>خطط الموظفين التفصيلية</span>
        </button>

        <button
          onClick={() => setActiveTab("approved_summary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "approved_summary"
              ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>التجميعة المعتمدة (Approved)</span>
        </button>
      </div>

      {activeTab === "approved_summary" && (
        <div className="mb-8">
          <ApprovedStatisticalSummaryTab
            groupedTables={groupedTables}
            placeId={id}
            fetchData={fetchData}
          />
        </div>
      )}

      {activeTab === "users" && (
        <>
          {userGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
              لا توجد خطط معلقة قيد المراجعة حالياً.
            </div>
          ) : (
            userGroups.map((group) => {
              // const isSelected = selectedUserIds.includes(group.user._id);
              return (
                <div
                  key={group.user._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden transition-all"
                >
                  <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      {/* 
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUserSelection(group.user._id)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {group.user?.avatar_url ? (
                            <img
                              src={group.user.avatar_url}
                              alt={
                                group.user.first_name.charAt(0).toUpperCase() +
                                group.user.last_name.charAt(0).toUpperCase()
                              }
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span aria-hidden="true">👤</span>
                          )}
                          {group.user.first_name} {group.user.last_name}
                          {group.user.email && (
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                              ({group.user.email})
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddNewPlan(group.user._id)}
                        className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-800/60"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>إضافة لهذه الخطة</span>
                      </button>

                      <button
                        onClick={() => handleApproveUserTable(group.user._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm"
                      >
                        ✓ اعتماد جدول الموظف كاملاً
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[70vh] rounded-b-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 max-lg:bg-transparent max-lg:border-0 max-lg:shadow-none">
                    <table className="w-full custom-scrollbar text-right text-xs max-lg:block max-lg:whitespace-normal">
                      <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold max-lg:hidden shadow-sm max-lg:bg-transparent">
                        <tr className="text-center">
                          <th className="p-1">اسم الجدول الفعلي</th>
                          <th className="p-1">الموضوع الرئيسي</th>
                          <th className="p-1">الموضوع الفرعي</th>
                          <th className="p-1">تاريخ الفعالية</th>
                          <th className="p-1">نوع المكان</th>
                          <th className="p-1 text-center">العدد</th>
                          <th className="p-1 text-center">التغطية الإعلامية</th>
                          <th className="p-1 text-center">الحضور المستهدف</th>
                          <th className="p-1 text-center">
                            الحالة / الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 max-lg:block max-lg:space-y-4 max-lg:divide-y-0 max-lg:bg-transparent">
                        {group.plans.map((plan) => {
                          return (
                            <tr
                              key={plan._id}
                              className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors max-lg:block max-lg:rounded-2xl max-lg:border max-lg:border-slate-200 dark:max-lg:border-slate-800 max-lg:bg-white dark:max-lg:bg-slate-900 max-lg:p-4 max-lg:shadow-sm max-lg:hover:bg-white dark:max-lg:hover:bg-slate-900"
                            >
                              <td
                                data-label="اسم الجدول الفعلي"
                                className="p-1 font-bold text-slate-800 dark:text-slate-100 max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2">
                                  {plan.schedule_name || "جدول تشغيلي"}
                                </div>
                              </td>

                              <td
                                data-label="الموضوع الرئيسي"
                                className="p-1 text-slate-700 dark:text-slate-300 font-medium max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2">
                                  {plan.main_topic || "—"}
                                </div>
                              </td>

                              <td
                                data-label="الموضوع الفرعي"
                                className="p-1 text-slate-600 dark:text-slate-400 max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2">
                                  {plan.sub_topic || "—"}
                                </div>
                              </td>

                              <td
                                data-label="تاريخ الفعالية"
                                className="p-1 text-slate-600 dark:text-slate-400 whitespace-nowrap max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:whitespace-normal max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                  {plan.planned_date
                                    ? plan.planned_date.substring(0, 10)
                                    : "—"}
                                </div>
                              </td>

                              <td
                                data-label="نوع المكان"
                                className="p-1 text-slate-600 dark:text-slate-400 max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2">
                                  {renderLocationBadge(plan)}
                                </div>
                              </td>

                              <td
                                data-label="العدد"
                                className="p-1 text-center max-lg:text-right max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2">
                                  <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black rounded-lg inline-block">
                                    {plan.target_seminars_count || 1}
                                  </span>
                                </div>
                              </td>

                              <td
                                data-label="التغطية الإعلامية"
                                className="p-1 text-center max-lg:text-right max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2 flex lg:flex-col xl:flex-row items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 justify-center max-lg:justify-start">
                                  <span
                                    className="flex items-center gap-1"
                                    title="وسائل الإعلام"
                                  >
                                    <Radio className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                    {plan.media_outlets_count || 0}
                                  </span>
                                  <span>•</span>
                                  <span
                                    className="flex items-center gap-1"
                                    title="الأنشطة الرقمية"
                                  >
                                    <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    {plan.digital_media_activities_count || 0}
                                  </span>
                                </div>
                              </td>

                              <td
                                data-label="الحضور المستهدف"
                                className="p-1 text-center max-lg:text-right max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2 flex lg:flex-col xl:flex-row items-center gap-1.5 text-[11px] justify-center max-lg:justify-start max-lg:flex-wrap text-slate-700 dark:text-slate-300">
                                  <span title="ذكور">
                                    👨 {plan.target_attendees?.males || 0}
                                  </span>
                                  <span>•</span>
                                  <span title="إناث">
                                    👩 {plan.target_attendees?.females || 0}
                                  </span>
                                  <span>•</span>
                                  <span title="أطفال">
                                    👶 {plan.target_attendees?.children || 0}
                                  </span>
                                </div>
                              </td>

                              <td
                                data-label="الحالة / الإجراءات"
                                className="p-1 text-center whitespace-nowrap max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:whitespace-normal max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                              >
                                <div className="max-lg:col-span-2 flex lg:flex-col xl:flex-row items-center justify-center max-lg:justify-start gap-2 max-lg:flex-wrap">
                                  {savingId === plan._id && (
                                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                  )}
                                  {savedSuccessId === plan._id && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(plan)}
                                    className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 font-bold"
                                    title="تعديل الندوة"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={deletingId === plan._id}
                                    onClick={() => handlePlanDelete(plan._id)}
                                    className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 font-bold disabled:opacity-50"
                                    title="حذف الندوة"
                                  >
                                    {deletingId === plan._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
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
              );
            })
          )}
        </>
      )}

      {/* المودال للإنشاء والتعديل */}
      {isModalOpen && (
        <SeminarModal
          seminar={selectedSeminar}
          availableSchedules={availableSchedules}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSeminar(null);
          }}
          onSave={handleSaveSeminarModal}
        />
      )}
    </div>
  );
};
