import { Outlet } from "react-router-dom";
import "./App.css";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Loading from "../G-Component/Loading";
import ResponseStateModal from "../G-Component/ResponseStateModal";

function App() {
  return (
    <div>
      <Loading />
      <ResponseStateModal />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
