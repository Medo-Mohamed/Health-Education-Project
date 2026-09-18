import { PlusIcon } from "@heroicons/react/24/outline"; // تأكد من تثبيت heroicons أو استخدم علامة + عادية
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../../store";
import { useEffect, useState } from "react";
import { getAllTablesSummary } from "../../../../Redux-Store/TopicTablesControle/TopicTables";
import CreateTopicModal from "./CreateTopicModal";
import { NavLink, useLocation } from "react-router-dom";
const TablesGrid = () => {
  const location = useLocation();
  const TablesData = useSelector(
    (state: RootState) => state.TopicTabel.info.data,
  );
  const UserRole = useSelector(
    (state: RootState) => state.User.data.user?.role,
  );
  const [openCTM, setOpenCTM] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getAllTablesSummary());
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {/* عرض الجداول الموجودة */}
      {TablesData.map((table) => (
        <NavLink
          to={`${location.pathname}/topictabledetails/${table._id}`}
          key={table._id}
        >
          <div className="group relative bg-slate-200 text-gray-900 border border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-40 cursor-pointer">
            <div>
              {/* المربع الكبير الرئيسي (العنوان/الفئة) */}
              <h3 className="text-xl text-center font-bold mb-2 group-hover:text-blue-600 transition-colors">
                {table.title}
              </h3>

              {/* الوصف المندرج تحتها */}
              <p
                className="text-sm leading-relaxed line-clamp-3"
                title={table.description}
              >
                {table.description}
              </p>
            </div>

            {/* خط زخرفي صغير في الأسفل */}
            <div className="mt-4 w-0 h-1 bg-blue-300 group-hover:w-full transition-all duration-500 rounded-full" />
          </div>
        </NavLink>
      ))}

      {/* كارت الإنشاء الجديد */}
      {UserRole && (UserRole === "admin" || UserRole === "dev") && (
        <>
          <button
            onClick={() => setOpenCTM(true)}
            className="flex flex-col items-center justify-center min-h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 group"
          >
            <div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
              <PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
            </div>
            <span className="mt-3 font-medium text-gray-500 group-hover:text-blue-600">
              إنشاء جدول جديد
            </span>
          </button>
          <CreateTopicModal
            isOpen={openCTM}
            onClose={() => setOpenCTM(false)}
            type={"create"}
          />
        </>
      )}
    </div>
  );
};

export default TablesGrid;
