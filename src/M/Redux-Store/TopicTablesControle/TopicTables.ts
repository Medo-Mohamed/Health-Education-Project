import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AxiosApi from "../../../AxiosApi";

export const getAllTablesSummary = createAsyncThunk(
  "/getAllTablesSummary",
  async () => {
    try {
      const response = await AxiosApi.get(
        "/auth/withlogin/topictabels/display",
      );
      // console.log("response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(error.response?.data?.message || "حدث خطأ ما");
      return Promise.reject(error.response?.data?.message || "حدث خطأ ما");
    }
  },
);

export const createTopicTable = createAsyncThunk(
  "/createTopicTable",
  async ({ title, description }: { title: string; description: string }) => {
    // console.log(title, description);
    try {
      const response = await AxiosApi.post(
        "/auth/withlogin/topictabels/create",
        {
          title,
          description,
        },
      );
      // console.log("response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(error.response?.data?.message || "حدث خطأ ما");
      return Promise.reject(error.response?.data?.message || "حدث خطأ ما");
    }
  },
);


export type TabelsInfo = {
  success: boolean;
  data: {
    _id: string;
    title: string;
    description: string;
  }[];
};

export type TopicTables = {
  state: "loading" | "success" | "faild";
  level: "getAll";
  info: TabelsInfo;
  error: string;
};
const initialState: TopicTables = {
  state: "success",
  level: "getAll",
  info: {
    success: false,
    data: [],
  },
  error: "",
};
export const TopicTablesSlice = createSlice({
  name: "TopicTables",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getAllTablesSummary.pending, (state) => {
        state.state = "loading";
      })
      .addCase(getAllTablesSummary.rejected, (state, action) => {
        state.state = "faild";
        state.error = action.error.message as string;
        state.info = {
          success: false,
          data: [],
        };
      })
      .addCase(getAllTablesSummary.fulfilled, (state, action) => {
        state.state = "success";
        state.info = action.payload;
        state.error = "";
      })
      .addCase(createTopicTable.pending, (state) => {
        state.state = "loading";
      })
      .addCase(createTopicTable.rejected, (state, action) => {
        state.state = "faild";
        state.error = action.error.message as string;
      })
      .addCase(createTopicTable.fulfilled, (state, action) => {
        state.state = "success";
        state.info = action.payload;
        state.error = "";
      }),

});

// export const { clearState } = UserSearchSlice.actions;
export default TopicTablesSlice.reducer;
