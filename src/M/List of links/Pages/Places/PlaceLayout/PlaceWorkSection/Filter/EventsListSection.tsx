import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Loader2,
  User,
  FileText,
  Users,
  Share2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../../../store.tsx";
import {
  LocationType,
  locationTypeLabels,
  PlacePermission,
} from "../../../types.ts";
import { usePlacePermissions } from "../../../../../../Redux-Store/PlacePermissions/usePlacePermissions.ts";
import { EditItemModal } from "./Components/EditItemModal.tsx";
import {
  deleteEvent,
  fetchCanCreatePlaceEvent,
  updateApprovedPlan,
  updateEvent,
} from "../../../../../../Redux-Store/EventsFilter/eventsFilterSlice.ts";
import { useParams } from "react-router-dom";
import { PdfPreviewModal } from "./PDF/PdfPreviewModal.tsx";

type SortKey =
  | "place"
  | "creator"
  | "schedule"
  | "mainTopic"
  | "subTopic"
  | "date"
  | "locationType"
  | "count"
  | "media"
  | "attendees";

type SortOrder = "asc" | "desc";

const SortIcon: React.FC<{
  columnKey: SortKey;
  sortKey: SortKey;
  sortOrder: SortOrder;
}> = ({ columnKey, sortKey, sortOrder }) => {
  const isActive = sortKey === columnKey;

  if (!isActive) {
    return (
      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    );
  }

  return (
    <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-indigo-200">
      {sortOrder === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
      )}
    </div>
  );
};

const EventsListSectionInner: React.FC = () => {
  // console.log("rerender comp ...");
  const { id: placeId } = useParams();
  // console.log(placeId);
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePlacePermissions();

  const [isPdfModalOpenTables, setIsPdfModalOpenTables] = useState(false);
  const [isPdfModalOpenRows, setIsPdfModalOpenRows] = useState(false);

  const canEditPlan = hasPermission(PlacePermission.EDIT_PLAN);
  const canDeletePlan = hasPermission(PlacePermission.DELETE_PLAN);
  const canEditEvent = hasPermission(PlacePermission.EDIT_EVENT);
  const canDeleteEvent = hasPermission(PlacePermission.DELETE_EVENT);

  const {
    events = [],
    filterLoading = false,
    plans = [],
    instructors = [],
    canCreateForOthers = false,
    schedules = [],
  } = useSelector((state: RootState) => state.eventsFilter);

  useEffect(() => {
    if (placeId) {
      dispatch(fetchCanCreatePlaceEvent(placeId));
    }
  }, [dispatch, placeId]);

  const [activeTab, setActiveTab] = useState<"plans" | "events">("plans");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const rawList = activeTab === "plans" ? plans : events;

  const getSortableValue = useCallback((item: any, key: SortKey) => {
    switch (key) {
      case "place":
        return typeof item.place_id === "object"
          ? item.place_id?.name || ""
          : item.place_id || "";
      case "creator": {
        const creator = item.instructor_info;
        return creator
          ? typeof creator === "object"
            ? `${creator.first_name || ""} ${creator.last_name || ""}`.trim()
            : String(creator)
          : "";
      }
      case "schedule":
        return item.schedule_name || "";
      case "mainTopic":
        return item.main_topic || item.mainTopic || "";
      case "subTopic":
        return item.sub_topic || item.subTopic || "";
      case "date": {
        const d = item.event_date || item.planned_date;
        return d ? new Date(d).getTime() : 0;
      }
      case "locationType":
        return (
          locationTypeLabels[item.location_type as LocationType] ||
          item.location_type ||
          ""
        );
      case "count":
        return item.target_seminars_count || item.seminars_count || 1;
      case "media":
        return (
          (item.digital_media_activities_count || 0) +
          (item.media_outlets_count || 0)
        );
      case "attendees":
        return item.target_total_attendees || item.total_attendees || 0;
      default:
        return "";
    }
  }, []);

  const currentList = useMemo(() => {
    return [...rawList].sort((a, b) => {
      const valA = getSortableValue(a, sortKey);
      const valB = getSortableValue(b, sortKey);

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB), "ar");
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [rawList, sortKey, sortOrder, getSortableValue]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getHeaderClass = (key: SortKey, alignCenter = false) => {
    const isActive = sortKey === key;
    return `group p-3.5 whitespace-nowrap cursor-pointer transition-all select-none ${
      isActive
        ? "bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-extrabold border-b-2 border-indigo-600 dark:border-indigo-400"
        : "hover:bg-gray-100/80 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-bold"
    } ${alignCenter ? "text-center" : ""}`;
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    if (activeTab === "plans") {
      // استخراج معرّف المكان ومعرّف الخطة بشكل أمن
      const placeId =
        typeof deletingItem.place_id === "object"
          ? deletingItem.place_id?._id || deletingItem.place_id?.id
          : deletingItem.place_id;

      const planId = deletingItem._id || deletingItem.id;

      if (!placeId || !planId) {
        console.error("بيانات الحذف غير اكتمالية (placeId أو planId مفقود)");
        return;
      }

      try {
        // إرسال الطلب بنفس الروت عن طريق تمرير action: "DELETE"
        await dispatch(
          updateApprovedPlan({
            placeId,
            planId,
            action: "DELETE",
          }),
        ).unwrap();

        setDeletingItem(null);
      } catch (err: any) {
        console.error("فشل حذف الخطة المعتمدة:", err);
      }
    } else {
      // في حال إضافة منطق لحذف الفعاليات (events) مستقبلاً
      setDeletingItem(null);

      const placeId =
        typeof deletingItem.place_id === "object"
          ? deletingItem.place_id?._id || deletingItem.place_id?.id
          : deletingItem.place_id;

      const eventId = deletingItem._id || deletingItem.id;

      if (!placeId || !eventId) {
        console.error("بيانات الحذف غير اكتمالية (placeId أو eventId مفقود)");
        return;
      }

      try {
        // إرسال الطلب بنفس الروت عن طريق تمرير action: "DELETE"
        await dispatch(
          deleteEvent({
            placeId,
            eventId,
          }),
        ).unwrap();

        setDeletingItem(null);
      } catch (err: any) {
        console.error("فشل حذف الندوة:", err);
      }
    }
  };

  const handleSaveEdit = async (updatedItem: any) => {
    if (activeTab === "plans") {
      const placeId = updatedItem.place_id || updatedItem.placeId;
      const planId = updatedItem._id || updatedItem.id;

      const payload = {
        placeId,
        planId,
        action: "UPDATE" as const,
        count: updatedItem.count,
        schedule_name: updatedItem.schedule_name,
        main_topic: updatedItem.main_topic,
        sub_topic: updatedItem.sub_topic,
        planned_date: updatedItem.date,
        location_type: updatedItem.location_type,
        external_location_name: updatedItem.external_location_name,
        media_outlets_count: updatedItem.media_outlets_count,
        digital_media_activities_count:
          updatedItem.digital_media_activities_count,
        target_attendees: updatedItem.attendees,
      };

      try {
        await dispatch(updateApprovedPlan(payload)).unwrap();
        setEditingItem(null);
      } catch (err: any) {
        console.error("فشل تحديث الخطة المعتمدة:", err);
      }
    } else {
      // تعديل الندوة (Event)
      const placeId =
        typeof updatedItem.place_id === "object"
          ? updatedItem.place_id._id
          : updatedItem.place_id || updatedItem.placeId;

      const eventId = updatedItem._id || updatedItem.id;

      const payload = {
        placeId,
        eventId,
        count: updatedItem.count,
        schedule_name: updatedItem.schedule_name,
        main_topic: updatedItem.main_topic,
        sub_topic: updatedItem.sub_topic,
        event_date: updatedItem.date || updatedItem.event_date,
        location_type: updatedItem.location_type,
        external_location_name: updatedItem.external_location_name,
        instructor_info:
          typeof updatedItem.instructor_info === "object"
            ? updatedItem.instructor_info._id
            : updatedItem.instructor_info,
        media_outlets_count: updatedItem.media_outlets_count,
        digital_media_activities_count:
          updatedItem.digital_media_activities_count,
        attendees: updatedItem.attendees,
      };

      // console.log("تحديث بيانات الندوة:", payload);

      try {
        await dispatch(updateEvent(payload)).unwrap();
        setEditingItem(null);
      } catch (err: any) {
        console.error("فشل تحديث بيانات الندوة:", err);
      }
    }
  };

  const hasActionPermissions =
    (activeTab === "plans" && (canEditPlan || canDeletePlan)) ||
    (activeTab === "events" && (canEditEvent || canDeleteEvent));

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 dir-rtl"
      dir="rtl"
    >
      {/* الترويسة وأزرار التنقل */}
      <div className="flex flex-col xl:flex-row sm:items-center md:justify-between md:items-start gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>سجل الخطة والأعمال الميدانية</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            استعرض التكليفات المخططة والندوات والأنشطة المنجزة في المكان
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 dark:bg-gray-700/60 p-1 rounded-xl self-start sm:self-auto border border-gray-200/50 dark:border-gray-600/50 w-full sm:w-auto overflow-x-hidden">
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "plans"
                ? "bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 shadow-sm border border-gray-200/60 dark:border-gray-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الخطط المقررة</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "plans"
                  ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              {plans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "events"
                ? "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/60 dark:border-gray-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>الفعاليات والندوات المنفذة</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "events"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              {events.length}
            </span>
          </button>
        </div>
      </div>

      {/* محتوى الجدول / التحميل / الحالة الفارغة */}
      {filterLoading ? (
        <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            جاري تحميل البيانات المفلترة...
          </p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            لا توجد {activeTab === "plans" ? "خطط" : "ندوات منفذة"} مسجلة ضمن
            نطاق الفلترة المحدد.
          </p>
        </div>
      ) : (
        <div className="custom-scrollbar overflow-x-auto rounded-xl border-0 md:border md:border-gray-200/80 md:dark:border-gray-700 shadow-none md:shadow-sm max-h-[600px] overflow-y-auto">
          <table className="w-full text-right border-collapse text-xs md:table">
            <thead className="hidden md:table-header-group sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 shadow-xs">
              <tr>
                <th
                  onClick={() => handleSort("place")}
                  className={`${getHeaderClass("place")} min-w-[150px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>المكان</span>
                    <SortIcon
                      columnKey="place"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                {activeTab === "events" && (
                  <th
                    onClick={() => handleSort("creator")}
                    className={`${getHeaderClass("creator")} min-w-[150px] p-0.5`}
                  >
                    <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                      <span>القائم بالفعالية</span>
                      <SortIcon
                        columnKey="creator"
                        sortKey={sortKey}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                )}

                <th
                  onClick={() => handleSort("schedule")}
                  className={`${getHeaderClass("schedule")} min-w-[150px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>اسم الجدول</span>
                    <SortIcon
                      columnKey="schedule"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("mainTopic")}
                  className={`${getHeaderClass("mainTopic")} min-w-[180px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>الموضوع الرئيسي</span>
                    <SortIcon
                      columnKey="mainTopic"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("subTopic")}
                  className={`${getHeaderClass("subTopic")} min-w-[180px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>الموضوع الفرعي</span>
                    <SortIcon
                      columnKey="subTopic"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("date")}
                  className={`${getHeaderClass("date")} min-w-[120px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>تاريخ الفعالية</span>
                    <SortIcon
                      columnKey="date"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("locationType")}
                  className={`${getHeaderClass("locationType")} min-w-[110px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>نوع المكان</span>
                    <SortIcon
                      columnKey="locationType"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("count")}
                  className={`${getHeaderClass("count", true)} min-w-[50px] p-0.5`}
                >
                  <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <span>العدد</span>
                    <SortIcon
                      columnKey="count"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("media")}
                  className={`${getHeaderClass("media")} min-w-[140px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>التغطية الإعلامية</span>
                    <SortIcon
                      columnKey="media"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("attendees")}
                  className={`${getHeaderClass("attendees")} min-w-[200px] p-0.5`}
                >
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <span>الحضور المستهدف / الفعلي</span>
                    <SortIcon
                      columnKey="attendees"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                {hasActionPermissions && (
                  <th className="p-0.5 whitespace-nowrap text-center font-bold text-gray-700 dark:text-gray-300 min-w-[120px]">
                    الإجراءات
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800 space-y-3 md:space-y-0 block md:table-row-group">
              {currentList.map((item: any) => {
                const itemId = item._id || item.id;
                const placeName =
                  typeof item.place_id === "object"
                    ? item.place_id?.name
                    : item.place_id || "غير محدد";

                const creator = item.instructor_info;
                const creatorName = creator
                  ? typeof creator === "object"
                    ? `${creator.first_name || ""} ${creator.last_name || ""}`.trim()
                    : creator
                  : "غير محدد";

                const mediaOutlets = item.media_outlets_count || 0;
                const digitalActivities =
                  item.digital_media_activities_count || 0;
                const attendees = item.target_attendees || item.attendees || {};
                const totalAttendees =
                  item.target_total_attendees || item.total_attendees || 0;

                return (
                  <tr
                    key={itemId}
                    className="block md:table-row grid grid-cols-1 md:grid-none p-3 md:p-0 rounded-xl md:rounded-none border border-gray-200 dark:border-gray-700 md:border-none shadow-sm md:shadow-none hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors text-gray-800 dark:text-gray-200"
                  >
                    <td
                      data-label="المكان"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "place"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        المكان:
                      </span>
                      <div className="flex items-center gap-2 col-span-2 md:col-span-1 ">
                        {item.place_id?.metadata?.photo_url ? (
                          <img
                            src={item.place_id.metadata.photo_url}
                            alt={placeName}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                            <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                        <span className="truncate">{placeName}</span>
                      </div>
                    </td>

                    {activeTab === "events" && (
                      <td
                        data-label="القائم بالفعالية"
                        className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                          sortKey === "creator"
                            ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                            : ""
                        }`}
                      >
                        <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                          القائم بالفعالية:
                        </span>
                        <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                          {creator?.avatar_url ? (
                            <img
                              src={creator.avatar_url}
                              alt={creatorName}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                            {creatorName}
                          </span>
                        </div>
                      </td>
                    )}

                    <td
                      data-label="اسم الجدول"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "schedule"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        اسم الجدول:
                      </span>
                      <div className="col-span-2 md:col-span-1 flex ">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md font-medium text-[11px] border border-gray-200/60 dark:border-gray-600 inline-block truncate">
                          {item.schedule_name || "بدون جدول"}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="الموضوع الرئيسي"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "mainTopic"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        الموضوع الرئيسي:
                      </span>
                      <span className="col-span-2 md:col-span-1 ">
                        {item.main_topic || item.mainTopic || "-"}
                      </span>
                    </td>

                    <td
                      data-label="الموضوع الفرعي"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "subTopic"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        الموضوع الفرعي:
                      </span>
                      <span className="col-span-2 md:col-span-1 ">
                        {item.sub_topic || item.subTopic || "-"}
                      </span>
                    </td>

                    <td
                      data-label="تاريخ الفعالية"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "date"
                          ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        التاريخ:
                      </span>
                      <div className="flex items-center gap-1.5 font-medium col-span-2 md:col-span-1 ">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>
                          {formatDate(item.event_date || item.planned_date)}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="نوع المكان"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "locationType"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        نوع المكان:
                      </span>
                      <div className="col-span-2 md:col-span-1 flex ">
                        <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-blue-100 dark:border-blue-900/50 inline-block">
                          {locationTypeLabels[
                            item.location_type as LocationType
                          ] ||
                            item.location_type ||
                            "غير محدد"}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="العدد"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 text-center font-extrabold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "count"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1 text-right">
                        العدد:
                      </span>
                      <div className="col-span-2 md:col-span-1 flex md:justify-center">
                        <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full min-w-[24px]">
                          {item.target_seminars_count ||
                            item.seminars_count ||
                            1}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="التغطية الإعلامية"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "media"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        التغطية الإعلامية:
                      </span>
                      <div className="flex flex-col gap-1 text-[11px] col-span-2 md:col-span-1">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Share2 className="w-3 h-3 text-sky-500 shrink-0" />
                          إعلام رقمي:{" "}
                          <strong className="text-gray-900 dark:text-gray-100 font-bold">
                            {digitalActivities}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          وسائل إعلامية:{" "}
                          <strong className="text-gray-900 dark:text-gray-100 font-bold">
                            {mediaOutlets}
                          </strong>
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="الحضور المستهدف / الفعلي"
                      className={`grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 border-b border-gray-100 dark:border-gray-700/50 md:border-none ${
                        sortKey === "attendees"
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                          : ""
                      }`}
                    >
                      <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1">
                        الحضور:
                      </span>
                      <div className="space-y-1 md:text-right col-span-2 md:col-span-1 flex flex-col md:items-start">
                        <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-gray-100 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>الإجمالي: {totalAttendees}</span>
                        </div>
                        <div className="flex w-fit items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-1 rounded border border-gray-100 dark:border-gray-600">
                          <span>ذكور: {attendees.males || 0}</span>
                          <span className="text-gray-300 dark:text-gray-600">
                            •
                          </span>
                          <span>إناث: {attendees.females || 0}</span>
                          <span className="text-gray-300 dark:text-gray-600">
                            •
                          </span>
                          <span>أطفال: {attendees.children || 0}</span>
                        </div>
                      </div>
                    </td>

                    {hasActionPermissions && (
                      <td
                        data-label="الإجراءات"
                        className="grid grid-cols-3 md:table-cell items-center p-1 md:p-0.5 text-center"
                      >
                        <span className="md:hidden font-bold text-gray-500 dark:text-gray-400 col-span-1 text-right">
                          الإجراءات:
                        </span>
                        <div className="flex items-center  md:justify-center gap-1 col-span-2 md:col-span-1">
                          {((activeTab === "plans" && canEditPlan) ||
                            (activeTab === "events" && canEditEvent)) && (
                            <button
                              onClick={() => setEditingItem({ ...item })}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {((activeTab === "plans" && canDeletePlan) ||
                            (activeTab === "events" && canDeleteEvent)) && (
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال التأكيد للحذف */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                تأكيد حذف {activeTab === "plans" ? "الخطة" : "الفعالية"}
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              هل أنت تأكد من رغبتك في حذف هذا العنصر؟ لن تتمكن من استعادته بعد
              الحذف.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال التعديل */}
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        activeTab={activeTab}
        availableSchedules={schedules}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        instructors={instructors}
        canCreateForOthers={canCreateForOthers}
      />

      {/* أزرار التحميل والتصدير */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          onClick={() => setIsPdfModalOpenTables(true)}
          className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors shadow-sm cursor-pointer text-center"
        >
          عرض وتحميل الجداول PDF
        </button>

        <button
          onClick={() => setIsPdfModalOpenRows(true)}
          className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors shadow-sm cursor-pointer text-center"
        >
          عرض وتحميل الصفوف PDF
        </button>
      </div>

      {isPdfModalOpenTables && (
        <PdfPreviewModal
          isOpen={isPdfModalOpenTables}
          onClose={() => setIsPdfModalOpenTables(false)}
          schedules={schedules}
          rawList={rawList}
          planeOrEvent={activeTab}
          for={"tables"}
        />
      )}
      {isPdfModalOpenRows && (
        <PdfPreviewModal
          isOpen={isPdfModalOpenRows}
          onClose={() => setIsPdfModalOpenRows(false)}
          schedules={schedules}
          rawList={rawList}
          planeOrEvent={activeTab}
          for={"rows"}
        />
      )}
    </div>
  );
};

export const EventsListSection = React.memo(EventsListSectionInner);
