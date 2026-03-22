import { Outlet } from "react-router-dom";
import "./App.css";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";

function App() {
  return (
    <div>
      <Header />
      {/* <Check /> */}
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
