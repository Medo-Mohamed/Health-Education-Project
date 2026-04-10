// import "./App.css";

import { useSelector } from "react-redux";
import Login from "../H/Login/Login";
import type { RootState } from "../store";

function App() {
  const UserStates = useSelector((state: RootState) => state.User);
  return <div>{UserStates.status === "unAuthenticated" && <Login />}</div>;
}

export default App;
