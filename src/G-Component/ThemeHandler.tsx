import { useEffect } from "react";
import { type RootState } from "../store";
import { useSelector } from "react-redux";

function ThemeHandler() {
  const Theme = useSelector((state: RootState) => state.Theme.value);

  // 2. تطبيق الثيم على الـ DOM وحفظ التغييرات المستقبليّة
  useEffect(() => {
    const root = document.documentElement; // الاستهداف الأفضل لـ Tailwind CSS
    if (Theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", Theme);
  }, [Theme]);

  return null;
}

export default ThemeHandler;
