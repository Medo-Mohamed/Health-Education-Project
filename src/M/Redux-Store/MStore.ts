import SFS from "./SuccessFaildState/SFS";
import ThemeReducer from "./ThemesControle/ThemeSlice";
import UserReducer from "./UserControle/UserDisplatSlice";
import UserSearch from "./UserSearch/UserSearch";
import TopicTabel from "./TopicTablesControle/TopicTables";
export const MStore = {
  Theme: ThemeReducer,
  User: UserReducer,
  SuccFaildComponent: SFS,
  UserSearch,
  TopicTabel,
};
