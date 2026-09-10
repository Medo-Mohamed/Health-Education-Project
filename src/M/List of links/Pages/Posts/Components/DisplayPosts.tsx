import React, { useState, useEffect, useRef } from "react"; // 👈 استيراد الإعدادات الخاصة بك
import AxiosApi from "../../../../../AxiosApi";
import { API_BASE_URL } from "../../../../../Constant";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../store";
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
const HealthPosts = () => {
  const UserRole = useSelector(
    (state: RootState) => state.User.data.user?.role,
  ); // 👈 استبدل هذا بالمنطق الفعلي للحصول على دور المستخدم
  const [posts, setPosts] = useState<IPost[]>([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [postTime, setPostTime] = useState<{ days: number; hours: number }>({
    days: 30,
    hours: 0,
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. جلب المنشورات باستخدام AxiosApi
  const fetchPosts = async () => {
    try {
      const response = await AxiosApi.get("/auth/withlogin/posts");
      console.log("المنشورات المستلمة:", response.data);
      setPosts(response.data?.posts || []);
    } catch (error: any) {
      // console.error("خطأ في جلب المنشورات:", error);
      console.log("خطأ في جلب المنشورات:", error.response || error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. إرسال المنشور الجديد
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);
    formData.append("days", postTime.days.toString());
    formData.append("hours", postTime.hours.toString());

    try {
      // AxiosApi سيتعامل تلقائياً مع الكوكيز (withCredentials)
      await AxiosApi.post("/auth/withlogin/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("تم نشر المنشور بنجاح!");

      setContent("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPosts();
    } catch (error: any) {
      console.error("خطأ في النشر:", error.response || error);
    } finally {
      setLoading(false);
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
        <div className="bg-white dark:bg-gray-800  rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-2 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-3 outline-none dark:bg-gray-600 dark:text-gray-300 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none"
              rows={3}
              placeholder="اكتب نصيحة طبية أو معلومة توعوية..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* --- جزء تحديد الوقت الجديد --- */}
            <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 dark:bg-gray-700 dark:border-gray-600">
              <label className="block text-xs font-bold text-indigo-900 mb-2 mr-1 dark:text-gray-300">
                مدة عرض المنشور (بحد أقصى شهر):
              </label>
              <div className="flex items-center gap-4 flex-col md:flex-row ">
                {/* إدخال الأيام */}
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

                {/* إدخال الساعات */}
                <div className="flex flex-1 items-center gap-2 w-full ">
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
            {/* ---------------------------- */}

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
                disabled={loading || (!content && !file)}
                className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                {loading ? "جاري النشر..." : "نشر الآن"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* قائمة المنشورات */}
      <div className="space-y-6" dir="rtl">
        {posts.map((post) => {
          // 1. استخراج المعرف الحقيقي للمستخدم (يجب جلب ID المستخدم المسجل حالياً)
          const currentUserId = "USER_ID_FROM_AUTH_STORE";

          return (
            <div
              key={post._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:bg-gray-700 dark:border-gray-600 overflow-hidden"
            >
              {/* رأس المنشور: بيانات الناشر باستخدام المسميات الجديدة */}
              <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-black/10">
                <div className="flex items-center gap-3">
                  <img
                    src={`${post.ownerDocument.avatar_url}`}
                    alt={post.ownerDocument.first_name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-indigo-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.png";
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-300 text-sm">
                      {post.ownerDocument.first_name}{" "}
                      {post.ownerDocument.last_name}
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

                {/* شارة الوقت المتبقي بجانب الاسم */}
                <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 text-center">
                  {calculateTimeLeft(post.expiresAt)}
                </div>
              </div>

              {/* عرض الوسائط (Media) */}
              <div className="relative bg-black/5 flex justify-center items-center overflow-hidden group">
                {post.mediaType === "image" ? (
                  /* تحسين عرض الصور */
                  <div className="relative w-full flex justify-center bg-gray-100">
                    <img
                      src={`${API_BASE_URL}/${post.mediaPath}`}
                      className="w-full h-auto max-h-137.5 object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                      alt="Post Content"
                      loading="lazy"
                    />
                    {/* ظل خفيف في الأسفل ليعطي عمقاً للصورة */}
                    <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.05)] pointer-events-none"></div>
                  </div>
                ) : post.mediaType === "video" ? (
                  /* تحسين عرض الفيديو ليكون جذاباً كمنصات التواصل */
                  <div className="relative w-full bg-black flex items-center">
                    <video
                      src={`${API_BASE_URL}/${post.mediaPath}`}
                      controls
                      className="w-full max-h-150 shadow-2xl"
                      // بوستر اختياري يظهر قبل التشغيل لزيادة الجاذبية
                      poster={`${API_BASE_URL}/uploads/placeholders/video-bg.jpg`}
                      // خاصية تجعل الفيديو لا يخرج عن الإطار في الموبايل
                      playsInline
                      // تحسين تحميل الفيديو
                      preload="metadata"
                    >
                      <source
                        src={`${API_BASE_URL}/${post.mediaPath}`}
                        type="video/mp4"
                      />
                      متصفحك لا يدعم تشغيل الفيديو.
                    </video>

                    {/* إضافة تدرج لوني خفيف خلف أزرار التحكم لجعلها أوضح */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ) : null}
              </div>

              {/* محتوى النص */}
              <div className="p-5">
                {post.content && (
                  <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed  whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}
              </div>

              {/* أزرار التفاعل */}
              <div className="flex items-center justify-start gap-8 border-t p-3 bg-black/10">
                {/* زر الإعجاب */}
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

                {/* عدد المشاهدات */}
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
    </div>
  );
};

export default HealthPosts;
