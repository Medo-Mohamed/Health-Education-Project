import ProfilePage from "./M/Profile/Profile.tsx";
import ModernProfilePage from "./M/List of links/Pages/Profile_view/Profile_Page.tsx";
import ListOfLinks from "./M/List of links/ListOfLinks.tsx";
import ProtectedRoute from "./G-Component/ProtectedRoute.tsx";
import { FaRegNewspaper, FaUserEdit } from "react-icons/fa";
import { GiShadowFollower } from "react-icons/gi";
import TablesGrid from "./M/List of links/Pages/Topic Table/Components/TablesGrid.tsx";
import FriendSearsh from "./M/List of links/Pages/Friend Searsh/FriendSearsh.tsx";
import TopicApp from "./M/List of links/Pages/Topic Table/TopicApp.tsx";
import { HiMiniTableCells } from "react-icons/hi2";
import TopicTableDetails from "./M/List of links/Pages/Topic Table/Components/TopicTableDetails.tsx";
import FileIndex from "./M/List of links/Pages/File Controle/FileIndex.tsx";
import { ImFilesEmpty } from "react-icons/im";
import DisplayFiles from "./M/List of links/Pages/File Controle/Components/DisplayFiles.tsx";
import PostIndex from "./M/List of links/Pages/Posts/PostIndex.tsx";
import DisplayPosts from "./M/List of links/Pages/Posts/Components/DisplayPosts.tsx";
import PlaceApp from "./M/List of links/Pages/Places/PlaceApp.tsx";
import { MdPlace } from "react-icons/md";
import { MyPlacesPage } from "./M/List of links/Pages/Places/PlacesPage/MyPlacesPage.tsx";
import { CreatePlacePage } from "./M/List of links/Pages/Places/CreatePlacePage/CreatePlacePage.tsx";
import { PlaceLayout } from "./M/List of links/Pages/Places/PlaceLayout/PlaceLayout.tsx";
import EditStaffPermissionsPage from "./M/List of links/Pages/Places/PlaceLayout/PlaceStaff/EditStaffPermissionsPage.tsx";
import { CreatePlaceEvent } from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Events/CreatePlaceEventPage.tsx";

import { PlaceOverview } from "./M/List of links/Pages/Places/PlaceLayout/PlaceOverview.tsx";
import { PlaceStaffTab } from "./M/List of links/Pages/Places/PlaceLayout/PlaceStaff/PlaceStaffTap.tsx";

import PlaceWorkLayout from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Layout/PlaceWorkLayout.tsx";
import PlanManagementLayout from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Plans/PlanManagementLayout.tsx";
import PlaceWork from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/PlaceWork.tsx";
import PlanReviewPage from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Plans/PlaceReview/PlanReviewPage.tsx";
import { PlanApprovalPage } from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Plans/PlaceApprove/PlanApprovalPage.tsx";
import { CreatePlacePlanContainer } from "./M/List of links/Pages/Places/PlaceLayout/PlaceWorkSection/Plans/PlaceCreate/CreatePlacePlanContainer.tsx";
import { EditPlacePage } from "./M/List of links/Pages/Places/EditPlacePage/EditPlacePage.tsx";
import Landing from "./M/Landing page/Landing.tsx";
import NotFound from "./M/NOT FOUND PAGE/NotFound.tsx";
import Register from "./M/Register/Register.tsx";
import App from "./App.tsx";
import CheckForStart from "./G-Component/CheckForStart.tsx";
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
        index: true,
        element: <DisplayFiles />,
      },
    ],
  },
  {
    path: "posts",
    title: "المنشورات",
    icon: <FaRegNewspaper size={20} />,
    element: <PostIndex />,
    children: [
      {
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
        path: "edit/:placeId",
        element: <EditPlacePage />,
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
    ],
  },
];
export const Paths = [
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
        element: (
          <CheckForStart>
            <ListOfLinks />
          </CheckForStart>
        ),
        children: [...MENU_DATA],
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "profile/:id",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
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
];
