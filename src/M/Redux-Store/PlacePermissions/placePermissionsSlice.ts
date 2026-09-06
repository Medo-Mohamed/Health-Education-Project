// placePermissionsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PlacePermissionsState {
  currentPlaceId: string | null;
  userPermissions: string[];
  userRole: string | null;
  isDev: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: PlacePermissionsState = {
  currentPlaceId: null,
  userPermissions: [],
  userRole: null,
  isDev: false,
  loading: false,
  error: null,
};

const placePermissionsSlice = createSlice({
  name: "placePermissions",
  initialState,
  reducers: {
    // 📌 تعيين صلاحيات المكان الحالي بالكامل
    setPlacePermissions: (
      state,
      action: PayloadAction<{
        placeId: string;
        permissions: string[];
        role?: string;
        isDev?: boolean;
      }>,
    ) => {
      state.currentPlaceId = action.payload.placeId;
      state.userPermissions = action.payload.permissions;
      state.userRole = action.payload.role || "";
      state.isDev = action.payload.isDev ?? false;
      state.loading = false;
      state.error = null;
    },

    // 📌 تحديث حالة التحميل
    setPermissionsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 📌 ضبط وجود خطأ
    setPermissionsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // 📌 تفريغ البيانات عند مغادرة المكان
    clearPlacePermissions: (state) => {
      state.currentPlaceId = null;
      state.userPermissions = [];
      state.userRole = null;
      state.isDev = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setPlacePermissions,
  setPermissionsLoading,
  setPermissionsError,
  clearPlacePermissions,
} = placePermissionsSlice.actions;

export default placePermissionsSlice.reducer;
