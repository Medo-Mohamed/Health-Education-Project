import {
  FileEdit,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { memo, useCallback } from "react";
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

// قائمة التبويبات (ثابتة خارج الكومبوننت لتجنب إعادة إنشائها في كل رندر)
const TABS: {
  id: PlanTab;
  label: string;
  path: string;
  icon: typeof FileEdit;
}[] = [
  {
    id: "BUILDER",
    label: "1. إنشاء الخطة",
    path: ".", // الروت الأساسي (index route)
    icon: FileEdit,
  },
  {
    id: "REVIEW_COORDINATION",
    label: "2. المراجعة والتنسيق",
    path: "review",
    icon: ClipboardCheck,
  },
  {
    id: "FINAL_APPROVAL",
    label: "3. الاعتماد النهائي",
    path: "approval",
    icon: ShieldCheck,
  },
];

function PlanManagementLayout() {
  const location = useLocation();

  // جلب الصلاحيات من الـ Redux Hook
  const { hasPermission, userRole, loading, isDev } = usePlacePermissions();

  // التحقق الفعلي من إمكانية الوصول للتبويب بناءً على الصلاحيات فقط
  const canAccessTab = useCallback(
    (tab: PlanTab): boolean => {
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
    },
    [hasPermission],
  );

  if (loading) {
    return null;
  }

  const currentRoleLabel = isDev
    ? "مطور (Dev)"
    : userRole && userRole in ROLES_LABELS
      ? ROLES_LABELS[userRole as keyof typeof ROLES_LABELS]
      : "مستخدم";

  return (
    <div
      className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 p-4 sm:p-6 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* ==================== 1. Header Card (عرض البيانات فقط) ==================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors">
          {/* الخلفية التجميلية للتدرج (تم ضبط التعتيم للدارك مود) */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 rounded-br-full -z-0 opacity-60 dark:opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 sm:p-2.5 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  خطة التوعية الصحية
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs font-bold rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>الدور الحالي:</span>
                <strong className="text-slate-800 dark:text-slate-100">
                  {currentRoleLabel}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 2. Tabs Navigation ==================== */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center flex-wrap gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => {
            const hasAccess = canAccessTab(tab.id);

            // تحديد حالة النشاط
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
                className={`flex-1 min-w-[130px] sm:min-w-[160px] flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 whitespace-nowrap select-none ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-600 dark:text-white dark:shadow-blue-900/30"
                    : !hasAccess
                      ? "text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-800/30 cursor-not-allowed opacity-60"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                {hasAccess ? (
                  <Icon className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                )}
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* ==================== 3. Content Area ==================== */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default memo(PlanManagementLayout);
