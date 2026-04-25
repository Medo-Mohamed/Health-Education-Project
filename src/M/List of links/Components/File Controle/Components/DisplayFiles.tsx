import React, { useState, useEffect } from "react";
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
  ExternalLink,
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
  uploadedAt: string;
  createdAt: string;
  fileUrl: string;
}

// interface ApiResponse {
//   data: FileItem[];
// }

const ArchiveManager = () => {
  const UserRole = useSelector(
    (state: RootState) => state.User.data.user?.role,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [files, setFiles] = useState<FileItem[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // 1. مكان الـ API فارغ لجلب البيانات
  const fetchFiles = async (
    page: number = 1,
    searchQuery: string = "",
  ): Promise<void> => {
    dispatch(loading());
    try {
      // هنا تضع رابط الـ API الخاص بك مستقبلاً
      const response = await AxiosApi.get(
        `/auth/withlogin/files?page=${page}&search=${searchQuery}`,
      );
      console.log("API response:", response.data);

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

  const onPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchFiles(newPage, searchTerm); // جلب بيانات الصفحة الجديدة مع الاحتفاظ بكلمة البحث
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFiles(1, searchTerm); // العودة للصفحة 1 عند كل بحث جديد
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFiles();
  }, []);

  // 2. مكان الـ API فارغ لرفع الملفات
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
      console.log("Upload response:", response.data);
      // بعد الرفع نحدث القائمة
      setFiles(response.data?.data?.files || []);
      setTotalPages(response.data?.data?.totalPages || 1);
      setCurrentPage(1); // العودة للصفحة 1 لعرض الملف الجديد
      setSearchTerm(""); // إعادة تعيين البحث لعرض جميع الملفات
      dispatch(
        open({
          state: "success",
          title: response.data.message || "تم رفع الملف بنجاح",
        }),
      );
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

  const getFileIcon = (type: string) => {
    // تحويل النوع لـ Lowercase لضمان المطابقة حتى لو جاءت من السيرفر كـ PDF أو Docx
    const fileType = type.toLowerCase();

    switch (fileType) {
      // المستندات والكتب
      case "pdf":
        return <FileText className="text-red-500" />;

      // ملفات الورد (Word)
      case "doc":
      case "docx":
        return <FileText className="text-blue-600" />;

      // ملفات الإكسل (Excel)
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className="text-green-600" />;

      // العروض التقديمية (PowerPoint)
      case "ppt":
      case "pptx":
        return <Presentation className="text-orange-500" />;

      // الصور
      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
      case "gif":
        return <ImageIcon className="text-purple-500" />;

      // الملفات المضغوطة
      case "zip":
      case "rar":
      case "7z":
        return <FileBox className="text-yellow-600" />;

      // أي ملف آخر غير معروف
      default:
        return <FileIcon className="text-gray-400" />;
    }
  };

  return (
    <div className="p-4 md:p-8  min-h-screen text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold ">أرشيف الملفات الصحية</h1>
          </div>

          <div className="flex items-center gap-3">
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                console.log(searchTerm);
              }}
            >
              <Search className="absolute right-3 top-2.5" size={18} />
              <input
                type="text"
                placeholder="ابحث عن ملف..."
                className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 w-full md:w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </form>
            {(UserRole === "admin" || UserRole === "dev") && (
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
                <UploadCloud size={20} />
                <span>رفع</span>
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

        {/* Files Grid List */}
        <div className="grid grid-cols-1 gap-4">
          {files
            // .filter((f) => f.fileName.includes(searchTerm))
            .map((file) => (
              <div
                key={file._id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition flex flex-col lg:flex-row items-center justify-between gap-4"
              >
                {/* File Info Side */}
                <div
                  className="flex items-center gap-4 w-full lg:max-w-[60%] xl:max-w-[70%] flex-1"
                  title={`${file.fileName}\nحجم الملف: ${file.fileSize}\nتاريخ الرفع: ${new Date(file.createdAt).toLocaleDateString()}`}
                >
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h3 className="font-semibold text-gray-800 truncate ">
                      {file.fileName}
                    </h3>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      <span>{file.fileSize}</span>
                      <span>•</span>
                      <span>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Side */}
                <div className="flex items-center gap-2 w-full lg:min-w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 ">
                  <button
                    // onClick={() => handleViewFile()}
                    className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
                  >
                    <ExternalLink size={16} />
                    عرض
                  </button>
                  <button className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition">
                    <Download size={16} />
                    <span>تحميل</span>
                  </button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-md transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col md:flex-row items-center justify-center mt-8 pt-6 border-t border-gray-200">
          {/* أزرار التنقل */}
          <div className="flex items-center gap-2">
            {/* زر السابق */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "opacity-50 border-0 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              السابق
            </button>

            {/* أرقام الصفحات (عرض مبسط) */}
            <div className="hidden sm:flex items-center gap-1">
              {/* دالة ذكية لتحديد الأرقام التي ستظهر */}
              {(() => {
                const pages = [];
                const range = 1; // عدد الصفحات التي تظهر قبل وبعد الصفحة الحالية

                for (let i = 1; i <= totalPages; i++) {
                  // دائماً نعرض الصفحة الأولى والأخيرة والصفحة الحالية وما حولها
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= currentPage - range && i <= currentPage + range)
                  ) {
                    pages.push(i);
                  } else if (
                    i === currentPage - range - 1 ||
                    i === currentPage + range + 1
                  ) {
                    // إضافة النقاط إذا كان هناك فاصل
                    pages.push("...");
                  }
                }

                // تنظيف النقاط المتكررة (اختياري لضمان مظهر نظيف)
                return pages.map((pageNum, index) => {
                  if (pageNum === "...") {
                    return (
                      <span key={`dots-${index}`} className="px-2 ">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum as number)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
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

            {/* زر التالي */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                currentPage === totalPages
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
