import { createSlice } from "@reduxjs/toolkit";

export type ThemeState = {
  value: "light" | "dark";
};
// const initialState: ThemeState = {
//   value: "light",
// };

const initialState = {
  value:
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"),
};
export const themeSlice = createSlice({
  name: "theme",
  initialState: initialState,
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
