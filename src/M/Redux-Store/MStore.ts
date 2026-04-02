import ThemeReducer from "./ThemesControle/ThemeSlice";
import UserReducer from "./UserControle/UserDisplatSlice";
import UserUpdateSlice from "./UserControle/UserUpdateSlice";
export const MStore = {
  Theme: ThemeReducer,
  User: UserReducer,
  UserUpdate: UserUpdateSlice,
};
