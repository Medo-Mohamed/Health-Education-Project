import { createSlice } from "@reduxjs/toolkit";

export type ThemeState = {
    value: "light" | "dark";
};
const initialState: ThemeState = {
    value: "light",
}
export const themeSlice = createSlice({
    name: "theme",
    initialState: initialState,
    reducers: {
        changeTheme: (state) => {
            state.value = state.value === "light" ? "dark" : "light";
        },
    },
});

export const { changeTheme } = themeSlice.actions;
export default themeSlice.reducer;