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
import ModernProfilePage from "./M/List of links/Components/Profile_view/Profile_Page.tsx";
import ListOfLinks from "./M/List of links/ListOfLinks.tsx";
import { FaCog, FaRegNewspaper, FaUserEdit } from "react-icons/fa";
import { GiShadowFollower } from "react-icons/gi";
import TablesGrid from "./M/List of links/Components/Topic Table/Components/TablesGrid.tsx";
import FriendSearsh from "./M/List of links/Components/Friend Searsh/FriendSearsh.tsx";
import TopicApp from "./M/List of links/Components/Topic Table/TopicApp.tsx";
import { HiMiniTableCells } from "react-icons/hi2";
import TopicTableDetails from "./M/List of links/Components/Topic Table/Components/TopicTableDetails.tsx";
import FileIndex from "./M/List of links/Components/File Controle/FileIndex.tsx";
import { ImFilesEmpty } from "react-icons/im";
import DisplayFiles from "./M/List of links/Components/File Controle/Components/DisplayFiles.tsx";
import PostIndex from "./M/List of links/Components/Posts/PostIndex.tsx";
import DisplayPosts from "./M/List of links/Components/Posts/Components/DisplayPosts.tsx";
import PlaceApp from "./M/List of links/Components/Places/PlaceApp.tsx";
import { MdPlace } from "react-icons/md";
import { MyPlacesPage } from "./M/List of links/Components/Places/PlacesPage/MyPlacesPage.tsx";
import { CreatePlacePage } from "./M/List of links/Components/Places/CreatePlacePage/CreatePlacePage.tsx";
import { PlaceLayout } from "./M/List of links/Components/Places/PlaceLayout/PlaceLayout.tsx";
import EditStaffPermissionsPage from "./M/List of links/Components/Places/PlaceLayout/PlaceStaff/EditStaffPermissionsPage.tsx";
import { Toaster } from "react-hot-toast";
import { CreatePlaceEvent } from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Events/CreatePlaceEventPage.tsx";
// import { CreatePlacePlanContainer } from "./M/List of links/Components/Places/Components/WorkPlaceSection/components/CreatePlacePlanContainer.tsx";
// import { PlaceOverview } from "./M/List of links/Components/Places/Components/PlaceOverview.tsx";
// import { PlaceStaffTab } from "./M/List of links/Components/Places/Components/PlaceStaffTap.tsx";
// import { PlaceEventsSection } from "./M/List of links/Components/Places/Components/WorkPlaceSection/PlaceEventsSection.tsx";
import { PlaceOverview } from "./M/List of links/Components/Places/PlaceLayout/PlaceOverview.tsx";
import { PlaceStaffTab } from "./M/List of links/Components/Places/PlaceLayout/PlaceStaff/PlaceStaffTap.tsx";
// import PlaceWork, {
//   PlaceEventsSection,
// } from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/PlaceWork.tsx";
// import { CreatePlacePlanContainer } from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Plans/CreatePlacePlanContainer.tsx";
import PlaceWorkLayout from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Layout/PlaceWorkLayout.tsx";
import PlanManagementLayout from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Plans/PlanManagementLayout.tsx";
import PlaceWork from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/PlaceWork.tsx";
import PlanReviewPage from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Plans/PlaceReview/PlanReviewPage.tsx";
import { PlanApprovalPage } from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Plans/PlaceApprove/PlanApprovalPage.tsx";
import { CreatePlacePlanContainer } from "./M/List of links/Components/Places/PlaceLayout/PlaceWorkSection/Plans/PlaceCreate/CreatePlacePlanContainer.tsx";
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
    path: "files",
    title: "الملفات",
    icon: <ImFilesEmpty size={20} />,
    element: <FileIndex />,
    children: [
      {
        // path: "alltopics",
        index: true,
        element: <DisplayFiles />,
      },
      // {
      //   path: "topictabledetails/:id",
      //   element: <TopicTableDetails />,
      // },
    ],
  },
  {
    path: "posts",
    title: "المنشورات",
    icon: <FaRegNewspaper size={20} />,
    element: <PostIndex />,
    children: [
      {
        // path: "alltopics",
        index: true,
        element: <DisplayPosts />,
      },
    ],
  },
  {
    path: "places",
    title: "الاماكن",
    icon: <MdPlace size={20} />,
    element: <PlaceApp />,
    children: [
      {
        index: true,
        element: <MyPlacesPage />,
      },
      {
        path: "create/:parentId?",
        element: <CreatePlacePage />,
      },
      {
        path: "place-layout/:id",
        element: <PlaceLayout />,
        children: [
          {
            index: true,
            element: <PlaceOverview />,
          },
          {
            path: "staff",
            element: <PlaceStaffTab />,
          },
          {
            path: "staff/:userId/permissions",
            element: <EditStaffPermissionsPage />,
          },
          {
            path: "work-section",
            element: <PlaceWork />,
            children: [
              {
                element: <PlaceWorkLayout />,
                index: true,
              },
              {
                path: "create-event",
                element: <CreatePlaceEvent />,
              },
              {
                path: "plan-manegment",
                element: <PlanManagementLayout />,
                children: [
                  {
                    element: <CreatePlacePlanContainer />,
                    index: true,
                  },
                  {
                    path: "review",
                    element: <PlanReviewPage />,
                  },
                  {
                    path: "approval",
                    element: <PlanApprovalPage />,
                  },
                ],
              },
            ],
          },
        ],
      },

      // {
      //   path: "plans/create/:placeId",
      //   element: <CreatePlacePlanContainer />,
      // },
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
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 4000 }}
      />
      <ThemeHandler />
      <UserKeepLogin />
      <div dir="rtl">
        <RouterProvider router={router} />
      </div>
    </Provider>
  </StrictMode>,
);
