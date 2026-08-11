import { useEffect } from "react";
import { changeTheme } from "../M/Redux-Store/ThemesControle/ThemeSlice";
import { type RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";

function ThemeHandler() {
  const Theme = useSelector((state: RootState) => state.Theme.value);
  const dispatch = useDispatch();
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    console.log(savedTheme);
    if (savedTheme && savedTheme !== Theme) dispatch(changeTheme());
  }, []);
  useEffect(() => {
    const body = document.body;
    if (Theme === "dark") {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
    localStorage.setItem("theme", Theme);
  }, [Theme]);
  return <></>;
}

export default ThemeHandler;
