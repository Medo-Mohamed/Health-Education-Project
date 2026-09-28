import { configureStore } from "@reduxjs/toolkit";
// import ThemeReducer from "./ThemesControle/ThemeSlice";
import { MStore } from "./M/Redux-Store/MStore";
// import { HStore } from "./H/Redux-Store/HStore";

const store = configureStore({
  reducer: {
    ...MStore,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
