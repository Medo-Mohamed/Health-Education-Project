import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  PlaceOption,
  ScheduleOption,
} from "../../List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Filter/EventsFilterSection";
import AxiosApi from "../../../AxiosApi";

// --- Types & Interfaces ---

export interface InstructorOption {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

export interface CanCreateEventResponse {
  success: boolean;
  canCreate: boolean;
  canCreateForOthers: boolean;
  instructors: InstructorOption[];
  tables: ServerTable[];
  user: any;
  place: {
    name: string;
    type: string;
    photo_url: string;
  };
}

interface ServerPlace {
  _id: string;
  name: string;
}

interface ServerTableRow {
  _id: string;
  mainTopic: string;
  supTopic: string;
}

interface ServerTable {
  _id: string;
  title: string;
  table_rows: ServerTableRow[];
}

export interface FilterPayload {
  id: string;
  selectedPlaces?: string[];
  selectedEventTypes?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  topicsFilter?: {
    isAllTopics?: boolean;
    customTopics?: Array<{
      scheduleId: string;
      mainTopic?: string;
      subTopic?: string;
    }>;
  };
}

// الواجهة الخاصة بحمولة تعديل/إضافة/حذف الخطة المعتمدة
export interface UpdateApprovedPlanPayload {
  placeId: string;
  planId: string;
  action?: "CREATE" | "UPDATE" | "DELETE";
  count?: number;
  schedule_name?: string;
  main_topic?: string;
  sub_topic?: string;
  planned_date?: string;
  location_type?: string;
  external_location_name?: string;
  media_outlets_count?: number;
  digital_media_activities_count?: number;
  target_attendees?: {
    males?: number;
    females?: number;
    children?: number;
  };
  created_by?: string;
}

// الواجهة الخاصة بحمولة تعديل الندوة (Event)
export interface UpdateEventPayload {
  placeId: string;
  eventId: string;
  count?: number;
  seminars_count?: number;
  schedule_name?: string;
  main_topic?: string;
  sub_topic?: string;
  event_date?: string;
  date?: string;
  location_type?: string;
  external_location_name?: string;
  instructor_info?: string;
  media_outlets_count?: number;
  digital_media_activities_count?: number;
  attendees?: {
    males?: number;
    females?: number;
    children?: number;
  };
}

// الواجهة الخاصة بحمولة حذف الندوة (Event)
export interface DeleteEventPayload {
  placeId: string;
  eventId: string;
}

interface FilterDataState {
  places: PlaceOption[];
  schedules: ScheduleOption[];
  events: any[];
  plans: any[];
  instructors: InstructorOption[];
  canCreateEvent: boolean;
  canCreateForOthers: boolean;
  loading: boolean;
  filterLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  filterError: string | null;
  actionError: string | null;
}

const initialState: FilterDataState = {
  places: [],
  schedules: [],
  events: [],
  plans: [],
  instructors: [],
  canCreateEvent: false,
  canCreateForOthers: false,
  loading: false,
  filterLoading: false,
  actionLoading: false,
  error: null,
  filterError: null,
  actionError: null,
};

// --- Helper Functions ---

const transformTablesToSchedules = (
  tables: ServerTable[],
): ScheduleOption[] => {
  return tables.map((table) => {
    const mainTopicsMap = new Map<string, Set<string>>();

    table.table_rows.forEach((row) => {
      if (!mainTopicsMap.has(row.mainTopic)) {
        mainTopicsMap.set(row.mainTopic, new Set());
      }
      if (row.supTopic) {
        mainTopicsMap.get(row.mainTopic)!.add(row.supTopic);
      }
    });

    const mainTopics = Array.from(mainTopicsMap.entries()).map(
      ([name, subTopicsSet]) => ({
        name,
        subTopics: Array.from(subTopicsSet),
      }),
    );

    return {
      id: table._id,
      title: table.title,
      mainTopics,
    };
  });
};

// --- Async Thunks ---

// 1. جلب خيارات الفلترة المبدئية
export const fetchFilterData = createAsyncThunk(
  "eventsFilter/fetchFilterData",
  async (placeId: string, { rejectWithValue }) => {
    try {
      const response = await AxiosApi.get(
        `/auth/withlogin/places/place-filter/places-and-schedules/${placeId}`,
      );
      const data = response.data;

      const places: PlaceOption[] = (data.places || []).map(
        (p: ServerPlace) => ({
          id: p._id,
          name: p.name,
          isMain: p._id === placeId,
        }),
      );

      const schedules = transformTablesToSchedules(data.tables || []);

      return { places, schedules };
    } catch (err: any) {
      console.error("Error in fetchFilterData:", err);
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء جلب البيانات",
      );
    }
  },
);

// 2. تطبيق الفلترة
export const applyEventsFilter = createAsyncThunk(
  "eventsFilter/applyEventsFilter",
  async (filterPayload: FilterPayload, { rejectWithValue }) => {
    try {
      const { id, ...payload } = filterPayload;

      const response = await AxiosApi.post(
        `/auth/withlogin/places/place-filter/places-and-schedules-filtered/${id}`,
        payload,
      );
      return response.data;
    } catch (err: any) {
      console.error("Error in applyEventsFilter:", err);
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء تصفية الفعاليات والخطط",
      );
    }
  },
);

// 3. تعديل / حذف / إضافة خطة معتمدة (Approved Plan)
export const updateApprovedPlan = createAsyncThunk(
  "eventsFilter/updateApprovedPlan",
  async (payloadData: UpdateApprovedPlanPayload, { rejectWithValue }) => {
    try {
      const { placeId, planId, ...body } = payloadData;

      const response = await AxiosApi.put(
        `/auth/withlogin/places/place-plans/update-approved-plan/${placeId}/${planId}`,
        body,
      );

      return {
        originalPlanId: planId,
        ...response.data,
      };
    } catch (err: any) {
      console.error("Error in updateApprovedPlan:", err);
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء تحديث الخطة المعتمدة",
      );
    }
  },
);

// 4. تعديل ندوة (Event)
export const updateEvent = createAsyncThunk(
  "eventsFilter/updateEvent",
  async (payloadData: UpdateEventPayload, { rejectWithValue }) => {
    try {
      const { placeId, eventId, ...body } = payloadData;

      const response = await AxiosApi.put(
        `/auth/withlogin/places/place-events/update-event/${placeId}/${eventId}`,
        body,
      );

      return {
        originalEventId: eventId,
        ...response.data, // إرجاع { success: true, action: "MERGED" | "UPDATED", data: ... }
      };
    } catch (err: any) {
      console.error("Error in updateEvent:", err);
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء تحديث بيانات الندوة",
      );
    }
  },
);

// 5. حذف ندوة (Event)
export const deleteEvent = createAsyncThunk(
  "eventsFilter/deleteEvent",
  async ({ placeId, eventId }: DeleteEventPayload, { rejectWithValue }) => {
    try {
      const response = await AxiosApi.delete(
        `/auth/withlogin/places/place-events/delete-event/${placeId}/${eventId}`,
      );

      return {
        deletedEventId: eventId,
        ...response.data,
      };
    } catch (err: any) {
      console.error("خطأ أثناء حذف الندوة:", err);
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء حذف الندوة",
      );
    }
  },
);

// 6. التحقق من صلاحيات إنشاء ندوات
export const fetchCanCreatePlaceEvent = createAsyncThunk(
  "eventsFilter/fetchCanCreatePlaceEvent",
  async (placeId: string, { rejectWithValue }) => {
    try {
      const response = await AxiosApi.get(
        `/auth/withlogin/places/place-events/check-can-create/${placeId}`,
      );

      const data: CanCreateEventResponse = response.data;

      return {
        canCreate: data.canCreate,
        canCreateForOthers: data.canCreateForOthers,
        instructors: data.instructors || [],
      };
    } catch (err: any) {
      console.error("Error in fetchCanCreatePlaceEvent:", err);
      return rejectWithValue(
        err.response?.data?.message ||
          "حدث خطأ أثناء التحقق من صلاحيات إنشاء الندوات",
      );
    }
  },
);

// --- Slice ---

const eventsFilterSlice = createSlice({
  name: "eventsFilter",
  initialState,
  reducers: {
    clearFilteredResults: (state) => {
      state.events = [];
      state.plans = [];
      state.filterError = null;
    },
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Filter Options Handlers
      .addCase(fetchFilterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFilterData.fulfilled,
        (
          state,
          action: PayloadAction<{
            places: PlaceOption[];
            schedules: ScheduleOption[];
          }>,
        ) => {
          state.loading = false;
          state.places = action.payload.places;
          state.schedules = action.payload.schedules;
        },
      )
      .addCase(fetchFilterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Apply Filter Handlers
      .addCase(applyEventsFilter.pending, (state) => {
        state.filterLoading = true;
        state.filterError = null;
      })
      .addCase(
        applyEventsFilter.fulfilled,
        (
          state,
          action: PayloadAction<{
            events: any[];
            plans: any[];
          }>,
        ) => {
          state.filterLoading = false;
          state.events = action.payload.events || [];
          state.plans = action.payload.plans || [];
        },
      )
      .addCase(applyEventsFilter.rejected, (state, action) => {
        state.filterLoading = false;
        state.filterError = action.payload as string;
      })

      // Update Approved Plan Handlers
      .addCase(updateApprovedPlan.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateApprovedPlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { action: resAction, originalPlanId, data } = action.payload;

        if (resAction === "DELETED") {
          state.plans = state.plans.filter(
            (p) => (p.id || p._id) !== originalPlanId,
          );
        } else if (resAction === "MERGED") {
          state.plans = state.plans
            .filter((p) => (p.id || p._id) !== originalPlanId)
            .map((p) => ((p.id || p._id) === (data.id || data._id) ? data : p));
        } else if (resAction === "UPDATED") {
          state.plans = state.plans.map((p) =>
            (p.id || p._id) === (data.id || data._id) ? data : p,
          );
        } else if (resAction === "CREATED") {
          state.plans.push(data);
        }
      })
      .addCase(updateApprovedPlan.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })

      // Update Event Handlers
      .addCase(updateEvent.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { action: resAction, originalEventId, data } = action.payload;

        if (resAction === "MERGED") {
          state.events = state.events
            .filter((e) => (e.id || e._id) !== originalEventId)
            .map((e) => ((e.id || e._id) === (data.id || data._id) ? data : e));
        } else if (resAction === "UPDATED") {
          state.events = state.events.map((e) =>
            (e.id || e._id) === (data.id || data._id) ? data : e,
          );
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })

      // Delete Event Handlers
      .addCase(deleteEvent.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        const targetId =
          action.payload.deletedEventId || action.payload.data?.id;
        state.events = state.events.filter((e) => (e.id || e._id) !== targetId);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })

      // Fetch Can Create Place Event Handlers
      .addCase(fetchCanCreatePlaceEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCanCreatePlaceEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.canCreateEvent = action.payload.canCreate;
        state.canCreateForOthers = action.payload.canCreateForOthers;
        state.instructors = action.payload.instructors;
      })
      .addCase(fetchCanCreatePlaceEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFilteredResults, clearActionError } =
  eventsFilterSlice.actions;
export default eventsFilterSlice.reducer;
