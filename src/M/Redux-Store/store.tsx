import { configureStore } from "@reduxjs/toolkit";
import ThemeReducer from "./ThemesControle/ThemeSlice";

const store = configureStore({
  reducer: {
    Theme: ThemeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
