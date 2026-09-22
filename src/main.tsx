import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Provider } from "react-redux";
import store from "./store.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ThemeHandler from "./G-Component/ThemeHandler.tsx";

import UserKeepLogin from "./G-Component/UserKeepLogin.tsx";
import { Paths } from "./Route.tsx";

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
