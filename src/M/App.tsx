import { Outlet } from "react-router-dom";
import "./App.css";
import Check from "./Components/Check";
import Header from "./Header/Header";

function App() {
  return (
    <div>
      <Header />
      <Check />
      <Outlet />
    </div>
  );
}

export default App;
