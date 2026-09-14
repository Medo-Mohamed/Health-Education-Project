import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store";
import {
  clearState,
  getFollowingUsers,
  searchUserByUsername,
} from "../../../Redux-Store/UserSearch/UserSearch";
import { Link, useSearchParams } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { close, loading } from "../../../Redux-Store/SuccessFaildState/SFS";

function UserSearchPage({ comesFrom }: { comesFrom: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const UserSearch = useSelector((state: RootState) => state.UserSearch);
  const dispatch = useDispatch<AppDispatch>();

  // ✅ الحل الصحيح: وضع الـ dispatch داخل useEffect
  useEffect(() => {
    if (UserSearch.state === "loading") {
      dispatch(loading());
    } else {
      dispatch(close());
    }
  }, [UserSearch.state, dispatch]);

  // مزامنة حقل المدخلات إذا تغير الـ URL
  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  // تنفيذ طلب البحث تلقائياً عند تغيير الـ URL (سواء كلمة البحث أو رقم الصفحة)
  useEffect(() => {
    dispatch(clearState());
    if (comesFrom === "searchUsers") {
      if (searchFromUrl.trim()) {
        dispatch(
          searchUserByUsername({
            searchTerm: searchFromUrl,
            page: pageFromUrl,
          }),
        );
      }
    } else if (comesFrom === "followingUsers") {
      dispatch(
        getFollowingUsers({
          searchTerm: searchFromUrl,
          page: pageFromUrl,
        }),
      );
    }
  }, [comesFrom, searchFromUrl, pageFromUrl, dispatch]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1"); // العودة للصفحة الأولى عند البحث الجديد
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {UserSearch.state === "loading" ? (
          <p>جاري التحميل...</p>
        ) : (
          UserSearch.info.data.map((user) => (
            <Link
              key={user._id}
              to={`/profile_view/${user._id}`}
              state={{ id: user._id }}
              className="flex items-center gap-3 p-4 border rounded-2xl shadow-sm hover:scale-101 cursor-pointer duration-300 transition-all list-of-users-finded"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden element-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt={user.username}
                    draggable="false"
                  />
                ) : (
                  <FaUserCircle className="w-full h-full " />
                )}
              </div>
              <div className="flex-col items-center">
                <h2 className="font-semibold text-xl">
                  {user.first_name} {user.last_name}
                </h2>
                <span className="text-sm">{user.username}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* أزرار التنقل (Pagination) */}
      {UserSearch.info.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={UserSearch.info.currentPage === 1}
            onClick={() => handlePageChange(UserSearch.info.currentPage - 1)}
            className="px-4 py-2 rounded-lg disabled:opacity-50"
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
            onClick={() => handlePageChange(UserSearch.info.currentPage + 1)}
            className="px-4 py-2 rounded-lg disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

export default UserSearchPage;
