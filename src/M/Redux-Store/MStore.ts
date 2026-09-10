import SFS from "./SuccessFaildState/SFS";
import ThemeReducer from "./ThemesControle/ThemeSlice";
import UserReducer from "./UserControle/UserDisplatSlice";
import UserSearch from "./UserSearch/UserSearch";
import TopicTabel from "./TopicTablesControle/TopicTables";
import placePermissionsReducer from "./PlacePermissions/placePermissionsSlice";
import eventsFilter from "./EventsFilter/eventsFilterSlice.ts";
export const MStore = {
  Theme: ThemeReducer,
  User: UserReducer,
  SuccFaildComponent: SFS,
  UserSearch,
  TopicTabel,
  placePermissions: placePermissionsReducer,
  eventsFilter,
};
