import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AxiosApi from "../../../AxiosApi";
import { AxiosError } from "axios";
// _id: Types.ObjectId;
//   username: string;
//   first_name: string;
//   last_name: string;
//   email?: string;
//   avatar_url: string;
//   bio?: string;
//   phone_numbers: string[];
//   role: "dev" | "user";
export const logOutUser = createAsyncThunk("User/logOutUser", async () => {
  try {
    const response = await AxiosApi.post("/auth/withlogin/logout");
    console.log("Logout response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("Error logging out:", err.response?.data || err);
    return Promise.reject(err.response?.data?.message || "حدث خطأ ما");
  }
});

export const fetchUser = createAsyncThunk(
  "User/fetchUser",
  async (
    credentials: {
      username: string;
      password: string;
      rememberMe: boolean;
    },
    thunkAPI,
  ) => {
    // console.log("Fetching user with credentials:", credentials);
    try {
      const response = await AxiosApi.post(
        `/auth/withoutlogin/login`,
        credentials,
        { withCredentials: true },
      );
      // console.log("Fetch user response:", response.data.user);
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || "حدث خطأ ما";
      console.error("Error fetching user:", error.response?.data || error);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const RefreshUser = createAsyncThunk("User/RefreshUser", async () => {
  try {
    const response = await AxiosApi.get("/auth/withlogin/refreshauth");
    // console.log("Refresh user response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("Error refreshing user:", err.response?.data || err);
    return Promise.reject(err.response?.data?.message || "حدث خطأ ما");
  }
});

export const getDataForProfile = createAsyncThunk(
  "User/getDataForProfile",
  async () => {
    try {
      const response = await AxiosApi.get("/auth/withlogin/profile");
      // console.log("User profile response:", response.data);
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

export const checkIfCanGetLostPasswordBack = createAsyncThunk(
  "User/lostpassword",
  async (username: string, thunkApi) => {
    try {
      const response = await AxiosApi.post(
        "/auth/withoutlogin/forgetpassword",
        { username },
      );
      console.log("Response :", response.data.message);
      return response.data.message;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "حدث خطأ ما";

      // console.log("Detailed Error:", message);

      // 2. استخدام rejectWithValue لضمان وصول الرسالة للـ ExtraReducers
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const confirmOTP = createAsyncThunk(
  "User/confirmotp",
  async (
    { otpCode, username }: { otpCode: string; username: string },
    thunkApi,
  ) => {
    try {
      const response = await AxiosApi.post("/auth/withoutlogin/confirmotp", {
        otpCode,
        username,
      });
      console.log("Response :", response.data.message);
      return response.data.message;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "حدث خطأ ما";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const confirmChangePassword = createAsyncThunk(
  "User/confirmChangePassword",
  async ({ newPassword }: { newPassword: string }, thunkApi) => {
    try {
      const response = await AxiosApi.post(
        "/auth/withoutlogin/allowchangepassword",
        {
          newPassword,
        },
      );
      console.log("Response :", response.data.message);
      return response.data.message;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "حدث خطأ ما";
      return thunkApi.rejectWithValue(message);
    }
  },
);
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
interface UserState {
  loading: boolean;
  success: boolean;
  data: {
    user: UserForDisplay | null;
  };
  error: any;
  status: "idle" | "unAuthenticated";
  showLoginModal: boolean;
  logIn_or_lostPassword: {
    state: "login" | "lostPassword";
    stage?: 0 | 1 | 2 | 3;
  };
  message: string;
}

const initialState: UserState = {
  status: "unAuthenticated",
  loading: false,
  data: { user: null },
  error: null,
  showLoginModal: false,
  success: false,
  logIn_or_lostPassword: { state: "login" },
  message: "",
};

export const UserSlice = createSlice({
  name: "User",
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      state.data.user = action.payload;
    },
    openLoginModal: (state) => {
      state.showLoginModal = true;
    },
    closeLoginModal: (state) => {
      state.showLoginModal = false;
    },
    closeSucssePage: (state) => {
      state.success = false;
    },
    swith_LoginOrGLP: (state) => {
      // Reset state to initial values
      state.status = "unAuthenticated";
      state.loading = false;
      state.data.user = null;
      state.error = null;
      state.showLoginModal = true;
      state.success = false;
      state.message = "";
      // Switch the logIn_or_lostPassword state
      if (state.logIn_or_lostPassword.state === "login") {
        state.logIn_or_lostPassword.state = "lostPassword";
        state.logIn_or_lostPassword.stage = 0;
      } else {
        state.logIn_or_lostPassword.state = "login";
        state.logIn_or_lostPassword.stage = undefined;
      }
    },
    clearState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.status = "idle";
        state.showLoginModal = false;
        state.data.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.status = "unAuthenticated";
        state.error = action.payload as string;
      })
      .addCase(RefreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.status = "idle";
        state.showLoginModal = false;
        state.data.user = action.payload;
      })
      .addCase(RefreshUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(RefreshUser.rejected, (state) => {
        state.loading = false;
        state.status = "unAuthenticated";
      })
      .addCase(logOutUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.status = "unAuthenticated";
        state.data.user = null;
      })
      .addCase(logOutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logOutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getDataForProfile.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = false;
      })
      .addCase(getDataForProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data.user = action.payload;
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
        state.data.user = action.payload; // تحديث بيانات المستخدم في الواجهة
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "حدث خطأ أثناء التحديث";
        state.success = false;
      })
      .addCase(checkIfCanGetLostPasswordBack.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkIfCanGetLostPasswordBack.rejected, (state, action) => {
        state.loading = false;
        state.message = "";
        state.error = action.payload;
      })
      .addCase(checkIfCanGetLostPasswordBack.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.message = action.payload;
        state.logIn_or_lostPassword.stage = 1;
      })
      .addCase(confirmOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmOTP.rejected, (state, action) => {
        state.loading = false;
        state.message = "";
        state.error = action.payload;
      })
      .addCase(confirmOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        state.error = "";
        state.logIn_or_lostPassword.stage = 2;
      })
      .addCase(confirmChangePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmChangePassword.rejected, (state, action) => {
        state.loading = false;
        state.message = "";
        state.error = action.payload;
      })
      .addCase(confirmChangePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        state.error = "";
        state.logIn_or_lostPassword.stage = 3;
      });
  },
});

export const {
  setUser,
  openLoginModal,
  closeLoginModal,
  closeSucssePage,
  swith_LoginOrGLP,
  clearState,
} = UserSlice.actions;

export default UserSlice.reducer;
