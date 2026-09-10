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

export const EventsListSection: React.FC = () => {
  const { id: placeId } = useParams();
  // console.log(placeId);
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePlacePermissions();

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
        ? "bg-indigo-50/80 text-indigo-900 font-extrabold border-b-2 border-indigo-600"
        : "hover:bg-gray-100/80 text-gray-700 font-bold"
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
      className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6 dir-rtl"
      dir="rtl"
    >
      {/* الترويسة وأزرار التنقل */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <span>سجل الخطة والأعمال الميدانية</span>
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            استعرض التكليفات المخططة والندوات والأنشطة المنجزة في المكان
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl self-start sm:self-auto border border-gray-200/50">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "plans"
                ? "bg-white text-indigo-700 shadow-sm border border-gray-200/60"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الخطط المقررة</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "plans"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {plans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "events"
                ? "bg-white text-emerald-700 shadow-sm border border-gray-200/60"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>الفعاليات والندوات المنفذة</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "events"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {events.length}
            </span>
          </button>
        </div>
      </div>

      {/* محتوى الجدول / التحميل / الحالة الفارغة */}
      {filterLoading ? (
        <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-gray-600">
            جاري تحميل البيانات المفلترة...
          </p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">
            لا توجد {activeTab === "plans" ? "خطط" : "ندوات منفذة"} مسجلة ضمن
            نطاق الفلترة المحدد.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200/80 shadow-sm max-h-[600px] overflow-y-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 shadow-xs">
              <tr>
                <th
                  onClick={() => handleSort("place")}
                  className={getHeaderClass("place")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                    className={getHeaderClass("creator")}
                  >
                    <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("schedule")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("mainTopic")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("subTopic")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("date")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("locationType")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("count", true)}
                >
                  <div className="flex items-center justify-center gap-1.5">
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
                  className={getHeaderClass("media")}
                >
                  <div className="flex items-center justify-between gap-2">
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
                  className={getHeaderClass("attendees")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>الحضور المستهدف / الفعلي</span>
                    <SortIcon
                      columnKey="attendees"
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                    />
                  </div>
                </th>

                {hasActionPermissions && (
                  <th className="p-3.5 whitespace-nowrap text-center font-bold text-gray-700">
                    الإجراءات
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
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
                    className="hover:bg-indigo-50/30 transition-colors text-gray-800"
                  >
                    <td
                      className={`p-3.5 font-semibold text-gray-900 whitespace-nowrap ${
                        sortKey === "place" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.place_id?.metadata?.photo_url ? (
                          <img
                            src={item.place_id.metadata.photo_url}
                            alt={placeName}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-3 h-3 text-indigo-600" />
                          </div>
                        )}
                        <span>{placeName}</span>
                      </div>
                    </td>

                    {activeTab === "events" && (
                      <td
                        className={`p-3.5 whitespace-nowrap ${
                          sortKey === "creator" ? "bg-indigo-50/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {creator?.avatar_url ? (
                            <img
                              src={creator.avatar_url}
                              alt={creatorName}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                          )}
                          <span className="font-medium text-gray-800">
                            {creatorName}
                          </span>
                        </div>
                      </td>
                    )}

                    <td
                      className={`p-3.5 whitespace-nowrap ${
                        sortKey === "schedule" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium text-[11px] border border-gray-200/60">
                        {item.schedule_name || "بدون جدول"}
                      </span>
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap font-medium text-gray-900 ${
                        sortKey === "mainTopic" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      {item.main_topic || item.mainTopic || "-"}
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap text-gray-600 ${
                        sortKey === "subTopic" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      {item.sub_topic || item.subTopic || "-"}
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap text-gray-700 ${
                        sortKey === "date" ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>
                          {formatDate(item.event_date || item.planned_date)}
                        </span>
                      </div>
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap ${
                        sortKey === "locationType" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-blue-100">
                        {locationTypeLabels[
                          item.location_type as LocationType
                        ] ||
                          item.location_type ||
                          "غير محدد"}
                      </span>
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap text-center font-extrabold text-gray-900 ${
                        sortKey === "count" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full min-w-[24px]">
                        {item.target_seminars_count || item.seminars_count || 1}
                      </span>
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap ${
                        sortKey === "media" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Share2 className="w-3 h-3 text-sky-500 shrink-0" />
                          إعلام رقمي:{" "}
                          <strong className="text-gray-900 font-bold">
                            {digitalActivities}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          وسائل إعلامية:{" "}
                          <strong className="text-gray-900 font-bold">
                            {mediaOutlets}
                          </strong>
                        </span>
                      </div>
                    </td>

                    <td
                      className={`p-3.5 whitespace-nowrap ${
                        sortKey === "attendees" ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-bold text-gray-900 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>الإجمالي: {totalAttendees}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 p-1 rounded border border-gray-100">
                          <span>ذكور: {attendees.males || 0}</span>
                          <span className="text-gray-300">•</span>
                          <span>إناث: {attendees.females || 0}</span>
                          <span className="text-gray-300">•</span>
                          <span>أطفال: {attendees.children || 0}</span>
                        </div>
                      </div>
                    </td>

                    {hasActionPermissions && (
                      <td className="p-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {((activeTab === "plans" && canEditPlan) ||
                            (activeTab === "events" && canEditEvent)) && (
                            <button
                              onClick={() => setEditingItem({ ...item })}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {((activeTab === "plans" && canDeletePlan) ||
                            (activeTab === "events" && canDeleteEvent)) && (
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900">
                تأكيد حذف {activeTab === "plans" ? "الخطة" : "الفعالية"}
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              هل أنت تأكد من رغبتك في حذف هذا العنصر؟ لن تتمكن من استعادته بعد
              الحذف.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm cursor-pointer"
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
    </div>
  );
};
