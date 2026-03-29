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
