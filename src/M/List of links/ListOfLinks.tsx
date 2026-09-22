import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MENU_DATA } from "../../Route";
import "./ListOfLinks.css";
export default function ListOfLinks() {
  const location = useLocation();

  // للعثور على العنوان الحالي لعرضه في الهيدر (اختياري)
  const currentTitle = MENU_DATA.find((item) =>
    location.pathname.includes(item.path),
  )?.title;

  return (
    <div className="container min-h-screen pt-20 flex flex-col p-4" dir="rtl">
      <div className="flex flex-1 gap-1 md:gap-2 lg:gap-4">
        {/* الشريط الجانبي */}
        <aside className="boxColors w-fit lg:w-64 shrink-0 flex flex-col space-y-2 p-2 rounded-3xl shadow-sm border">
          {MENU_DATA.map((link) => (
            <NavLink
              key={link.path}
              to={link.path} // الروابط ستكون نسبية تلقائياً
              title={link.title}
              className={({ isActive }) => `
                flex items-center gap-3 p-3 rounded-2xl w-full
                ${isActive ? "bg-indigo-600 text-white" : "hover:bg-indigo-400"}
              `}
            >
              {link.icon}
              <span className="hidden md:block">{link.title}</span>
            </NavLink>
          ))}
        </aside>

        {/* منطقة العرض - Main Content */}
        <main className="boxColors flex-1 min-w-0 rounded-3xl shadow-sm border p-1.5 md:p-3 lg:p-6 space-y-2">
          <div className="font-bold text-2xl">
            {currentTitle || "لوحة التحكم"}
            <div className="sepretor h-2 my-2 rounded-full "></div>
          </div>

          {/* التعديل الجوهري هنا */}
          <div className="mt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
