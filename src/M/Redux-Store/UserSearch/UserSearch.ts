import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AxiosApi from "../../../AxiosApi";

export const searchUserByUsername = createAsyncThunk(
  "/searchusers",
  async (payload: { searchTerm: string; page?: number }) => {
    try {
      const response = await AxiosApi.get("/auth/withlogin/search/getusers", {
        params: {
          searchTerm: payload.searchTerm,
          page: payload.page || 1,
        },
      });
      // console.log("searchusers response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(error.response?.data?.message || "حدث خطأ ما");
      return Promise.reject(error.response?.data?.message || "حدث خطأ ما");
    }
  },
);

export const getFollowingUsers = createAsyncThunk(
  "/getFollowingUsers",
  async (payload: { searchTerm: string; page?: number }) => {
    try {
      const response = await AxiosApi.get("/auth/withlogin/getfollowinglist", {
        params: {
          searchTerm: payload.searchTerm,
          page: payload.page || 1,
        },
      });
      // console.log("followes response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(error.response?.data?.message || "حدث خطأ ما");
      return Promise.reject(error.response?.data?.message || "حدث خطأ ما");
    }
  },
);

export type UserSearchInfo = {
  success: boolean;
  data: {
    _id: string;
    first_name: string;
    last_name: string;
    username: string;
    avatar_url: string;
  }[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
};

export type UserSearch = {
  state: "loading" | "success" | "faild";
  info: UserSearchInfo;
  error: string;
};
const initialState: UserSearch = {
  state: "success",
  info: {
    success: false,
    data: [],
    currentPage: 0,
    totalPages: 0,
    totalResults: 0,
  },
  error: "",
};
export const UserSearchSlice = createSlice({
  name: "UserSearch",
  initialState: initialState,
  reducers: {
    clearState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(searchUserByUsername.pending, (state) => {
        state.state = "loading";
      })
      .addCase(searchUserByUsername.rejected, (state, action) => {
        state.state = "faild";
        state.error = action.error.message as string;
        state.info = {
          success: false,
          data: [],
          currentPage: 0,
          totalPages: 0,
          totalResults: 0,
        };
      })
      .addCase(searchUserByUsername.fulfilled, (state, action) => {
        state.state = "success";
        state.info = action.payload as UserSearchInfo;
        state.error = "";
      })
      .addCase(getFollowingUsers.pending, (state) => {
        state.state = "loading";
      })
      .addCase(getFollowingUsers.rejected, (state, action) => {
        state.state = "faild";
        state.error = action.error.message as string;
        state.info = {
          success: false,
          data: [],
          currentPage: 0,
          totalPages: 0,
          totalResults: 0,
        };
      })
      .addCase(getFollowingUsers.fulfilled, (state, action) => {
        state.state = "success";
        state.info = action.payload as UserSearchInfo;
        state.error = "";
      }),
});

export const { clearState } = UserSearchSlice.actions;
export default UserSearchSlice.reducer;
