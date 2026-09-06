// PlaceEventsSection.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
// import { EventsActionsHeader } from "./components/EventsActionsHeader.tsx";
// import {
//   EventsFilterSection,
//   type FilterState,
// } from "./components/EventsFilterSection.tsx";
// import { EventsAnalyticsSection } from "./components/EventsAnalyticsSection.tsx";
// import { EventsListSection } from "./components/EventsListSection.tsx";
// import { PlacePermission } from "../../PlaceLayout.tsx";
import { usePlacePermissions } from "../../../../../../Redux-Store/PlacePermissions/usePlacePermissions.ts";
import {
  EventsFilterSection,
  type FilterState,
} from "../Filter/EventsFilterSection.tsx";
import { EventsActionsHeader } from "./EventsActionsHeader.tsx";
import { EventsAnalyticsSection } from "../Filter/EventsAnalyticsSection.tsx";
import { EventsListSection } from "../Filter/EventsListSection.tsx";
import { PlacePermission } from "../../../types.ts";

const PlaceWorkLayout: React.FC = () => {
  // 1. جلب id المكان مباشرة من مسار الصفحات (URL Params)
  const { id } = useParams<{ id: string }>();
  const placeId = id || "";

  // 2. التحقق من الصلاحيات مباشرة من الـ Hook
  const { hasPermission } = usePlacePermissions();
  const canCreateEvent = hasPermission(PlacePermission.CREATE_EVENT);
  // const canCreatePlan = hasPermission(PlacePermission.CREATE_PLAN);
  const canEditEvent = hasPermission(PlacePermission.EDIT_EVENT);

  // 3. حالة الفلترة المتقدمة (الافتراضي: الكل محدد)
  const [filters, setFilters] = useState<FilterState>({
    selectedPlaces: ["ALL"],
    selectedEventType: "ALL",
    dateRange: { start: "", end: "" },
  });

  // 4. حالة إظهار/إخفاء الفلترة المخصصة
  const [showFilters, setShowFilters] = useState<boolean>(false);

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* الجزء الثالث: الهيدر الخاص بأزرار التوجيه لصفحات الخطة والندوات الخارجية */}
      <EventsActionsHeader canCreateEvent={canCreateEvent} />

      {/* الجزء الأول: الفلترة وإعداداتها الافتراضية والتخصيص */}
      <EventsFilterSection
        filters={filters}
        onChangeFilters={setFilters}
        showFilters={showFilters}
        onToggleShowFilters={() => setShowFilters(!showFilters)}
      />

      {/* الجزء الثاني: النسب والمعدلات المعتمدة على الفلترة */}
      <EventsAnalyticsSection filters={filters} />

      {/* الجزء الرابع: قائمة الندوات المسجلة ضمن نطاق الفلترة */}
      <EventsListSection
        placeId={placeId}
        canCreateEvent={canCreateEvent}
        canEditEvent={canEditEvent}
        filters={filters}
      />
    </div>
  );
};

export default PlaceWorkLayout;
