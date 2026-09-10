// PlaceLayout.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, NavLink, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Building2,
  ChevronLeft,
  FolderTree,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
} from "lucide-react";
import { PlacePermission, type IPlace, type IPlacePermission } from "../types";
import AxiosApi from "../../../../../AxiosApi";
import {
  setPlacePermissions,
  setPermissionsLoading,
  clearPlacePermissions,
} from "../../../../Redux-Store/PlacePermissions/placePermissionsSlice";

interface PlaceDetailsResponse {
  place: IPlace;
  permissions?: string[] | string[][];
  ancestorsPath?: IPlace[];
  subPlaces?: IPlace[];
  userRole?: string;
}

export const PlaceLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: any) => state.User?.data?.user);

  const [place, setPlace] = useState<IPlace | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [ancestorsPath, setAncestorsPath] = useState<IPlace[]>([]);
  const [subPlaces, setSubPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = useCallback(
    (perm: IPlacePermission): boolean => {
      if (currentUser?.role === "dev") return true;
      return userPermissions.includes(perm);
    },
    [userPermissions, currentUser],
  );

  const fetchPlaceData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    dispatch(setPermissionsLoading(true));

    try {
      const res = await AxiosApi.get<PlaceDetailsResponse>(
        `/auth/withlogin/places/place-manage/${id}`,
      );
      const data = res.data;

      let flatPerms: string[] = [];
      if (data.permissions) {
        const rawPerms = data.permissions;
        flatPerms = Array.isArray(rawPerms)
          ? rawPerms.flat().map((p) => String(p))
          : [];
        setUserPermissions(flatPerms);
      } else {
        setUserPermissions([]);
      }
      // console.log("الصلاحيات المستلمة من الخادم:", data);
      // 📌 حفظ وتخزين البيانات والصلاحيات داخل Redux Store
      dispatch(
        setPlacePermissions({
          placeId: id,
          permissions: flatPerms,
          isDev: currentUser?.role === "dev",
          role: data.userRole || "",
        }),
      );

      if (data.place) {
        setPlace(data.place);
        setAncestorsPath(data.ancestorsPath || []);
        setSubPlaces(data.subPlaces || []);
      } else {
        setPlace(data as unknown as IPlace);
      }
    } catch (err: any) {
      console.error("خطأ أثناء جلب تفاصيل المكان:", err);
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل تفاصيل المكان.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, dispatch, currentUser]);

  useEffect(() => {
    fetchPlaceData();

    // 🧹 تفريغ صلاحيات المكان من Redux عند مغادرة المكون
    return () => {
      dispatch(clearPlacePermissions());
    };
  }, [fetchPlaceData, dispatch]);

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-sm font-medium">جاري تحميل تفاصيل المكان...</span>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="m-6 p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-6 h-6 shrink-0 text-red-600" />
        <div>
          <h3 className="font-bold text-base mb-1">تعذر تحميل الصفحة</h3>
          <p className="text-sm">{error || "المكان المطلوب غير موجود."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* 📌 الجزء الثابت العلوي: Breadcrumbs + Tabs */}
      <div className="bg-gray-50/95 pt-2 pb-2 space-y-1 rounded">
        {/* 1. شريط التنقل الهرمي (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-600 border-b border-dashed border-b-2 p-3 overflow-x-auto">
          <NavLink
            to="/listlinks/places"
            className="hover:text-blue-600 transition flex items-center gap-1 font-medium shrink-0"
          >
            <FolderTree className="w-4 h-4 text-gray-400" />
            <span>الأماكن</span>
          </NavLink>

          {ancestorsPath.map((ancestor) => (
            <React.Fragment key={ancestor._id}>
              <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
              <NavLink
                to={`/listlinks/places/place-layout/${ancestor._id}`}
                className="hover:text-blue-600 transition truncate max-w-[120px] font-medium"
              >
                {ancestor.name}
              </NavLink>
            </React.Fragment>
          ))}

          <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-bold text-gray-900 truncate max-w-[150px]">
            {place.name}
          </span>
        </nav>

        {/* 2. شريط التبويبات التنقلي */}
        <div className="p-1.5">
          <div className="flex items-center gap-2 overflow-x-auto justify-start md:justify-center">
            <NavLink
              to=""
              end
              className={({ isActive }) =>
                `flex items-center gap-2 py-2.5 px-5 font-semibold text-sm rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              <span>نظرة عامة والتفاصيل</span>
            </NavLink>

            {(hasPermission(PlacePermission.VIEW_MEMBERS) ||
              hasPermission(PlacePermission.MANAGE_MEMBERS)) && (
              <NavLink
                to="staff"
                className={({ isActive }) =>
                  `flex items-center gap-2 py-2.5 px-5 font-semibold text-sm rounded-lg transition whitespace-nowrap ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span>طاقم العمل والموظفين</span>
              </NavLink>
            )}

            <NavLink
              to="work-section"
              className={({ isActive }) =>
                `flex items-center gap-2 py-2.5 px-5 font-semibold text-sm rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`
              }
            >
              <Calendar className="w-4 h-4" />
              <span>الندوات وفعاليات المكان</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* 🔄 المحتوى المتغير لتبويبات الصفحة */}
      <Outlet
        context={{
          place,
          userPermissions,
          subPlaces,
          hasPermission,
          fetchPlaceData,
        }}
      />
    </div>
  );
};
