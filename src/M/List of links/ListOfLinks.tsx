import React, { useState } from "react";
import { FaUserEdit, FaCog, FaHistory } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "./ListOfLinks.css";
import { v4 as uuid4 } from "uuid";
import FriendSearsh from "./Components/Friend Searsh/FriendSearsh";

// 1. تعريف واجهة البيانات (Interface)
interface SidebarLink {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

// 2. فصل البيانات خارج الكومبوننت لسهولة التعديل
const MENU_DATA: SidebarLink[] = [
  {
    id: uuid4(),
    title: "البحث عن المستخدمين",
    icon: <FaUserEdit size={20} />,
    component: <FriendSearsh />,
  },
  {
    id: uuid4(),
    title: "لوحة التحكم",
    icon: <MdDashboard size={20} />,
    component: <div>إحصائيات المنصة الصحية</div>,
  },
  {
    id: uuid4(),
    title: "سجل العمليات",
    icon: <FaHistory size={20} />,
    component: <div>هنا يظهر سجل النشاطات</div>,
  },
  {
    id: uuid4(),
    title: "الإعدادات",
    icon: <FaCog size={20} />,
    component: <div>إعدادات الحساب الشخصي</div>,
  },
];

function ListOfLinks() {
  // استخدام الـ ID بدلاً من Index لجعل الكود أكثر أماناً
  const [selectedId, setSelectedId] = useState<string>("");

  // العثور على الكومبوننت المختار لعرضه
  const activeComponent = MENU_DATA.find((item) => item.id === selectedId);

  return (
    <div className="container min-h-screen pt-20 flex flex-col p-4 " dir="rtl">
      <div className="flex flex-1 gap-1 md:gap-2 lg:gap-4">
        {/* الشريط الجانبي - Aside */}
        <aside className="boxColors w-fit lg:w-64 flex flex-col space-y-2 p-2  rounded-3xl shadow-sm border border-gray-100  transition-all duration-300">
          {MENU_DATA.map((link) => {
            const isActive = selectedId === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setSelectedId(link.id)}
                className={`
                  flex items-center gap-3 cursor-pointer p-3 rounded-2xl w-full transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                      : "text-gray-500 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600"
                  }
                `}
                title={link.title}
              >
                <div
                  className={`${isActive ? "text-white" : "text-indigo-500"}`}
                >
                  {link.icon}
                </div>
                <span className="hidden md:block font-medium text-sm">
                  {link.title}
                </span>
              </button>
            );
          })}
        </aside>

        {/* منطقة العرض - Main Content */}
        <main className="boxColors flex-1   rounded-3xl shadow-sm border border-gray-100  p-6 space-y-2">
          <div className="font-bold text-2xl text-shadow-gray-400">
            {activeComponent?.title}
          </div>
          {activeComponent && (
            <div className="h-2 border-none sepretor rounded-full" />
          )}
          <div className="">{activeComponent?.component}</div>
        </main>
      </div>
    </div>
  );
}

export default ListOfLinks;
