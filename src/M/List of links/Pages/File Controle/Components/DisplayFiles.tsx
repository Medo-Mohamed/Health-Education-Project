import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // إدارة Query Params للـ URL
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Trash2,
  UploadCloud,
  Search,
  Presentation,
  FileBox,
  FileIcon,
} from "lucide-react";
import AxiosApi from "../../../../../AxiosApi";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../../store";
import {
  close,
  loading,
  open,
} from "../../../../Redux-Store/SuccessFaildState/SFS";

interface FileItem {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedAt?: string;
  createdAt: string;
  fileUrl: string;
}

const ArchiveManager = () => {
  const UserRole = useSelector(
    (state: RootState) => state.User.data.user?.role,
  );
  const dispatch = useDispatch<AppDispatch>();

  // إدارة الـ Query Params من الـ URL
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const searchFromUrl = searchParams.get("search") || "";

  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(searchFromUrl);
  const [totalPages, setTotalPages] = useState<number>(1);

  // 1. جلب البيانات بناءً على الـ Query Params
  const fetchFiles = async (
    page: number,
    searchQuery: string,
  ): Promise<void> => {
    dispatch(loading());
    try {
      const response = await AxiosApi.get(
        `/auth/withlogin/files?page=${page}&search=${encodeURIComponent(searchQuery)}`,
      );
      setFiles(response.data?.data?.files || []);
      setTotalPages(response.data?.data?.totalPages || 1);
      dispatch(close());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching files:", error);
        dispatch(
          open({
            state: "faild",
            title: error.response?.data?.message || "حدث خطأ أثناء جلب الملفات",
          }),
        );
      } else {
        console.error("Unexpected error:", error);
        dispatch(
          open({
            state: "faild",
            title: "حدث خطأ غير متوقع أثناء جلب الملفات",
          }),
        );
      }
    }
  };

  // مزامنة حقل البحث إذا تغير من الـ URL
  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  // جلب البيانات عند تغير الـ URL
  useEffect(() => {
    fetchFiles(pageFromUrl, searchFromUrl);
  }, [pageFromUrl, searchFromUrl]);

  // تحديث الـ URL عند الكتابة مع Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== searchFromUrl) {
        const newParams = new URLSearchParams(searchParams);
        if (searchTerm.trim()) {
          newParams.set("search", searchTerm);
        } else {
          newParams.delete("search");
        }
        newParams.set("page", "1"); // العودة للصفحة الأولى
        setSearchParams(newParams);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchFromUrl, searchParams, setSearchParams]);

  // تغيير الصفحة
  const onPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);
    }
  };

  // 2. رفع الملفات + إعادة جلب البيانات فوراً
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      dispatch(loading());
      const response = await AxiosApi.post(
        "/auth/withlogin/files/upload",
        formData,
      );

      // تفريغ حقل البحث وتصفير الصفحة في URL
      setSearchParams({});
      setSearchTerm("");

      // طلب البيانات المحدثة مباشرة من الباك إند
      await fetchFiles(1, "");

      dispatch(
        open({
          state: "success",
          title: response.data.message || "تم رفع الملف بنجاح",
        }),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error uploading file:", error);
        dispatch(
          open({
            state: "faild",
            title: error.response?.data?.message || "حدث خطأ أثناء رفع الملف",
          }),
        );
      } else {
        console.error("Unexpected error:", error);
        dispatch(
          open({
            state: "faild",
            title: "حدث خطأ غير متوقع أثناء رفع الملف",
          }),
        );
      }
    } finally {
      // إعادة تعيين قيمة الـ input ليتمكن المستخدم من رفع نفس الملف مرة أخرى
      event.target.value = "";
    }
  };

  // 3. حذف الملف
  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation(); // منع تنفيذ حدث التحميل عند الضغط على أيقونة الحذف

    if (!window.confirm("هل أنت تأكد من أنك تريد حذف هذا الملف؟")) {
      return;
    }

    try {
      dispatch(loading());
      const response = await AxiosApi.delete(`/auth/withlogin/files/${fileId}`);

      // إعادة جلب البيانات للصفحة الحالية
      await fetchFiles(pageFromUrl, searchFromUrl);

      dispatch(
        open({
          state: "success",
          title: response.data?.message || "تم حذف الملف بنجاح",
        }),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting file:", error);
        dispatch(
          open({
            state: "faild",
            title: error.response?.data?.message || "حدث خطأ أثناء حذف الملف",
          }),
        );
      } else {
        console.error("Unexpected error deleting file:", error);
        dispatch(
          open({
            state: "faild",
            title: "حدث خطأ غير متوقع أثناء حذف الملف",
          }),
        );
      }
    }
  };

  // 4. تحميل الملف للجهاز مباشر بدون مشاكل CORS
  const handleDownloadFile = async (
    e: React.MouseEvent,
    fileUrl: string,
    fileName: string,
  ) => {
    e.stopPropagation();
    dispatch(loading());

    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob",
        withCredentials: false,
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      dispatch(close());
    } catch (error) {
      console.warn(
        "Direct blob download failed, falling back to direct force-download link:",
        error,
      );

      try {
        let forceDownloadUrl = fileUrl;
        if (
          fileUrl.includes("cloudinary.com") &&
          fileUrl.includes("/upload/")
        ) {
          forceDownloadUrl = fileUrl.replace(
            "/upload/",
            "/upload/fl_attachment/",
          );
        }

        const link = document.createElement("a");
        link.href = forceDownloadUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackErr) {
        console.error("All download methods failed:", fallbackErr);
        dispatch(
          open({
            state: "faild",
            title: "فشل تنزيل الملف، يرجى المحاولة لاحقاً",
          }),
        );
      } finally {
        dispatch(close());
      }
    }
  };

  // اختيار أيقونة النوع ولون تمييز البطاقة
  const getFileStyle = (type: string) => {
    const fileType = type.toLowerCase();

    switch (fileType) {
      case "pdf":
        return {
          icon: <FileText className="text-red-500" size={28} />,
          badge: "bg-red-50 text-red-600 border-red-200",
        };
      case "doc":
      case "docx":
        return {
          icon: <FileText className="text-blue-600" size={28} />,
          badge: "bg-blue-50 text-blue-600 border-blue-200",
        };
      case "xls":
      case "xlsx":
      case "csv":
        return {
          icon: <FileSpreadsheet className="text-green-600" size={28} />,
          badge: "bg-green-50 text-green-600 border-green-200",
        };
      case "ppt":
      case "pptx":
        return {
          icon: <Presentation className="text-orange-500" size={28} />,
          badge: "bg-orange-50 text-orange-600 border-orange-200",
        };
      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
      case "gif":
        return {
          icon: <ImageIcon className="text-purple-500" size={28} />,
          badge: "bg-purple-50 text-purple-600 border-purple-200",
        };
      case "zip":
      case "rar":
      case "7z":
        return {
          icon: <FileBox className="text-yellow-600" size={28} />,
          badge: "bg-yellow-50 text-yellow-600 border-yellow-200",
        };
      default:
        return {
          icon: <FileIcon className="text-gray-400" size={28} />,
          badge: "bg-gray-50 text-gray-600 border-gray-200",
        };
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              أرشيف الملفات الصحية
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              اضغط على أي كارت لبدء تحميل الملف فوراً
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <form
              className="relative w-full sm:w-64"
              onSubmit={(e) => e.preventDefault()}
            >
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ابحث عن ملف..."
                className="pr-10 pl-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </form>

            {(UserRole === "admin" || UserRole === "dev") && (
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition shadow-sm active:scale-95">
                <UploadCloud size={18} />
                <span>رفع ملف</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .png, .jpg, .jpeg, .webp, .zip"
                />
              </label>
            )}
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {files.map((file) => {
            const style = getFileStyle(file.fileType);

            return (
              <div
                key={file._id}
                onClick={(e) =>
                  handleDownloadFile(e, file.fileUrl, file.fileName)
                }
                className="group relative bg-white text-gray-900 border border-gray-300 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* الجزء العلوي: الأيقونة مع نوع الملف و الحذف */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    {style.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border ${style.badge}`}
                    >
                      {file.fileType}
                    </span>
                    {(UserRole === "admin" || UserRole === "dev") && (
                      <button
                        onClick={(e) => handleDeleteFile(e, file._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400! hover:bg-red-50 rounded-lg transition active:scale-95"
                        title="حذف الملف"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* تفاصيل الملف ونبذة عن المحتوى */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <h3
                    className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </h3>

                  {/* نبذة ومعلومات الحجم والتاريخ */}
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] sm:text-xs text-gray-600">
                    <span>{file.fileSize || "غير محدد"}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* زر تحميل */}
                <div className="mt-3 pt-2.5  border-gray-100 flex items-center justify-center gap-2 text-xs font-medium text-blue-600 group-hover:bg-blue-600 group-hover:text-white py-2 rounded-xl transition-all">
                  <Download size={14} />
                  <span>تحميل الملف</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* الترقيم / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-center mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => onPageChange(pageFromUrl - 1)}
              disabled={pageFromUrl === 1}
              className={`px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                pageFromUrl === 1
                  ? "opacity-50 border-0 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              السابق
            </button>

            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const range = 1;

                for (let i = 1; i <= totalPages; i++) {
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= pageFromUrl - range && i <= pageFromUrl + range)
                  ) {
                    pages.push(i);
                  } else if (
                    i === pageFromUrl - range - 1 ||
                    i === pageFromUrl + range + 1
                  ) {
                    pages.push("...");
                  }
                }

                return pages.map((pageNum, index) => {
                  if (pageNum === "...") {
                    return (
                      <span
                        key={`dots-${index}`}
                        className="px-1.5 text-xs text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum as number)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        pageFromUrl === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
            </div>

            <button
              onClick={() => onPageChange(pageFromUrl + 1)}
              disabled={pageFromUrl === totalPages}
              className={`px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                pageFromUrl === totalPages
                  ? "opacity-50 border-0 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveManager;
