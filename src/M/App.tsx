import { Outlet } from "react-router-dom";
import "./App.css";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Loading from "../G-Component/Loading";
import ResponseStateModal from "../G-Component/ResponseStateModal";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

function App() {
  const isGLoading = useSelector(
    (state: RootState) => state.SuccFaildComponent.state,
  );
  return (
    <div>
      {isGLoading === "loading" && <Loading />}
      <ResponseStateModal />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
