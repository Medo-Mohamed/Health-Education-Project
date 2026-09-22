import { createSlice } from "@reduxjs/toolkit";

export type ThemeState = {
  value: "light" | "dark";
};
// const initialState: ThemeState = {
//   value: "light",
// };

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    return { value: localStorage.getItem("theme") || "light" };
  }
  return { value: "light" };
};
export const themeSlice = createSlice({
  name: "theme",
  initialState: getInitialTheme(),
  reducers: {
    changeTheme: (state) => {
      state.value = state.value === "light" ? "dark" : "light";
    },
    setTheme: (state, action) => {
      console.log("setTheme", action.payload);
      state.value = action.payload;
    },
  },
});

export const { changeTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
