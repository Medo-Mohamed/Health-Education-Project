import { configureStore } from "@reduxjs/toolkit";
// import ThemeReducer from "./ThemesControle/ThemeSlice";
import { MStore } from "./M/Redux-Store/MStore";

const store = configureStore({
  reducer: {
    ...MStore,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
