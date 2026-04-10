import { createSlice } from "@reduxjs/toolkit";

interface IS {
  state: "success" | "faild" | "none";
  showComponent: boolean;
  title: string;
  descreption: string;
}
const initialState: IS = {
  state: "none",
  showComponent: false,
  title: "",
  descreption: "",
};
export const SFS_Slice = createSlice({
  name: "SFS",
  initialState,
  reducers: {
    open: (state, action) => {
      state.showComponent = true;
      // required
      state.state = action.payload.state;
      state.title = action.payload.title || "";
      state.descreption = action.payload.descreption || "";
    },
    close: () => {
      return initialState;
    },
  },
});

export const { open, close } = SFS_Slice.actions;

export default SFS_Slice.reducer;
