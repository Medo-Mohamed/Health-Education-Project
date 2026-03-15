import { Provider, useDispatch, useSelector } from "react-redux";
import store, { type RootState } from "./Redux-Store/store";
import Routers from "./Routers";
import "./App.css";
import Check from "./Components/Check";
import { useEffect } from "react";
import { changeTheme } from "./Redux-Store/ThemesControle/ThemeSlice";

function App() {
  const Theme = useSelector((state: RootState) => state.Theme.value);
  const dispatch = useDispatch();
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme");
    console.log(savedTheme);
    if (savedTheme && savedTheme !== Theme) dispatch(changeTheme());
  }, []);
  useEffect(() => {
    const body = document.body;
    if (Theme === "dark") {
      body.classList.add("dark-theme");
    } else {
      body.classList.remove("dark-theme");
    }
    localStorage.setItem("app-theme", Theme);
  }, [Theme]);
  return (
    <Provider store={store}>
      <Routers>
        <div>
          App
          <Check />
        </div>
      </Routers>
    </Provider>
  );
}

export default App;
