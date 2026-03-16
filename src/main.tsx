import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Links as LinksM } from "./M/Routers.tsx";
import ThemeHandler from "./G-Component/ThemeHandler.tsx";

const Paths = [
  {
    path: "/",
    element: <App />,
  },
  ...LinksM,
];
const router = createBrowserRouter([...Paths]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeHandler />
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
