import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  Activity,
  MapPin,
  ArrowLeft,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  Filter,
} from "lucide-react";
import type { IPlace, PlaceType } from "../types";
import type { AppDispatch, RootState } from "../../../../../store";
import { loading, open, close } from "../../../../Redux-Store/SuccessFaildState/SFS";
import AxiosApi from "../../../../../AxiosApi"; // تأكد من مسار AxiosApi لديك

interface PlacesResponse {
  places: IPlace[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const MyPlacesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // قراءة القيم الحالية من الـ Query Params مع تعيين قيم افتراضية
  const searchFromUrl = searchParams.get("search") || "";
  const scopeFromUrl =
    (searchParams.get("scope") as "direct" | "all") || "direct";
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [places, setPlaces] = useState<IPlace[]>([]);

  // حالة المدخل المؤقت للبحث
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // جلب بيانات المستخدم من Redux State
  const User = useSelector((state: RootState) => state.User.data?.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // مزامنة حالة حقل المدخلات إذا تغير الـ URL من الخارج
  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  // دالة جلب البيانات من السيرفر باستخدام Query Params
  const fetchPlaces = useCallback(async () => {
    if (!User?._id) return;

    dispatch(loading());
    try {
      const response = await AxiosApi.get<PlacesResponse>(
        "/auth/withlogin/places/my-places",
        {
          params: {
            search: searchFromUrl,
            scope: scopeFromUrl,
            page: pageFromUrl,
            limit: 9, // عرض 9 أماكن في كل صفحة (شبكة 3x3)
          },
        },
      );

      setPlaces(response.data.places || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      dispatch(close());
    } catch (error) {
      console.error("خطأ أثناء جلب الأماكن:", error);
      dispatch(
        open({
          state: "faild",
          title: "حدث خطأ أثناء جلب الأماكن.",
        }),
      );
    }
  }, [User?._id, searchFromUrl, scopeFromUrl, pageFromUrl, dispatch]);

  // تنفيذ طلب الجلب عند تغيير الـ URL Params
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // تحديث الـ URL عند تغير البحث مع Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchFromUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (searchTerm.trim()) {
            newParams.set("search", searchTerm);
          } else {
            newParams.delete("search");
          }
          newParams.set("page", "1"); // العودة للصفحة الأولى عند البحث
          return newParams;
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchFromUrl, setSearchParams]);

  // العودة للصفحة الأولى عند تغيير نطاق الصلاحية
  const handleScopeChange = (newScope: "direct" | "all") => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("scope", newScope);
      newParams.set("page", "1");
      return newParams;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

  const getTypeBadge = (type: PlaceType) => {
    switch (type) {
      case "administrative":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <Building2 className="w-3.5 h-3.5" /> إداري (إشراف)
          </span>
        );
      case "operational":
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <Activity className="w-3.5 h-3.5" /> عملي (ميداني)
          </span>
        );
      case "external_location":
        return (
          <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5" /> خارجي (تنسيقي)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto dir-rtl" dir="rtl">
      {/* 1. الهيدر وزر الإنشاء */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            الأماكن المسندة إليك
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            أهلاً {User?.first_name || ""}، يمكنك إدارة وتصفح الأماكن التي تملك
            صلاحيات عليها.
          </p>
        </div>

        {User?.role === "dev" && (
          <button
            onClick={() => navigate("/listlinks/places/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> إنشاء مكان جديد
          </button>
        )}
      </div>

      {/* 2. شريط البحث والفلترة والـ Scope Toggle */}
      <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* مربع البحث بالاسم */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ابحث باسم المكان..."
            className="w-full pr-9 pl-4 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* زر مفتاح التبديل (Direct vs All) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> النطاق:
          </span>
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <button
              onClick={() => handleScopeChange("direct")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scopeFromUrl === "direct"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              المباشرة فقط (الافتراضي)
            </button>
            <button
              onClick={() => handleScopeChange("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scopeFromUrl === "all"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              إظهار الكل (المباشرة والفرعية)
            </button>
          </div>
        </div>
      </div>

      {/* 3. عرض البطاقات أو رسائل التحميل/الفراغ */}
      {places.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-xl p-12 text-center text-gray-500">
          {searchFromUrl
            ? "لا توجد نتائج تطابق بحثك الحالي."
            : "لا توجد أماكن مسندة إليك ضمن هذا النطاق."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div
                key={place._id}
                onClick={() =>
                  navigate(`/listlinks/places/place-layout/${place._id}`)
                }
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">
                      {place.name}
                    </h3>
                    {getTypeBadge(place.type)}
                  </div>
                  {place.metadata?.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {place.metadata.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t flex justify-between items-center text-blue-600 text-sm font-medium">
                  <span>عرض التفاصيل والتعليمات</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* 4. الـ Pagination (عناصر التصفح) */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t pt-4 flex-col md:flex-row gap-4 md:gap-0">
              <span className="text-xs text-gray-500">
                إجمالي الأماكن: {totalCount} | الصفحة {pageFromUrl} من{" "}
                {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pageFromUrl === 1}
                  onClick={() => handlePageChange(Math.max(pageFromUrl - 1, 1))}
                  className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-3 text-gray-700">
                  {pageFromUrl} / {totalPages}
                </span>
                <button
                  disabled={pageFromUrl === totalPages}
                  onClick={() =>
                    handlePageChange(Math.min(pageFromUrl + 1, totalPages))
                  }
                  className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};