import "../../M/Profile/Profile.css";
import React from "react";
import { useLocation } from "react-router-dom";
import { type UserForDisplay } from "../../M/Redux-Store/UserControle/UserDisplatSlice";

const ModernProfilePage = () => {
  const location = useLocation();
  
  // نعتمد على المستخدم الممرر من صفحة البحث
  const userInfo = location.state?.user as UserForDisplay | null;
  console.log(userInfo);
  if (!userInfo) return <div className="p-20 text-center">جاري التحميل...</div>;

  return (
    <div
      className="max-w-5xl mx-auto my-10 px-4 font-sans container pt-18.75 pb-10 "
      dir="rtl"
    >
      {/* بطاقة الرأس */}
      <div className="relative rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 profileContainer">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start -mt-12 gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 w-full">
              {/* صورة المستخدم */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-800 bg-gray-200 overflow-hidden shadow-lg mt-2 md:mt-0">
                  {userInfo.avatar_url ? (
                    <img
                      src={userInfo.avatar_url}
                      className="w-full h-full object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-300 select-none">
                      {userInfo.first_name?.[0].toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </div>

              {/* اسم المستخدم والسيرة الذاتية */}
              <div className="text-center md:text-right flex-1 pt-2 md:pt-14">
                <h1 className="text-3xl font-bold text-gray-800">
                  {userInfo.first_name} {userInfo.last_name}
                </h1>
                <p className="text-gray-500 text-base mb-3" dir="ltr">@{userInfo.username}</p>
                {userInfo.bio && (
                  <p className="text-gray-700 text-md leading-relaxed max-w-2xl bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100">
                    {userInfo.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* الحقول (نصوص عادية) */}

          <div className="mt-10 border-t border-gray-100 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 border-r-4 border-indigo-500 pr-3">المعلومات الأساسية</h2>
              {userInfo.created_at && (
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
                  أنضم منذ: {new Date(userInfo.created_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
              {/* الاسم الاول */}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-400">الاسم الأول</label>
                <p className="text-lg font-semibold text-gray-800">{userInfo.first_name || "—"}</p>
              </div>

              {/* الاسم الأخير */}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-400">الاسم الأخير</label>
                <p className="text-lg font-semibold text-gray-800">{userInfo.last_name || "—"}</p>
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-400">البريد الإلكتروني</label>
                <p className="text-lg font-semibold text-gray-800" dir="ltr">{userInfo.email || "—"}</p>
              </div>

              {/* المحافظة */}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-400">المحافظة</label>
                <p className="text-lg font-semibold text-gray-800">{userInfo.location?.governorate || "—"}</p>
              </div>

              {/* المدينة */}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-400">المدينة</label>
                <p className="text-lg font-semibold text-gray-800">{userInfo.location?.city || "—"}</p>
              </div>

              {/* أرقام الهواتف */}
              {userInfo.phone_numbers && userInfo.phone_numbers.length > 0 && (
                <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-400">أرقام الهواتف</label>
                  <div className="flex flex-wrap gap-3">
                    {userInfo.phone_numbers.map((phone: string, index: number) => (
                      <div key={index} className="bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-xl" dir="ltr">
                        {phone}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الروابط الاجتماعية */}
              {userInfo.social_links && userInfo.social_links.length > 0 && (
                <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-400">الروابط الاجتماعية</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userInfo.social_links.map((link, index) => (
                      <a
                         key={index}
                         href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                         <span className="font-bold text-gray-700">{link.platform || "رابط"}:</span>
                         <span className="text-blue-600 truncate break-all block flex-1" dir="ltr">{link.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="border border-gray-100 bg-gray-50 mt-10 p-6 rounded-3xl flex justify-evenly divide-x-2 divide-x-reverse font-extrabold text-2xl shadow-sm">
            <div className="flex flex-col element-center gap-2 flex-1">
              <h2 className="text-gray-500 text-lg">المتابعون</h2>
              <h2 className="text-indigo-600 text-3xl">{userInfo.stats?.followers || 0}</h2>
            </div>
            <div className="flex flex-col element-center gap-2 flex-1">
              <h2 className="text-gray-500 text-lg">المنشورات</h2>
              <h2 className="text-indigo-600 text-3xl">{userInfo.stats?.posts_count || 0}</h2>
            </div>
            <div className="flex flex-col element-center gap-2 flex-1">
              <h2 className="text-gray-500 text-lg">أتابع</h2>
              <h2 className="text-indigo-600 text-3xl">{userInfo.stats?.following || 0}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfilePage;
