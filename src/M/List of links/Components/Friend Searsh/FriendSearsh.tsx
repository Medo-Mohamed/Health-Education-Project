import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store";
import {
  clearState,
  searchUserByUsername,
} from "../../../Redux-Store/UserSearch/UserSearch";
import { Link } from "react-router-dom";

function UserSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const UserSearch = useSelector((state: RootState) => state.UserSearch);
  const dispatch = useDispatch<AppDispatch>();
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(searchUserByUsername({ searchTerm }));
    console.log(UserSearch);
  };

  useEffect(() => {
    dispatch(clearState());
  }, [dispatch]);

  return (
    <div className=" max-w-4xl mx-auto" dir="rtl">
      {/* صندوق البحث */}
      <form onSubmit={handleSearch} className="flex gap-2 flex-col md:flex-row">
        <div className="flex flex-col gap-1 flex-1">
          <input
            type="text"
            placeholder="ابحث عن اسم المستخدم (4 أحرف على الأقل)..."
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {UserSearch.error && (
            <p className="text-red-500">{UserSearch.error}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 h-[49.6px] rounded-xl hover:bg-indigo-700 transition"
        >
          بحث
        </button>
      </form>

      {/* عرض النتائج */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {UserSearch.state === "loading" ? (
          <p>جاري التحميل...</p>
        ) : (
          UserSearch.info.data.map((user) => (
            <Link
              key={user._id}
              to="/profile_view"
              state={{ user }}
              className="flex items-center gap-3 p-4 bg-white border rounded-2xl shadow-sm hover:bg-gray-50 transition block"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-gray-800 truncate">
                {user.username}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* أزرار التنقل (Pagination) */}
      {UserSearch.info.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={UserSearch.info.currentPage === 1}
            onClick={() =>
              dispatch(
                searchUserByUsername({
                  searchTerm,
                  page: UserSearch.info.currentPage - 1,
                }),
              )
            }
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            السابق
          </button>

          <span className="font-medium">
            صفحة {UserSearch.info.currentPage} من {UserSearch.info.totalPages}
          </span>

          <button
            disabled={
              UserSearch.info.currentPage === UserSearch.info.totalPages
            }
            onClick={() =>
              dispatch(
                searchUserByUsername({
                  searchTerm,
                  page: UserSearch.info.currentPage + 1,
                }),
              )
            }
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

export default UserSearchPage;
