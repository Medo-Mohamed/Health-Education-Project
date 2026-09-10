import "../../../Profile/Profile.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store";
import AxiosApi from "../../../../AxiosApi";
import { loading, open } from "../../../Redux-Store/SuccessFaildState/SFS";
import { MdSunny } from "react-icons/md";
import { useParams } from "react-router-dom";
import { RiUserFollowFill, RiUserUnfollowFill } from "react-icons/ri";
const colorsList = [
  { name: "Red", class: "bg-red-600" },
  { name: "Blue", class: "bg-blue-600" },
  { name: "Yellow", class: "bg-yellow-400" },
  { name: "Green", class: "bg-green-600" }, // إضافي للـ RGB
];
interface UserInfo {
  avatar_url: string;
  bio: string;
  created_at: string;
  first_name: string;
  last_name: string;
  id: string;
  role: "user" | "admin" | "dev";
  location: {
    governorate: string;
    city: string;
  };
  social_links: {
    platform: string;
    url: string;
  }[];
  stats: { posts_count: number; followers: number; following: number };
  username: string;
  phone_numbers: string[];
  email?: string;
  last_login: string;
  isFollowing: boolean;
}

const ModernProfilePage = () => {
  const { userId } = useParams();
  // const location = useLocation();
  const AuthUser = useSelector((state: RootState) => state.User);
  const dispatch = useDispatch<AppDispatch>();
  // نعتمد على المستخدم الممرر من صفحة البحث
  // const userId = location.state?.id as string;
  // console.log(userId);
  const [User, setUser] = useState<UserInfo | null>(null);
  async function fetchUserData() {
    try {
      const userInfo = await AxiosApi.get(
        `/auth/withlogin/search/getuser/${userId}`,
      );

      console.log(userInfo.data);
      setUser(userInfo.data);
    } catch (error: any) {
      dispatch(
        open({
          state: "faild",
          title: "حدث خطأ",
          descreption: error.response?.data?.message,
        }),
      );
    }
  }
  useEffect(() => {
    console.log("AMOUNT");
    if (userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUserData();
    }
  }, []);
  return (
    <div
      className="max-w-5xl mx-auto my-10 px-4 font-sans container pt-18.75 pb-10 "
      dir="rtl"
    >
      {/* بطاقة الرأس */}
      <div className="relative rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 profileContainer">
        <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600 opacity-30"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start -mt-12 gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-5 w-full">
              {/* صورة المستخدم */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-800 bg-gray-200 overflow-hidden shadow-lg mt-2 md:mt-0">
                  {User?.avatar_url ? (
                    <img
                      src={User.avatar_url}
                      className="w-full h-full object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-300 select-none">
                      {User?.first_name?.[0].toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </div>

              {/* اسم المستخدم  */}
              <div className="text-center md:text-right flex-1 pt-2 md:pt-14">
                <h1 className="text-3xl font-bold ">
                  {User?.first_name} {User?.last_name}
                </h1>
                <p className=" text-base mb-3" dir="ltr">
                  @{User?.username}
                </p>
              </div>
              {/* متابعة وإلغاء متابعة المستخدمين  */}
              <div className="text-center md:text-right pt-2 md:pt-14">
                <div
                  className="fit-box text-3xl p-1 rounded-full group bg-black/20 cursor-pointer hover:bg-black/70"
                  onClick={async () => {
                    const routeF = User?.isFollowing
                      ? "unfollowuser"
                      : "followuser";
                    dispatch(loading());
                    try {
                      const res = await AxiosApi.post(
                        `/auth/withlogin/${routeF}/${User?.id}`,
                      );
                      dispatch(
                        open({
                          state: "success",
                          title: res.data?.message || "",
                        }),
                      );
                    } catch (error: any) {
                      dispatch(
                        open({
                          state: "faild",
                          title: "حدث خطأ",
                          descreption: error.response?.data?.message,
                        }),
                      );
                    }
                    await fetchUserData();
                  }}
                >
                  {User?.isFollowing ? (
                    <RiUserUnfollowFill className="group-hover:text-red-200" />
                  ) : (
                    <RiUserFollowFill className="group-hover:text-green-200" />
                  )}
                </div>
              </div>

              {AuthUser.status === "idle" &&
                AuthUser.data.user?.role === "dev" && (
                  <div className="text-center md:text-right pt-2 md:pt-14">
                    <input
                      type="checkbox"
                      checked={User?.role === "admin"}
                      // checked={true}
                      className="w-15 h-8 appearance-none rounded-full border-0 bg-white checked:bg-yellow-500! cursor-pointer focus:ring-0 focus:ring-offset-0"
                      onChange={async (e) => {
                        dispatch(loading());
                        try {
                          const res = await AxiosApi.post(
                            `/auth/withlogin/dev/toggleadmin`,
                            {
                              id: User?.id,
                              adminState: e.target.checked,
                            },
                          );
                          await fetchUserData();
                          dispatch(
                            open({
                              state: "success",
                              title: res.data?.message || "",
                            }),
                          );
                        } catch (error: any) {
                          dispatch(
                            open({
                              state: "faild",
                              title: "حدث خطأ",
                              descreption: error.response?.data?.message,
                            }),
                          );
                        }
                      }}
                      title={"تعيين كمشرف"}
                    />
                  </div>
                )}
            </div>
            {/* في حالة إذا لم يكن مستخدم عادي  */}
            {User?.role !== "user" && (
              <div
                className={`absolute -top-18 -left-7 element-center ${User?.role === "admin" ? "text-yellow-500" : "text-red-400"}`}
              >
                <MdSunny size={100} />
                <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-black font-extrabold -rotate-30">
                  {User?.role === "admin"
                    ? "مشرف"
                    : User?.role === "dev"
                      ? "مسئول"
                      : ""}
                </span>
              </div>
            )}
          </div>

          {/* السيرة الذاتية */}
          <div>
            {User?.bio && (
              <p className=" text-md leading-relaxed  ">{User?.bio}</p>
            )}
          </div>

          {/* الحقول (نصوص عادية) */}

          <div className="mt-5 border-t  pt-2">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold  border-b-4 md:border-b-0 border-r-0 md:border-r-4 border-indigo-500 p-3">
                المعلومات الأساسية
              </h2>
              <div className="flex flex-col gap-1">
                {User?.created_at && (
                  <span className="text-sm font-medium  px-4 py-1.5 rounded-full bg-gray-500/50">
                    أنضم منذ:{" "}
                    {new Date(User?.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {User?.last_login && (
                  <span className="text-sm font-medium  px-4 py-1.5 rounded-full bg-gray-500/50">
                    أخر ظهور :{" "}
                    {new Date(User?.last_login).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8  p-6 rounded-2xl border shadow-sm text-right items-start">
              {/* الاسم الاول */}
              <div className="space-y-1">
                <label className="block text-sm font-bold opacity-70">
                  الاسم الأول
                </label>
                <p className="text-lg font-semibold ">
                  {User?.first_name || "—"}
                </p>
              </div>

              {/* الاسم الأخير */}
              <div className="space-y-1">
                <label className="block text-sm font-bold opacity-70 ">
                  الاسم الأخير
                </label>
                <p className="text-lg font-semibold ">
                  {User?.last_name || "—"}
                </p>
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-sm font-bold opacity-70">
                  البريد الإلكتروني
                </label>
                <p className="text-lg font-semibold " dir="ltr">
                  {User?.email || "—"}
                </p>
              </div>

              {/* المحافظة */}
              <div className="space-y-1">
                <label className="block text-sm font-bold opacity-70">
                  المحافظة
                </label>
                <p className="text-lg font-semibold ">
                  {User?.location?.governorate || "—"}
                </p>
              </div>

              {/* المدينة */}
              <div className="space-y-1">
                <label className="block text-sm font-bold opacity-70">
                  المدينة
                </label>
                <p className="text-lg font-semibold ">
                  {User?.location?.city || "—"}
                </p>
              </div>

              {/* أرقام الهواتف */}
              {User?.phone_numbers && User?.phone_numbers.length > 0 && (
                <div className="space-y-2 md:col-span-2  pt-4 border-t ">
                  <label className="block text-sm font-bold opacity-70">
                    أرقام الهواتف
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {User?.phone_numbers.map((phone: string, index: number) => (
                      <div
                        key={index}
                        className="bg-black/30 font-semibold px-4 py-2 rounded-xl"
                        dir="ltr"
                      >
                        {phone}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الروابط الاجتماعية */}
              {User?.social_links && User?.social_links.length > 0 && (
                <div className="space-y-2 md:col-span-2  pt-4 border-t ">
                  <label className="block text-sm font-bold opacity-70">
                    الروابط الاجتماعية
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  lg:grid-cols-8 xl:grid-cols-10 gap-4 overflow-hidden">
                    {User?.social_links.map((link, index) => (
                      <a
                        key={index}
                        href={
                          link.url.startsWith("http")
                            ? link.url
                            : `https://${link.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        title={
                          link.url.startsWith("http")
                            ? link.url
                            : `https://${link.url}`
                        }
                        className={`p-2 rounded-xl transition-colors element-center opacity-90 hover:opacity-100 text-white
                          ${colorsList[index % 4].class}`}
                      >
                        <span className="font-bold ">
                          {link.platform.toUpperCase() || "رابط"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="border  mt-10 p-6 rounded-3xl flex justify-evenly divide-x-2 font-extrabold text-2xl shadow-sm">
            <div className="flex flex-col element-center gap-2 flex-1">
              <h2 className=" text-lg">المتابعون</h2>
              <h2 className="text-indigo-600 text-3xl">
                {User?.stats?.followers || 0}
              </h2>
            </div>
            <div className="flex flex-col element-center gap-2 flex-1">
              <h2 className=" text-lg">المنشورات</h2>
              <h2 className="text-indigo-600 text-3xl">
                {User?.stats?.posts_count || 0}
              </h2>
            </div>
            <div className="flex flex-col element-center gap-2 flex-1">
              <h2 className=" text-lg">أتابع</h2>
              <h2 className="text-indigo-600 text-3xl">
                {User?.stats?.following || 0}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfilePage;
