import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePlacePermissions } from "../../../../../../Redux-Store/PlacePermissions/usePlacePermissions.ts";
import {
  EventsFilterSection,
  type FilterState,
} from "../Filter/EventsFilterSection.tsx";
import { EventsActionsHeader } from "./EventsActionsHeader.tsx";
import { EventsAnalyticsSection } from "../Filter/EventsAnalyticsSection.tsx";
import { EventsListSection } from "../Filter/EventsListSection.tsx";
import { PlacePermission } from "../../../types.ts";
import type { AppDispatch, RootState } from "../../../../../../../store.tsx";
import {
  fetchFilterData,
  applyEventsFilter,
} from "../../../../../../Redux-Store/EventsFilter/eventsFilterSlice.ts";

export const PlaceWorkLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const placeId = id || "";

  // جلب خيارات الفلترة المبدئية من Redux Store
  const { places, schedules } = useSelector(
    (state: RootState) => state.eventsFilter,
  );

  const todayDate = new Date().toISOString().split("T")[0];

  const { hasPermission } = usePlacePermissions();
  const canCreateEvent = hasPermission(PlacePermission.CREATE_EVENT);

  const [filters, setFilters] = useState<FilterState>({
    selectedPlaces: placeId ? [placeId] : ["MAIN_PLACE"],
    selectedEventTypes: ["ALL"],
    dateRange: {
      start: todayDate,
      end: todayDate,
    },
    topicsFilter: {
      isAllTopics: true,
      customTopics: [],
    },
  });

  const [showFilters, setShowFilters] = useState<boolean>(false);

  // 1. جلب بيانات الخيارات (الأماكن والجداول) عند تغيير placeId
  useEffect(() => {
    if (placeId) {
      dispatch(fetchFilterData(placeId));

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters((prev) => ({
        ...prev,
        selectedPlaces: [placeId],
      }));
    }
  }, [placeId, dispatch]);

  // 2. إرسال طلب الفلترة إلى السيرفر كلما تغيرت قيم الفلاتر
  useEffect(() => {
    if (filters && placeId) {
      dispatch(applyEventsFilter({ id: placeId, ...filters }));
    }
  }, [filters, dispatch, placeId]);

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      <EventsActionsHeader canCreateEvent={canCreateEvent} />

      <EventsFilterSection
        filters={filters}
        onChangeFilters={setFilters}
        showFilters={showFilters}
        onToggleShowFilters={() => setShowFilters((prev) => !prev)}
        placesList={places}
        schedulesList={schedules}
      />

      <EventsAnalyticsSection />

      <EventsListSection />
    </div>
  );
};

export default PlaceWorkLayout;
