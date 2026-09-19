import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosApi from "../../../../../../AxiosApi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../../store";
import {
  loading,
  open,
  close,
} from "../../../../../Redux-Store/SuccessFaildState/SFS";
import {
  Save,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  GitFork,
  Clock,
  Calendar,
} from "lucide-react";
import {
  DEFAULT_ROLE_PERMISSIONS,
  PlacePermission,
  PlaceRole,
  ROLES_LIST,
  type IPlacePermission,
  type IPlaceRole,
} from "../../types";
import { usePlacePermissions } from "../../../../../Redux-Store/PlacePermissions/usePlacePermissions";

// تفاصيل وسياق كل صلاحية للعرض في الشاشة باللغة العربية
const PERMISSION_DETAILS: Record<
  IPlacePermission,
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
  [PlacePermission.CREATE_PLAN]: {
    title: "إنشاء الخطط التشغيلية",
    description: "صلاحية إضافة وتصميم مسودة خطة مستهدفة جديدة للمكان.",
  },
  [PlacePermission.EDIT_PLAN]: {
    title: "تعديل الخطط التشغيلية",
    description: "إمكانية تحديث وتغيير أهداف ومراحل المسودات والخطط المفتوحة.",
  },
  [PlacePermission.DELETE_PLAN]: {
    title: "حذف الخطط التشغيلية",
    description:
      "إلغاء وحذف مسودات الخطط التشغيلية والمستهدفات الخاصة بالمكان.",
  },
  [PlacePermission.VIEW_PLAN]: {
    title: "عرض قراءة الخطط",
    description: "الاطلاع على الخطط التشغيلية المستهدفة ومتابعة نسب الإنجاز.",
  },
  [PlacePermission.SUBMIT_PLAN]: {
    title: "رفع الخطط للمراجعة",
    description: "تحويل مسودة الخطة إلى حالة قيد المراجعة اعتماداً من المشرف.",
  },
  [PlacePermission.APPROVE_PLAN]: {
    title: "اعتماد أو رفض الخطط",
    description: "الموافقة النهائية على الخطط المرفوعة أو رفضها وتحديد حالتها.",
  },
  [PlacePermission.MERGE_PLANS]: {
    title: "دمج الخطط التشغيلية",
    description: "دمج خطط متعددة من عدة أعضاء في خطة واحدة معتمدة للمكان.",
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

interface CustomPermissionItem {
  permission: IPlacePermission;
  expires_at: string | null;
}

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
  const { id, userId } = useParams<{ id: string; userId: string }>();
  const { hasPermission } = usePlacePermissions();
  // console.log("edit permis");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState<IPlaceRole>(
    PlaceRole.OPERATOR,
  );

  // حالة انتهاء الدور بالكامل
  const [roleExpiresAt, setRoleExpiresAt] = useState<string>("");
  const [hasRoleExpiration, setHasRoleExpiration] = useState<boolean>(false);

  // قائمة الصلاحيات الاستثنائية مع تواريخ الانتهاء الخاصة بها
  const [customPermissions, setCustomPermissions] = useState<
    CustomPermissionItem[]
  >([]);

  const [inheritToChildren, setInheritToChildren] = useState<boolean>(true);

  // 1. جلب البيانات الحقيقية من السيرفر عند التحميل
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        dispatch(loading());
        const response = await AxiosApi.get(
          `/auth/withlogin/places/place-staff/place-staff-permissions/${userId}/${id}/permissions`,
        );

        if (response.data.success) {
          const {
            staff_info,
            role,
            role_expires_at,
            custom_permissions,
            inherit_to_children,
          } = response.data.data;

          setStaffInfo(staff_info);
          setSelectedRole(role);

          if (role_expires_at) {
            setHasRoleExpiration(true);
            setRoleExpiresAt(
              new Date(role_expires_at).toISOString().slice(0, 16),
            );
          } else {
            setHasRoleExpiration(false);
            setRoleExpiresAt("");
          }

          // تحويل صيغة custom_permissions القادمة من السيرفر
          if (Array.isArray(custom_permissions)) {
            const parsedCustoms = custom_permissions.map((item: any) => {
              if (typeof item === "string") {
                return {
                  permission: item as IPlacePermission,
                  expires_at: null,
                };
              }
              return {
                permission: item.permission,
                expires_at: item.expires_at
                  ? new Date(item.expires_at).toISOString().slice(0, 16)
                  : null,
              };
            });
            setCustomPermissions(parsedCustoms);
          } else {
            setCustomPermissions([]);
          }

          setInheritToChildren(inherit_to_children ?? true);
        }

        dispatch(close());
      } catch (error: any) {
        console.error("خطأ في جلب بيانات الصلاحيات:", error);
        dispatch(
          open({
            state: "faild",
            title:
              error.response?.data?.message ||
              "تعذر جلب بيانات الصلاحيات من السيرفر",
          }),
        );
      }
    };

    if (id && userId) {
      fetchStaffData();
    }
  }, [id, userId, dispatch]);

  // الصلاحيات التلقائية القادمة مع الدور المختار
  const defaultPermsForRole = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];

  // دالة تبديل الصلاحية المخصصة (إضافة/إزالة)
  const toggleCustomPermission = (perm: IPlacePermission) => {
    if (defaultPermsForRole.includes(perm)) return;

    setCustomPermissions((prev) => {
      const exists = prev.some((item) => item.permission === perm);
      if (exists) {
        return prev.filter((item) => item.permission !== perm);
      } else {
        return [...prev, { permission: perm, expires_at: null }];
      }
    });
  };

  // دالة تحديث تاريخ انتهاء صلاحية مخصصة محددة
  const updateCustomPermissionExpiry = (
    perm: IPlacePermission,
    expiresAt: string | null,
  ) => {
    setCustomPermissions((prev) =>
      prev.map((item) =>
        item.permission === perm ? { ...item, expires_at: expiresAt } : item,
      ),
    );
  };

  // دالة الحفظ وإرسال التحديثات للسيرفر
  const handleSave = async () => {
    try {
      dispatch(loading());

      const payload = {
        role: selectedRole,
        role_expires_at:
          hasRoleExpiration && roleExpiresAt
            ? new Date(roleExpiresAt).toISOString()
            : null,
        custom_permissions: customPermissions.map((cp) => ({
          permission: cp.permission,
          expires_at: cp.expires_at
            ? new Date(cp.expires_at).toISOString()
            : null,
        })),
        inherit_to_children: inheritToChildren,
      };

      const response = await AxiosApi.put(
        `/auth/withlogin/places/place-staff/place-staff-access/${userId}/${id}/permissions`,
        payload,
      );

      if (response.data.success) {
        dispatch(
          open({
            state: "success",
            title: response.data.message || "تم حفظ التعديلات بنجاح",
          }),
        );
        navigate(-1);
      }
    } catch (error: any) {
      console.error("خطأ أثناء حفظ الصلاحيات:", error);
      dispatch(
        open({
          state: "faild",
          title: error.response?.data?.message || "حدث خطأ أثناء حفظ التعديلات",
        }),
      );
    }
  };

  if (!hasPermission(PlacePermission.MANAGE_MEMBERS))
    return (
      <div className="p-4 sm:p-6 text-center text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/50 max-w-md mx-auto my-8 shadow-sm">
        عذراً لا تملك الصلاحية للتعديل على الموظفين التابعين لهذا المكان
      </div>
    );

  return (
    <div
      className="max-w-4xl mx-auto dir-rtl px-4 sm:px-6 py-6 transition-colors duration-300"
      dir="rtl"
    >
      {/* الهيدر وزر الحفظ والعودة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>إدارة صلاحيات الموظف</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0.5">
              تحديد الدور الوظيفي الأساسي والصلاحيات الاستثنائية وتوريث الفروع
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs transition duration-200 shadow-sm disabled:opacity-70 active:scale-[0.98] cursor-pointer"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>حفظ التعديلات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* العمود الجانبي: بطاقة بيانات الموظف والإرشادات */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm text-center transition-colors">
            {staffInfo?.avatar_url ? (
              <img
                src={staffInfo.avatar_url}
                alt="User Avatar"
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-50 dark:border-gray-800 shadow-inner"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
                {staffInfo?.first_name?.charAt(0) || "U"}
              </div>
            )}
            <h2 className="text-base font-bold text-gray-900 dark:text-white mt-2">
              {staffInfo?.first_name} {staffInfo?.last_name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 break-all">
              {staffInfo?.email}
            </p>
          </div>

          {/* تفعيل / تعطيل التوارث للأماكن التابعة */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  توارث الصلاحية للفروع
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInheritToChildren(!inheritToChildren)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  inheritToChildren
                    ? "bg-purple-600 dark:bg-purple-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    inheritToChildren ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              عند التفعيل، سيرث الموظف نفس هذه الصلاحيات تلقائياً على جميع
              الأماكن والقطاعات التابعة لهذا المكان.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 transition-colors">
            <h4 className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs mb-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>كيف تعمل الصلاحيات؟</span>
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
              الدور الأساسي يمنح الموظف حزمة صلاحياتجاهزة. يمكنك تفعيل صلاحيات
              إضافية بالأسفل لتمنحه استثناءات حساسة (Custom Permissions) وتحديد
              تاريخ انتهاء لكل منها.
            </p>
          </div>
        </div>

        {/* العمود الرئيسي: تحديد الدور والصلاحيات التفصيلية */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* 1. اختيار الدور الوظيفي (PlaceRole) وتاريخ انتهائه */}
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
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
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600 dark:ring-blue-500"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="place_role"
                        value={r.id}
                        checked={isSelected}
                        onChange={() => {
                          const newRole = r.id as IPlaceRole;
                          setSelectedRole(newRole);
                          setCustomPermissions((prev) =>
                            prev.filter(
                              (cp) =>
                                !DEFAULT_ROLE_PERMISSIONS[newRole].includes(
                                  cp.permission,
                                ),
                            ),
                          );
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                      />
                      <span className="font-bold text-gray-900 dark:text-white text-xs">
                        {r.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 pr-6 mt-1 leading-snug">
                      {r.desc}
                    </p>
                  </label>
                );
              })}
            </div>

            {/* انتهاء صلاحية الدور ككل */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>تحديد تاريخ انتهاء للدور الوظيفي بالكامل</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasRoleExpiration(!hasRoleExpiration);
                    if (hasRoleExpiration) setRoleExpiresAt("");
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    hasRoleExpiration
                      ? "bg-amber-600 dark:bg-amber-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hasRoleExpiration ? "-translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {hasRoleExpiration && (
                <div className="flex items-center gap-2 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <input
                    type="datetime-local"
                    value={roleExpiresAt}
                    onChange={(e) => setRoleExpiresAt(e.target.value)}
                    className="text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-amber-500 outline-none w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. الصلاحيات التفصيلية (Fine-grained Permissions) */}
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                الصلاحيات التفصيلية (Fine-grained Permissions)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                الصلاحيات باللون الأخضر مفعّلة تلقائياً حسب الدور المختار، بينما
                يتاح لك تفعيل صلاحيات مخصصة باللون الأزرق وتحديد مدة زمنية لكل
                منها.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(PlacePermission).map(([, permCode]) => {
                const isDefault = defaultPermsForRole.includes(permCode);
                const customItem = customPermissions.find(
                  (cp) => cp.permission === permCode,
                );
                const isCustom = !!customItem;
                const permMeta = PERMISSION_DETAILS[permCode];

                return (
                  <div
                    key={permCode}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDefault
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40"
                        : isCustom
                          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50"
                          : "bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="pl-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {permMeta?.title || permCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {permMeta?.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isDefault ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">
                              أساسية بالدور
                            </span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleCustomPermission(permCode)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              isCustom
                                ? "bg-blue-600 dark:bg-blue-500"
                                : "bg-gray-200 dark:bg-gray-700"
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

                    {/* تاريخ انتهاء الصلاحية المخصصة إن وجدت */}
                    {isCustom && (
                      <div className="mt-3 pt-2.5 border-t border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          تاريخ انتهاء الصلاحية الاستثنائية:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="datetime-local"
                            value={customItem.expires_at || ""}
                            onChange={(e) =>
                              updateCustomPermissionExpiry(
                                permCode,
                                e.target.value || null,
                              )
                            }
                            className="text-[11px] bg-white dark:bg-gray-800 dark:text-white p-1.5 rounded-lg border border-blue-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700"
                          />
                          {customItem.expires_at ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateCustomPermissionExpiry(permCode, null)
                              }
                              className="text-[10px] text-red-600 dark:text-red-400 hover:underline bg-white dark:bg-gray-800 px-2 py-1 rounded border border-red-100 dark:border-red-900/50 cursor-pointer"
                            >
                              جعله دائم
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800/40">
                              دائمة (بدون انتهاء)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
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
