// import "./App.css";

import { useSelector } from "react-redux";
import Login from "../H/Login/Login";
import type { RootState } from "../store";

function App() {
  const userStatus = useSelector((state: RootState) => state.User.status);
  return <div>{userStatus === "unAuthenticated" && <Login />}</div>;
}

export default App;
