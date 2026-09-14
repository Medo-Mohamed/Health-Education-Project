import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AxiosApi from "../../../../../AxiosApi";
import { API_BASE_URL } from "../../../../../Constant";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../../store";
import {
  loading,
  open,
  close,
} from "../../../../Redux-Store/SuccessFaildState/SFS";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface IPost {
  _id: string;
  content?: string;
  mediaPath: string | null;
  mediaType: "image" | "video" | "text";
  viewsCount: number;
  likes: string[];
  createdAt: Date;
  expiresAt: Date;
  ownerDocument: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface PostsResponse {
  posts: IPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const HealthPosts = () => {
  const UserRole = useSelector(
    (state: RootState) => state.User.data.user?.role,
  );

  const dispatch = useDispatch<AppDispatch>();

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [posts, setPosts] = useState<IPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [postTime, setPostTime] = useState<{ days: number; hours: number }>({
    days: 30,
    hours: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSuccessRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);

  // 1. جلب المنشورات مع الـ Query Params
  const fetchPosts = useCallback(async () => {
    dispatch(loading());
    try {
      const response = await AxiosApi.get<PostsResponse>(
        "/auth/withlogin/posts",
        {
          params: {
            page: pageFromUrl,
            limit: 10, // تحديد 10 منشورات لكل صفحة
          },
        },
      );

      setPosts(response.data?.posts || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalCount(response.data?.pagination?.total || 0);
    } catch (error: any) {
      console.log("خطأ في جلب المنشورات:", error.response || error);
    } finally {
      dispatch(close());
    }
  }, [pageFromUrl, dispatch]);

  useEffect(() => {
    let active = true;
    fetchPosts().then(() => {
      if (active && pendingSuccessRef.current) {
        pendingSuccessRef.current = false;
        dispatch(open({ state: "success", title: "تم نشر المنشور بنجاح!" }));
      }
    });
    return () => {
      active = false;
    };
  }, [fetchPosts, reloadKey, dispatch]);

  // تغيير رقم الصفحة عند الضغط
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

  // 2. إرسال المنشور الجديد
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !file) return;

    dispatch(loading());
    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);
    formData.append("days", postTime.days.toString());
    formData.append("hours", postTime.hours.toString());

    try {
      await AxiosApi.post("/auth/withlogin/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setContent("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // العودة للصفحة الأولى بعد النشر لرؤية المنشور الجديد
      pendingSuccessRef.current = true;
      if (pageFromUrl !== 1) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", "1");
          return newParams;
        });
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (error: any) {
      console.error("خطأ في النشر:", error.response || error);
      dispatch(
        open({
          state: "faild",
          title: "حدث خطأ أثناء نشر المنشور.",
        }),
      );
    }
  };

  const calculateTimeLeft = (expiryDate: Date) => {
    const difference = new Date(expiryDate).getTime() - new Date().getTime();
    if (difference <= 0) return "منتهي";

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

    if (days > 0) return `ينتهي خلال ${days} يوم و ${hours} ساعة`;
    return `ينتهي خلال ${hours} ساعة`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4" dir="rtl">
      {/* قسم إضافة منشور جديد */}
      {(UserRole === "admin" || UserRole === "dev") && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-2 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-3 outline-none dark:bg-gray-600 dark:text-gray-300 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none"
              rows={3}
              placeholder="اكتب نصيحة طبية أو معلومة توعوية..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* --- جزء تحديد الوقت --- */}
            <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 dark:bg-gray-700 dark:border-gray-600">
              <label className="block text-xs font-bold text-indigo-900 mb-2 mr-1 dark:text-gray-300">
                مدة عرض المنشور (بحد أقصى شهر):
              </label>
              <div className="flex items-center gap-4 flex-col md:flex-row">
                <div className="flex flex-1 items-center gap-2 w-full">
                  <label
                    className="text-xs text-gray-500 dark:text-gray-300"
                    htmlFor="numberOfDays"
                  >
                    أيام:
                  </label>
                  <input
                    id="numberOfDays"
                    type="number"
                    min="0"
                    max="30"
                    value={postTime.days}
                    onChange={(e) => {
                      const d = Math.min(
                        30,
                        Math.max(0, parseInt(e.target.value) || 0),
                      );
                      setPostTime({
                        ...postTime,
                        days: d,
                        hours:
                          d === 30
                            ? 0
                            : d === 0
                              ? Math.max(postTime.hours, 1)
                              : postTime.hours,
                      });
                    }}
                    className="w-full p-1.5 text-center border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                  />
                </div>

                <div className="flex flex-1 items-center gap-2 w-full">
                  <label
                    className="text-xs text-gray-500 dark:text-gray-300"
                    htmlFor="numberOfHours"
                  >
                    ساعات:
                  </label>
                  <input
                    id="numberOfHours"
                    type="number"
                    min="0"
                    max="23"
                    disabled={postTime.days >= 30}
                    value={postTime.hours}
                    onChange={(e) => {
                      const h = Math.min(
                        23,
                        Math.max(0, parseInt(e.target.value) || 0),
                      );
                      setPostTime({
                        ...postTime,
                        hours: postTime.days === 0 ? Math.max(h, 1) : h,
                      });
                    }}
                    className={`w-full p-1.5 text-center border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 outline-none ${
                      postTime.days >= 30
                        ? "bg-transparent/10 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 flex-col md:flex-row gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="text-xs text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />

              <button
                type="submit"
                disabled={!content && !file}
                className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                نشر الآن
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة المنشورات */}
      {posts.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border">
          لا توجد منشورات متاحة حالياً.
        </div>
      ) : (
        <div className="space-y-6" dir="rtl">
          {posts.map((post) => {
            const currentUserId = "USER_ID_FROM_AUTH_STORE";

            return (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:bg-gray-700 dark:border-gray-600 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-black/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={`${post.ownerDocument?.avatar_url}`}
                      alt={post.ownerDocument?.first_name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-indigo-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-avatar.png";
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-gray-300 text-sm">
                        {post.ownerDocument?.first_name}{" "}
                        {post.ownerDocument?.last_name}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 text-center">
                    {calculateTimeLeft(post.expiresAt)}
                  </div>
                </div>

                <div className="relative bg-black/5 flex justify-center items-center overflow-hidden group">
                  {post.mediaType === "image" ? (
                    <div className="relative w-full flex justify-center bg-gray-100">
                      <img
                        src={
                          post.mediaPath
                            ? post.mediaPath.startsWith("http")
                              ? post.mediaPath
                              : `${API_BASE_URL}/${post.mediaPath}`
                            : ""
                        }
                        className="w-full h-auto max-h-137.5 object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                        alt="Post Content"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.05)] pointer-events-none"></div>
                    </div>
                  ) : post.mediaType === "video" ? (
                    <div className="relative w-full bg-black flex items-center">
                      <video
                        src={
                          post.mediaPath
                            ? post.mediaPath.startsWith("http")
                              ? post.mediaPath
                              : `${API_BASE_URL}/${post.mediaPath}`
                            : undefined
                        }
                        controls
                        className="w-full max-h-150 shadow-2xl"
                        poster={`${API_BASE_URL}/uploads/placeholders/video-bg.jpg`}
                        playsInline
                        preload="metadata"
                      >
                        <source
                          src={
                            post.mediaPath
                              ? post.mediaPath.startsWith("http")
                                ? post.mediaPath
                                : `${API_BASE_URL}/${post.mediaPath}`
                              : undefined
                          }
                          type="video/mp4"
                        />
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ) : null}
                </div>

                <div className="p-5">
                  {post.content && (
                    <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-start gap-8 border-t p-3 bg-black/10">
                  <button
                    className={`flex items-center gap-2 group transition-all ${
                      post.likes?.includes(currentUserId)
                        ? "text-red-500 font-bold"
                        : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full transition-colors ${
                        post.likes?.includes(currentUserId)
                          ? "bg-red-50"
                          : "group-hover:bg-gray-100 dark:group-hover:bg-gray-600"
                      }`}
                    >
                      {post.likes?.includes(currentUserId) ? "❤️" : "🤍"}
                    </div>
                    <span className="text-sm">{post.likes?.length || 0}</span>
                  </button>

                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <div className="p-2 rounded-full">👁️</div>
                    <span className="text-sm font-medium">
                      {post.viewsCount} مشاهدة
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- عناصر التصفح والباجنيشن (Pagination Controls) --- */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 flex-col sm:flex-row gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            إجمالي المنشورات: {totalCount} | الصفحة {pageFromUrl} من{" "}
            {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pageFromUrl === 1}
              onClick={() => handlePageChange(Math.max(pageFromUrl - 1, 1))}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-3 text-gray-700 dark:text-gray-300">
              {pageFromUrl} / {totalPages}
            </span>
            <button
              disabled={pageFromUrl === totalPages}
              onClick={() =>
                handlePageChange(Math.min(pageFromUrl + 1, totalPages))
              }
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPosts;
