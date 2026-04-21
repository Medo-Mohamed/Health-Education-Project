import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Links as LinksM } from "./M/Routers.tsx";
import ThemeHandler from "./G-Component/ThemeHandler.tsx";
import Landing from "./M/Landing page/Landing.tsx";
import NotFound from "./M/NOT FOUND PAGE/NotFound.tsx";
import Register from "./M/Register/Register.tsx";
import UserKeepLogin from "./G-Component/UserKeepLogin.tsx";
import ProfilePage from "./M/Profile/Profile.tsx";
import ModernProfilePage from "./M/List of links/Profile_view/Profile_Page.tsx";
import ListOfLinks from "./M/List of links/ListOfLinks.tsx";
import { FaCog, FaUserEdit } from "react-icons/fa";
import { GiShadowFollower } from "react-icons/gi";
import TablesGrid from "./M/List of links/Topic Table/Components/TablesGrid.tsx";
import FriendSearsh from "./M/List of links/Components/Friend Searsh/FriendSearsh.tsx";
import TopicApp from "./M/List of links/Topic Table/TopicApp.tsx";
import { HiMiniTableCells } from "react-icons/hi2";
import TopicTableDetails from "./M/List of links/Topic Table/Components/TopicTableDetails.tsx";
export const MENU_DATA = [
  {
    path: "search",
    title: "البحث عن المستخدمين",
    icon: <FaUserEdit size={20} />,
    element: <FriendSearsh comesFrom="searchUsers" key={"searchUsers"} />,
  },
  {
    path: "following",
    title: "أُتابع",
    icon: <GiShadowFollower size={20} />,
    element: <FriendSearsh comesFrom="followingUsers" key={"followingUsers"} />,
  },
  {
    path: "topics",
    title: "جداول",
    icon: <HiMiniTableCells size={20} />,
    element: <TopicApp />,
    children: [
      {
        // path: "alltopics",
        index: true,
        element: <TablesGrid />,
      },
      {
        path: "topictabledetails/:id",
        element: <TopicTableDetails />,
      },
    ],
  },
  {
    path: "settings",
    title: "الإعدادات",
    icon: <FaCog size={20} />,
    element: <div>إعدادات الحساب الشخصي</div>,
  },
];
const Paths = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "listlinks",
        element: <ListOfLinks />,
        children: [...MENU_DATA],
      },
      {
        path: "team",
        element: <div>About Team</div>,
      },
      {
        path: "company",
        element: <div>About Company</div>,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile_view/:userId",
        element: <ModernProfilePage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  ...LinksM,
];
const router = createBrowserRouter([...Paths]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeHandler />
      <UserKeepLogin />
      <div dir="rtl">
        <RouterProvider router={router} />
      </div>
    </Provider>
  </StrictMode>,
);
