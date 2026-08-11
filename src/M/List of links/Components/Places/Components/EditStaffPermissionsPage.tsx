import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosApi from "../../../../../AxiosApi";
import { toast } from "react-hot-toast";
import {
  Save,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  GitFork,
} from "lucide-react";

// ==========================================
// 1. التعريفات المطبقة على السيرفر
// ==========================================

export const PlaceRole = {
  ADMIN: "place_admin",
  SUPERVISOR: "place_supervisor",
  OPERATOR: "place_operator",
  VIEWER: "place_viewer",
} as const;

export type PlaceRole = (typeof PlaceRole)[keyof typeof PlaceRole];

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

export type PlacePermission =
  (typeof PlacePermission)[keyof typeof PlacePermission];

// خريطة الصلاحيات الافتراضية لكل دور
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_ROLE_PERMISSIONS: Record<PlaceRole, PlacePermission[]> = {
  [PlaceRole.ADMIN]: [
    PlacePermission.CREATE_SUB_PLACE,
    PlacePermission.EDIT_PLACE_INFO,
    PlacePermission.DELETE_PLACE,
    PlacePermission.MANAGE_MEMBERS,
    PlacePermission.VIEW_MEMBERS,
    PlacePermission.CREATE_EVENT,
    PlacePermission.EDIT_EVENT,
    PlacePermission.DELETE_EVENT,
    PlacePermission.VIEW_PLACE,
    PlacePermission.UPLOAD_MEDIA,
  ],
  [PlaceRole.SUPERVISOR]: [
    PlacePermission.EDIT_PLACE_INFO,
    PlacePermission.VIEW_MEMBERS,
    PlacePermission.CREATE_EVENT,
    PlacePermission.EDIT_EVENT,
    PlacePermission.VIEW_PLACE,
    PlacePermission.UPLOAD_MEDIA,
  ],
  [PlaceRole.OPERATOR]: [
    PlacePermission.CREATE_EVENT,
    PlacePermission.VIEW_PLACE,
    PlacePermission.UPLOAD_MEDIA,
  ],
  [PlaceRole.VIEWER]: [PlacePermission.VIEW_PLACE],
};

// تفاصيل وسياق كل صلاحية للعرض في الشاشة باللغة العربية
const PERMISSION_DETAILS: Record<
  PlacePermission,
  { title: string; description: string }
> = {
  [PlacePermission.CREATE_SUB_PLACE]: {
    title: "إضافة أماكن فرعية",
    description: "السماح بإعادة تقسيم المكان وإنشاء أماكن أو قطاعات تابعة.",
  },
  [PlacePermission.EDIT_PLACE_INFO]: {
    title: "تعديل بيانات المكان",
    description: "تعديل الاسم، المكان الجغرافي، والمعلومات الوصفية للمكان.",
  },
  [PlacePermission.DELETE_PLACE]: {
    title: "حذف المكان",
    description: "صلاحية حساسة للغاية: إمكانية حذف المكان بشكل كامل نهائياً.",
  },
  [PlacePermission.MANAGE_MEMBERS]: {
    title: "إدارة الأعضاء والموظفين",
    description: "تعيين وإزالة موظفين وتعديل أدوارهم الوظيفية داخل المكان.",
  },
  [PlacePermission.VIEW_MEMBERS]: {
    title: "عرض قائمة الأعضاء",
    description: "الاطلاع على طاقم العمل والموظفين المعينين في هذا المكان.",
  },
  [PlacePermission.CREATE_EVENT]: {
    title: "إنشاء الفعاليات والندوات",
    description: "تسجيل ندوة جديدة أو أنشطة ميدانية داخل نطاق المكان.",
  },
  [PlacePermission.EDIT_EVENT]: {
    title: "تعديل الفعاليات",
    description: "تحديث تفاصيل الفعاليات المقامة وبيانات الحضور.",
  },
  [PlacePermission.DELETE_EVENT]: {
    title: "حذف الفعاليات",
    description: "إلغاء وحذف الفعاليات والأنشطة الميدانية الموثقة.",
  },
  [PlacePermission.VIEW_PLACE]: {
    title: "استعراض المكان",
    description: "الاطلاع على المكان والأنشطة الخاصة به (الصلاحية الأساسية).",
  },
  [PlacePermission.UPLOAD_MEDIA]: {
    title: "رفع التوثيق والوسائط",
    description: "إرفاق الصور والمستندات والوسائط التوثيقية بالأنشطة.",
  },
};

// الأدوار وعناوينها
const ROLES_LIST = [
  {
    id: PlaceRole.ADMIN,
    label: "مدير المكان (Admin)",
    desc: "صلاحيات كاملة تشمل حذف وإنشاء الفروع وإدارة الأعضاء.",
  },
  {
    id: PlaceRole.SUPERVISOR,
    label: "مشرف تشغيلي (Supervisor)",
    desc: "إدارة الفعاليات وتحديث بيانات المكان والوسائط.",
  },
  {
    id: PlaceRole.OPERATOR,
    label: "عضو ميداني (Operator)",
    desc: "تسجيل الندوات، إقامة الفعاليات، ورفع التوثيق.",
  },
  {
    id: PlaceRole.VIEWER,
    label: "مشاهد فقط (Viewer)",
    desc: "الاطلاع واستعراض بيانات المكان والأنشطة فقط.",
  },
];

interface StaffInfo {
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
}

// ==========================================
// 2. المكون الرئيسي للصفحة EditStaffPermissionsPage
// ==========================================

const EditStaffPermissionsPage: React.FC = () => {
  const { placeId, userId } = useParams<{ placeId: string; userId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState<PlaceRole>(
    PlaceRole.OPERATOR,
  );
  const [customPermissions, setCustomPermissions] = useState<PlacePermission[]>(
    [],
  );
  const [inheritToChildren, setInheritToChildren] = useState<boolean>(true);

  // 1. جلب البيانات الحقيقية من السيرفر عند التحميل
  useEffect(() => {
    // console.log("جلب بيانات الصلاحيات للموظف:", { placeId, userId });
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        // console.log("بيانات الصلاحيات المسترجعة من السيرفر:");
        const response = await AxiosApi.get(
          `/auth/withlogin/places/place-staff/place-staff-permissions/${userId}/${placeId}/permissions`,
        );
        // console.log(response.data?.data); // عرض البيانات المسترجعة في وحدة التحكم
        // console.log("جلب بيانات الصلاحيات للموظف:", { placeId, userId });

        if (response.data.success) {
          const { staff_info, role, custom_permissions, inherit_to_children } =
            response.data.data;

          setStaffInfo(staff_info);
          setSelectedRole(role);
          setCustomPermissions(custom_permissions || []);
          setInheritToChildren(inherit_to_children ?? true);
        }
      } catch (error: any) {
        console.error("خطأ في جلب بيانات الصلاحيات:", error);
        toast.error(
          error.response?.data?.message ||
            "تعذر جلب بيانات الصلاحيات من السيرفر",
        );
      } finally {
        setLoading(false);
      }
    };

    if (placeId && userId) {
      fetchStaffData();
    }
  }, [placeId, userId]);

  // الصلاحيات التلقائية القادمة مع الدور المختار
  const defaultPermsForRole = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];

  // دالة تبديل الصلاحيات المخصصة (إضافة/إزالة استثناء)
  const toggleCustomPermission = (perm: PlacePermission) => {
    if (defaultPermsForRole.includes(perm)) return;

    setCustomPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  // دالة الحفظ وإرسال التحديثات للسيرفر
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        role: selectedRole,
        custom_permissions: customPermissions,
        inherit_to_children: inheritToChildren,
      };

      // console.log("إرسال بيانات الصلاحيات المحدثة للسيرفر:", payload);

      const response = await AxiosApi.put(
        `/auth/withlogin/places/place-staff/place-staff-access/${userId}/${placeId}/permissions`,
        payload,
      );

      if (response.data.success) {
        toast.success(response.data.message || "تم حفظ التعديلات بنجاح");
        navigate(-1);
      }
    } catch (error: any) {
      console.error("خطأ أثناء حفظ الصلاحيات:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حفظ التعديلات",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-500 font-medium text-sm">
          جاري جلب إعدادات الصلاحيات من السيرفر...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 dir-rtl" dir="rtl">
      {/* الهيدر وزر الحفظ والعودة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span>إدارة صلاحيات الموظف</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              تحديد الدور الوظيفي الأساسي والصلاحيات الاستثنائية وتوريث الفروع
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-sm disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>حفظ التعديلات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الجانبي: بطاقة بيانات الموظف والإرشادات */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm text-center">
            {staffInfo?.avatar_url ? (
              <img
                src={staffInfo.avatar_url}
                alt="User Avatar"
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-50 shadow-inner"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
                {staffInfo?.first_name?.charAt(0) || "U"}
              </div>
            )}
            <h2 className="text-base font-bold text-gray-900 mt-2">
              {staffInfo?.first_name} {staffInfo?.last_name}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {staffInfo?.email}
            </p>
          </div>

          {/* تفعيل / تعطيل التوارث للأماكن التابعة */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-900">
                  توارث الصلاحية للفروع
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInheritToChildren(!inheritToChildren)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  inheritToChildren ? "bg-purple-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    inheritToChildren ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              عند التفعيل، سيرث الموظف نفس هذه الصلاحيات تلقائياً على جميع
              الأماكن والقطاعات التابعة لهذا المكان.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h4 className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>كيف تعمل الصلاحيات؟</span>
            </h4>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              الدور الأساسي يمنح الموظف حزمة صلاحيات جاهزة. يمكنك تفعيل صلاحيات
              إضافية بالأسفل لتمنحه استثناءات حساسة (Custom Permissions).
            </p>
          </div>
        </div>

        {/* العمود الرئيسي: تحديد الدور والصلاحيات التفصيلية */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. اختيار الدور الوظيفي (PlaceRole) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-3">
              الدور الوظيفي الأساسي
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES_LIST.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <label
                    key={r.id}
                    className={`flex flex-col p-3.5 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="place_role"
                        value={r.id}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedRole(r.id as PlaceRole);
                          setCustomPermissions((prev) =>
                            prev.filter(
                              (p) =>
                                !DEFAULT_ROLE_PERMISSIONS[
                                  r.id as PlaceRole
                                ].includes(p),
                            ),
                          );
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-bold text-gray-900 text-xs">
                        {r.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 pr-6 mt-1 leading-snug">
                      {r.desc}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. الصلاحيات التفصيلية (Fine-grained Permissions) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                الصلاحيات التفصيلية (Fine-grained Permissions)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                الصلاحيات باللون الأخضر مفعّلة تلقائياً حسب الدور المختار، بينما
                يتاح لك تفعيل صلاحيات مخصصة باللون الأزرق.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {Object.entries(PlacePermission).map(([, permCode]) => {
                const isDefault = defaultPermsForRole.includes(permCode);
                const isCustom = customPermissions.includes(permCode);
                const permMeta = PERMISSION_DETAILS[permCode];

                return (
                  <div
                    key={permCode}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isDefault
                        ? "bg-emerald-50/50 border-emerald-200/70"
                        : isCustom
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="pl-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {permMeta?.title || permCode}
                        </span>
                        {/* <code className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          {permCode}
                        </code> */}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {permMeta?.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isDefault ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>أساسية بالدور</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleCustomPermission(permCode)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            isCustom ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isCustom ? "-translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStaffPermissionsPage;
