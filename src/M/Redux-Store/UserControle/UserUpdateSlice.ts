import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import AxiosApi from "../../../AxiosApi";

export interface UserForDisplay {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url: string;
  bio?: string;
  phone_numbers: string[];
  role: "dev" | "user";
  location?: {
    city?: string;
    governorate?: string;
  };
  social_links: {
    platform: string;
    url: string;
  }[];
  stats: {
    followers: number;
    following: number;
    posts_count: number;
  };
  last_login: Date;
  created_at: Date;
}
interface UserUpdateState {
  loading: boolean;
  error: any;
  success: boolean;
  User: UserForDisplay | null;
}
const initialState: UserUpdateState = {
  loading: false,
  error: "",
  success: false,
  User: null,
};

export const updateUserProfile = createAsyncThunk(
  "User/updateProfile",
  async (formData: FormData, thunkAPI) => {
    console.log("Updating user profile with data:", formData);
    try {
      // إرسال الطلب للسيرفر
      // ملاحظة: Axios سيتعرف تلقائياً على FormData ويضبط الـ Headers لـ multipart/form-data
      const response = await AxiosApi.patch(
        "/auth/withlogin/profile",
        formData,
      );
      console.log("Update profile response:", response.data);
      return response.data.user; // يعيد بيانات المستخدم المحدثة من السيرفر
    } catch (error: any) {
      if (error.status === 400) {
        console.error("Validation error:", error.response?.data);
        const message = error.response?.data || "بيانات غير صحيحة";
        return thunkAPI.rejectWithValue(message);
      }
      console.error("Error updating user profile:", error.response?.data);
      const message = error.response?.data?.message || "حدث خطأ أثناء التحديث";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getDataForProfile = createAsyncThunk(
  "UserUpdate/getDataForProfile",
  async () => {
    try {
      const response = await AxiosApi.get("/auth/withlogin/profile");
      console.log("User profile response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.log(
        "Error fetching user profile:",
        error instanceof AxiosError ? error.response?.data : error,
      );
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : error instanceof Error
            ? error.message
            : "حدث خطأ ما";
      throw new Error(message || "حدث خطأ ما");
    }
  },
);

export const UserUpdateSlice = createSlice({
  name: "UserUpdate",
  initialState,
  reducers: {
    closeSucssePage: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(getDataForProfile.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = false;
      })
      .addCase(getDataForProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.User = action.payload;
        state.success = false;
      })
      .addCase(getDataForProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "حدث خطأ ما";
        state.success = false;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.User = action.payload; // تحديث بيانات المستخدم في الواجهة
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "حدث خطأ أثناء التحديث";
        state.success = false;
      }),
});

export const { closeSucssePage } = UserUpdateSlice.actions;

export default UserUpdateSlice.reducer;
