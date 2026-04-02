import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AxiosApi from "../../../AxiosApi";
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

interface UserState {
  load: boolean;
  data: {
    user: {
      username: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string;
      bio: string;
    } | null;
  };
  error: string | null;
  status: "idle" | "unAuthenticated";
  showLoginModal: boolean;
}

const initialState: UserState = {
  status: "idle",
  load: false,
  data: { user: null },
  error: null,
  showLoginModal: false,
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
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.load = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.load = false;
        state.error = null;
        state.status = "idle";
        state.showLoginModal = false;
        state.data.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.load = false;
        state.status = "unAuthenticated";
        state.error = action.payload as string;
      })
      .addCase(RefreshUser.fulfilled, (state, action) => {
        state.load = false;
        state.error = null;
        state.status = "idle";
        state.showLoginModal = false;
        state.data.user = action.payload;
      })
      .addCase(RefreshUser.pending, (state) => {
        state.load = true;
      })
      .addCase(RefreshUser.rejected, (state) => {
        state.load = false;
        state.status = "unAuthenticated";
      })
      .addCase(logOutUser.fulfilled, (state) => {
        state.load = false;
        state.error = null;
        state.status = "unAuthenticated";
        state.data.user = null;
      })
      .addCase(logOutUser.pending, (state) => {
        state.load = true;
      })
      .addCase(logOutUser.rejected, (state, action) => {
        state.load = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, openLoginModal, closeLoginModal } = UserSlice.actions;

export default UserSlice.reducer;
