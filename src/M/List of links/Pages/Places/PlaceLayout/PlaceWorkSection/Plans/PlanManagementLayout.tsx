import {
  FileEdit,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { PlacePermission, ROLES_LABELS } from "../../../types";
import { usePlacePermissions } from "../../../../../../Redux-Store/PlacePermissions/usePlacePermissions";

// 1. حالات الخطة المتوافقة مع السلسلة الجديدة
export type PlanStatus =
  | "DRAFT" // مسودة (تحت الإنشاء)
  | "IN_REVIEW" // قيد التنسيق والمراجعة الأولية
  | "PENDING_APPROVAL" // محولة للمسؤول للاعتماد
  | "REJECTED" // مرفوضة (تحتاج تعديل)
  | "APPROVED"; // معتمدة بالكامل

// 2. التبويبات الثلاث المحددة
export type PlanTab = "BUILDER" | "REVIEW_COORDINATION" | "FINAL_APPROVAL";

export default function PlanManagementLayout() {
  const location = useLocation();

  // جلب الصلاحيات من الـ Redux Hook
  const { hasPermission, userRole, loading, isDev } = usePlacePermissions();

  // التحقق الفعلي من إمكانية الوصول للتبويب بناءً على الصلاحيات فقط
  const canAccessTab = (tab: PlanTab): boolean => {
    switch (tab) {
      case "BUILDER":
        // يتطلب صلاحية إنشاء أو تعديل الخطة
        return hasPermission(PlacePermission.CREATE_PLAN);

      case "REVIEW_COORDINATION":
        // يتطلب صلاحية الرفع للمراجعة أو الدمج فقط
        return hasPermission(PlacePermission.SUBMIT_PLAN);

      case "FINAL_APPROVAL":
        // يتطلب صلاحية اعتماد الخطط فقط
        return hasPermission(PlacePermission.APPROVE_PLAN);

      default:
        return false;
    }
  };

  // قائمة التبويبات
  const tabs = [
    {
      id: "BUILDER" as PlanTab,
      label: "1. إنشاء الخطة",
      path: ".", // الروت الأساسي (index route)
      icon: FileEdit,
    },
    {
      id: "REVIEW_COORDINATION" as PlanTab,
      label: "2. المراجعة والتنسيق",
      path: "review",
      icon: ClipboardCheck,
    },
    {
      id: "FINAL_APPROVAL" as PlanTab,
      label: "3. الاعتماد النهائي",
      path: "approval",
      icon: ShieldCheck,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentRoleLabel = isDev
    ? "مطور (Dev)"
    : userRole && userRole in ROLES_LABELS
      ? ROLES_LABELS[userRole as keyof typeof ROLES_LABELS]
      : "مستخدم";

  return (
    <div className="min-h-screen font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ==================== 1. Header Card (عرض البيانات فقط) ==================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-br-full -z-0 opacity-60" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  خطة التوعية الصحية
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                الدور الحالي:{" "}
                <strong className="text-slate-800">{currentRoleLabel}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 2. Tabs Navigation ==================== */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const hasAccess = canAccessTab(tab.id);

            // تحديد حالة النشاط: زر "إنشاء الخطة" يكون Active إذا لم نكن في الصفحات الفرعية الأخرى
            const isActive =
              tab.id === "BUILDER"
                ? !location.pathname.endsWith("/review") &&
                  !location.pathname.endsWith("/approval")
                : location.pathname.endsWith(`/${tab.path}`);

            const Icon = tab.icon;

            return (
              <NavLink
                key={tab.id}
                to={hasAccess ? tab.path : "."}
                aria-disabled={!hasAccess}
                tabIndex={hasAccess ? undefined : -1}
                onClick={(event) => {
                  if (!hasAccess) {
                    event.preventDefault();
                  }
                }}
                title={
                  !hasAccess
                    ? "ليس لديك الصلاحية المطلوبة لفتح هذا التبويب"
                    : ""
                }
                className={`flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : !hasAccess
                      ? "text-slate-300 bg-slate-50/50 cursor-not-allowed opacity-60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {hasAccess ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
                {tab.label}
              </NavLink>
            );
          })}
        </div>

        {/* ==================== 3. Content Area ==================== */}
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
