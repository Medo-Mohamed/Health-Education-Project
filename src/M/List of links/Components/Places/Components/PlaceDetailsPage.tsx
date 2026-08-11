// PlaceDetailsPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Building2,
  MapPin,
  Phone,
  Plus,
  ChevronLeft,
  FolderTree,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  Trash2,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Edit,
} from "lucide-react";
import type { IPlace } from "../types";
import AxiosApi from "../../../../../AxiosApi";
import toast from "react-hot-toast";
import { AddStaffModal } from "./AddStaffModal";

// ==========================================
// 1. الواجهات والأنواع (Interfaces & Constants)
// ==========================================
export const PlacePermission = {
  CREATE_SUB_PLACE: "place:create_sub",
  EDIT_PLACE_INFO: "place:edit_info",
  DELETE_PLACE: "place:delete",
  MANAGE_MEMBERS: "place:manage_members",
  VIEW_MEMBERS: "place:view_members",
  CREATE_EVENT: "place:create_event",
  EDIT_EVENT: "place:edit_event",
  DELETE_EVENT: "place:delete_event",
  VIEW_PLACE: "place:view",
  UPLOAD_MEDIA: "place:upload_media",
} as const;

export type PlacePermissionType =
  (typeof PlacePermission)[keyof typeof PlacePermission];

interface PlaceDetailsResponse {
  place: IPlace;
  permissions?: string[] | string[][];
  ancestorsPath?: IPlace[];
  subPlaces?: IPlace[];
}

interface StaffUser {
  _id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  avatar_url?: string;
}

interface StaffItem {
  _id: string; // accessId
  user: StaffUser;
  role: string;
  is_direct: boolean;
  granted_by?: string;
  custom_permissions?: string[];
  created_at: string;
}

export const PlaceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // جلب بيانات المستخدم الحالي
  const currentUser = useSelector((state: any) => state.User?.data?.user);

  // حالات الصفحة الرئيسية
  const [place, setPlace] = useState<IPlace | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [ancestorsPath, setAncestorsPath] = useState<IPlace[]>([]);
  const [subPlaces, setSubPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // حالة التبويب النشط (تبويبان فقط الآن)
  const [activeTab, setActiveTab] = useState<"overview" | "staff">("overview");

  // حالات إدارة الموظفين
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // دالة المساعَدة لفحص امتلاك الصلاحية
  // ---------------------------------------------------------------------------

  const handleStaffAdded = () => {
    // إشعار أو تحديث قائمة الموظفين في الصفحة
    // console.log("تم تحديث قائمة الموظفين!");
    fetchStaffList();
  };
  const hasPermission = useCallback(
    (perm: PlacePermissionType): boolean => {
      if (currentUser?.role === "dev") return true;
      return userPermissions.includes(perm);
    },
    [userPermissions, currentUser],
  );

  const handelPlaceInformations = useCallback(async () => {
    setLoading(true);
    setError(null);

    AxiosApi.get<PlaceDetailsResponse>(`/auth/withlogin/places/place-manage/${id}`)
      .then((res) => {
        const data = res.data;

        if (data.permissions) {
          const rawPerms = data.permissions;
          const flatPerms: string[] = Array.isArray(rawPerms)
            ? rawPerms.flat().map((p) => String(p))
            : [];
          setUserPermissions(flatPerms);
        } else {
          setUserPermissions([]);
        }

        if (data.place) {
          setPlace(data.place);
          setAncestorsPath(data.ancestorsPath || []);
          setSubPlaces(data.subPlaces || []);
        } else {
          setPlace(data as unknown as IPlace);
        }
      })
      .catch((err: any) => {
        console.error("خطأ أثناء جلب تفاصيل المكان:", err);
        setError(
          err.response?.data?.message || "حدث خطأ أثناء تحميل تفاصيل المكان.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // ---------------------------------------------------------------------------
  // جلب بيانات المكان
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    void Promise.resolve().then(handelPlaceInformations);
  }, [id, handelPlaceInformations]);

  // ---------------------------------------------------------------------------
  // جلب موظفي المكان
  // ---------------------------------------------------------------------------
  const fetchStaffList = useCallback(async () => {
    if (!id) return;
    setStaffLoading(true);
    AxiosApi.get(`/auth/withlogin/places/place-staff/place-staff/${id}/staff`)
      .then((res) => {
        setStaffList(res.data.staff || []);
      })
      .catch((err: any) => {
        if (err.response?.status === 403) {
          toast.error("ليس لديك صلاحية لعرض موظفي هذا المكان.");
        } else {
          console.error("خطأ أثناء جلب موظفي المكان:", err);
        }
        setStaffList([]);
      })
      .finally(() => {
        setStaffLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (
      activeTab === "staff" &&
      id &&
      (hasPermission(PlacePermission.VIEW_MEMBERS) ||
        hasPermission(PlacePermission.MANAGE_MEMBERS))
    ) {
      // avoid calling setState synchronously inside effect body
      // schedule fetchStaffList asynchronously to prevent cascading renders
      void Promise.resolve().then(() => fetchStaffList());
    }
  }, [activeTab, id, fetchStaffList, hasPermission]);

  // ---------------------------------------------------------------------------
  // سياق إجراءات تعديل وحذف المكان نفسه (Action Context Handlers)
  // ---------------------------------------------------------------------------
  const handleEditPlace = () => {
    if (!id) return;
    // يتم وضع التوجيه أو فتح نافذة التعديل الخاصة بالمكان هنا
    navigate(`/listlinks/places/edit/${id}`);
  };

  const handleDeletePlace = async () => {
    if (!id || !place) return;
    if (
      !window.confirm(
        `هل أنت تأكد من إزالة وحذف المكان "${place.name}" بشكل نهائي؟`,
      )
    ) {
      return;
    }

    try {
      await AxiosApi.delete(`/auth/withlogin/places/${id}`);
      toast.success("تم حذف المكان بنجاح");
      navigate("/listlinks/places");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل حذف المكان.");
    }
  };

  // ---------------------------------------------------------------------------
  // حذف موظف من المكان
  // ---------------------------------------------------------------------------
  const handleRemoveStaff = async (accessId: string) => {
    if (!window.confirm("هل أنت تأكد من إزالة هذا الموظف من المكان؟")) return;

    try {
      // console.log("حذف موظف بالمعرف:", accessId);
      await AxiosApi.delete(
        `/auth/withlogin/places/place-staff/place-staff-access/${accessId}/${id}`,
      );
      toast.success("تم إزالة الموظف بنجاح");
      fetchStaffList();
    } catch (err: any) {
      console.log(err.response);
      toast.error(err.response?.data?.message || "فشل إزالة الموظف من المكان.");
    }
  };

  const getPlaceTypeLabel = (type: string) => {
    switch (type) {
      case "administrative":
        return {
          label: "إداري (إشراف ومتابعة)",
          bg: "bg-purple-100 text-purple-700 border-purple-200",
        };
      case "operational":
        return {
          label: "عملي (ميداني)",
          bg: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "external_location":
        return {
          label: "خارجي (فعاليات)",
          bg: "bg-amber-100 text-amber-700 border-amber-200",
        };
      default:
        return { label: type, bg: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

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

  const typeInfo = getPlaceTypeLabel(place.type);

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. شريط التنقل الهرمي (Breadcrumbs) */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 bg-white p-3.5 border rounded-xl shadow-sm overflow-x-auto flex-wrap">
        <Link
          to="/listlinks/places"
          className="hover:text-blue-600 transition flex items-center gap-1 font-medium shrink-0"
        >
          <FolderTree className="w-4 h-4 text-gray-400" />
          <span>الأماكن</span>
        </Link>

        {ancestorsPath.map((ancestor) => (
          <React.Fragment key={ancestor._id}>
            <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
            <Link
              to={`/listlinks/places/place-details-page/${ancestor._id}`}
              className="hover:text-blue-600 transition truncate max-w-30 font-medium"
            >
              {ancestor.name}
            </Link>
          </React.Fragment>
        ))}

        <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="font-bold text-gray-900 truncate max-w-30">
          {place.name}
        </span>
      </nav>

      {/* 2. الهيدر الرئيسي للمكان وأزرار التحكم بالتعيين والتعديل/الحذف للمكان نفسه */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
          <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
            {place.metadata?.photo_url ? (
              <img
                src={place.metadata.photo_url}
                alt={place.name}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h1 className="text-2xl font-bold text-gray-900">
                  {place.name}
                </h1>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${typeInfo.bg}`}
                >
                  {typeInfo.label}
                </span>
              </div>
              {/* <p className="text-xs text-gray-400">
                المعرف الوحيد: <span className="font-mono">{place._id}</span>
              </p> */}
            </div>
          </div>

          {/* أزرار الإدارة التابعة للمكان بناءً على الصلاحيات */}
          <div className="flex items-center justify-center gap-2 flex-wrap self-start md:self-auto">
            {/* زر إضافة مكان فرعي */}
            {hasPermission(PlacePermission.CREATE_SUB_PLACE) && (
              <button
                onClick={() =>
                  navigate(`/listlinks/places/create/${place._id}`)
                }
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مكان فرعي</span>
              </button>
            )}

            {/* زر تعديل بيانات المكان */}
            {hasPermission(PlacePermission.EDIT_PLACE_INFO) && (
              <button
                onClick={handleEditPlace}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-300 transition"
                title="تعديل بيانات المكان الحالي"
              >
                <Edit className="w-4 h-4 text-gray-600" />
                <span>تعديل المكان</span>
              </button>
            )}

            {/* زر حذف المكان */}
            {hasPermission(PlacePermission.DELETE_PLACE) && (
              <button
                onClick={handleDeletePlace}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition"
                title="حذف المكان بشكل نهائي"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>حذف المكان</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. شريط التبويبات (Overview / Staff) */}
        <div className="flex border-b border-gray-200 mt-6 -mb-6 overflow-x-auto flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>نظرة عامة والتفاصيل</span>
          </button>

          {(hasPermission(PlacePermission.VIEW_MEMBERS) ||
            hasPermission(PlacePermission.MANAGE_MEMBERS)) && (
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === "staff"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>طاقم العمل والموظفين</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. تبويب النظرة العامة (Overview Tab) */}
      {/* ==================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b">
              البيانات التفصيلية للمكان
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3 p-3.5 bg-gray-50 border rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    وصف المكان
                  </span>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {place.metadata?.description ||
                      "لا يوجد وصف مدون لهذا المكان."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50 border rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    العنوان والموقع التفصيلي
                  </span>
                  <p className="text-sm text-gray-800">
                    {place.metadata?.address_details || "لم يتم تحديد العنوان."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50 border rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    أرقام التواصل
                  </span>
                  {place.metadata?.phone_numbers &&
                  place.metadata.phone_numbers.length > 0 ? (
                    <div className="flex flex-col gap-1 dir-ltr text-right">
                      {place.metadata.phone_numbers.map((phone, i) => (
                        <span
                          key={i}
                          className="text-sm font-medium text-gray-800 font-mono"
                        >
                          {phone}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">لا توجد أرقام مسجلة</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-gray-900">
                  الأماكن الفرعية التابعة
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                  {subPlaces.length}
                </span>
              </div>
            </div>

            {subPlaces.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  لا توجد أي أماكن فرعية مضافة حتى الآن تحت هذا المكان.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subPlaces.map((sub) => {
                  const subType = getPlaceTypeLabel(sub.type);
                  return (
                    <div
                      key={sub._id}
                      onClick={() =>
                        navigate(
                          `/listlinks/places/place-details-page/${sub._id}`,
                        )
                      }
                      className="p-4 border rounded-xl hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        {sub.metadata?.photo_url ? (
                          <img
                            src={sub.metadata.photo_url}
                            alt={sub.name}
                            className="w-10 h-10 object-cover rounded-lg border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition">
                            {sub.name}
                          </h4>
                          <span className="text-[11px] font-medium text-gray-500 block mt-0.5">
                            {subType.label}
                          </span>
                        </div>
                      </div>

                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition shrink-0 self-center" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. تبويب إدارة الموظفين (Staff Tab) */}
      {/* ==================================================================== */}
      {activeTab === "staff" && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6 dir-rtl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>إدارة موظفي المكان والصلاحيات</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                استعراض وتعيين الموظفين المباشرين، والمشرفين الموروثين من المكان
                الأعلى
              </p>
            </div>

            {/* عند إضافة موظف جديد يتم التوجيه لصفحة التعيين والإدارة المستقلة */}
            {hasPermission(PlacePermission.MANAGE_MEMBERS) && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  + إضافة موظف جديد
                </button>

                <AddStaffModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  placeId={id || ""}
                  onStaffAdded={handleStaffAdded}
                />
              </>
            )}
          </div>

          {staffLoading ? (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-medium">
                جاري تحميل قائمة الموظفين...
              </span>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">
                لا يوجد موظفون مضافون في هذا المكان حالياً.
              </p>
              {hasPermission(PlacePermission.MANAGE_MEMBERS) && (
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  اضغط على زر "تعيين موظف جديد" لربط وتحديد صلاحيات أول موظف
                  لهذا المكان.
                </p>
              )}
            </div>
          ) : (
            <div className="border border-gray-200/70 rounded-2xl overflow-hidden bg-white">
              {/* ----------------- 1. عرض الجدول (للشاشات المتوسطة والكبيرة md فأكبر) ----------------- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50/80 text-gray-700 border-b font-bold">
                    <tr>
                      <th className="p-3.5">الموظف</th>
                      <th className="p-3.5">الدور الوظيفي</th>
                      <th className="p-3.5">نوع التعيين</th>
                      <th className="p-3.5 text-center">الصلاحيات المخصصة</th>
                      {hasPermission(PlacePermission.MANAGE_MEMBERS) && (
                        <th className="p-3.5 text-center">الإجراءات</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {staffList.map((item: StaffItem) => {
                      const userName =
                        item.user?.first_name || item.user?.last_name
                          ? `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim()
                          : item.user?.name || "مستخدم غير معرف";

                      const roleLabels: Record<string, string> = {
                        place_admin: "مدير المكان (Admin)",
                        place_supervisor: "مشرف تشغيلي (Supervisor)",
                        place_operator: "عضو ميداني / مشغل (Operator)",
                        place_viewer: "مشاهد فقط (Viewer)",
                      };

                      const roleLabel = roleLabels[item.role] || item.role;

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50/80 transition"
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {item.user?.avatar_url ? (
                                <img
                                  src={item.user.avatar_url}
                                  alt={userName}
                                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {userName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                  <span>{userName}</span>
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  {item.user?.email || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                              {roleLabel}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {item.is_direct !== false ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>مباشر على المكان</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>موروث من مكان أعلى</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            {item.custom_permissions &&
                            item.custom_permissions.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                                {item.custom_permissions.length} إضافية
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400">
                                افتراضية
                              </span>
                            )}
                          </td>

                          {hasPermission(PlacePermission.MANAGE_MEMBERS) && (
                            <td className="p-3.5 text-center">
                              {item.is_direct !== false ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/listlinks/places/${id}/staff/${item.user._id}/permissions`,
                                      )
                                    }
                                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition flex items-center gap-1"
                                    title="انتقال لصفحة تعديل الصلاحيات"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>تعديل الصلاحيات</span>
                                  </button>

                                  <button
                                    onClick={() => handleRemoveStaff(item._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="إزالة الموظف من هذا المكان"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                  إدارة من المكان الرئيسي
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ----------------- 2. عرض البطاقات الموبايل (للشاشات الصغيرة الأصغر من md) ----------------- */}
              <div className="block md:hidden divide-y divide-gray-100">
                {staffList.map((item: StaffItem) => {
                  const userName =
                    item.user?.first_name || item.user?.last_name
                      ? `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim()
                      : item.user?.name || "مستخدم غير معرف";

                  const roleLabels: Record<string, string> = {
                    place_admin: "مدير المكان (Admin)",
                    place_supervisor: "مشرف تشغيلي (Supervisor)",
                    place_operator: "عضو ميداني / مشغل (Operator)",
                    place_viewer: "مشاهد فقط (Viewer)",
                  };

                  const roleLabel = roleLabels[item.role] || item.role;

                  return (
                    <div key={item._id} className="p-4 space-y-3 bg-white">
                      {/* Header: الموظف ومعلوماته */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.user?.avatar_url ? (
                            <img
                              src={item.user.avatar_url}
                              alt={userName}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {userName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-sm truncate">
                              {userName}
                            </div>
                            <div className="text-xs text-gray-500 font-mono truncate">
                              {item.user?.email || "—"}
                            </div>
                          </div>
                        </div>

                        {/* الصلاحيات المخصصة */}
                        <div>
                          {item.custom_permissions &&
                          item.custom_permissions.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                              {item.custom_permissions.length} إضافية
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              افتراضية
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body: الدور ونوع التعيين */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-50">
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                          {roleLabel}
                        </span>

                        {item.is_direct !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-bold">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>مباشر</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-bold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>موروث</span>
                          </span>
                        )}
                      </div>

                      {/* Footer: الإجراءات (عند وجود صلاحية MANAGE_MEMBERS) */}
                      {hasPermission(PlacePermission.MANAGE_MEMBERS) && (
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-50">
                          {item.is_direct !== false ? (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/listlinks/places/${id}/staff/${item.user._id}/permissions`,
                                  )
                                }
                                className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition flex items-center justify-center gap-1.5"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span>تعديل الصلاحيات</span>
                              </button>

                              <button
                                onClick={() => handleRemoveStaff(item._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 bg-red-50/50 rounded-lg border border-red-100 transition"
                                title="إزالة الموظف من هذا المكان"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic w-full text-center">
                              إدارة من المكان الرئيسي
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
