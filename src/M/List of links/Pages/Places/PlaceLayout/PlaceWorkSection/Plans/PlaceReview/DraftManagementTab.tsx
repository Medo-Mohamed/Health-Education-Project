import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
import type { IPlacePlan } from "./PlanReviewPage";
import { LocationType } from "../../../../types";

// ==========================================
// Component 1: قسم إدارة وتعديل المسودات
// ==========================================
interface IDraftManagementTabProps {
  plans: IPlacePlan[];
  error: string | null;
  savingId: string | null;
  deletingId: string | null;
  savedSuccessId: string | null;
  getActualTableName: (
    mainTopic: string,
    subTopic: string,
    defaultName: string,
  ) => string;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (plan: IPlacePlan) => void;
  handlePlanAction: (
    planId: string,
    payload?: Partial<IPlacePlan> & { action?: "DELETE" | "CREATE" },
  ) => void;
}

export default function DraftManagementTab({
  plans,
  error,
  savingId,
  deletingId,
  savedSuccessId,
  getActualTableName,
  handleOpenAddModal,
  handleOpenEditModal,
  handlePlanAction,
}: IDraftManagementTabProps) {
  // console.log(plans)
  // دالة مساعدة لتحديد مسمى ونمط نوع المكان/الفعالية
  const renderLocationBadge = (plan: IPlacePlan) => {
    switch (plan.location_type) {
      case LocationType.EXTERNAL_SEMINAR:
        return (
          <span
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md font-bold"
            title="ندوة خارجية"
          >
            <MapPin className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />
            {plan.external_location_name || "ندوة خارجية"}
          </span>
        );
      case LocationType.GENERAL_CONSULTATION:
        return (
          <span
            className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md font-bold"
            title="مشورة عامة"
          >
            <MapPin className="w-3 h-3 shrink-0 text-purple-600 dark:text-purple-400" />
            مشورة عامة
          </span>
        );
      case LocationType.PUBLIC_MEETING:
        return (
          <span
            className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md font-bold"
            title="لقاء جماهيري"
          >
            <MapPin className="w-3 h-3 shrink-0 text-blue-600 dark:text-blue-400" />
            {plan.external_location_name || "لقاء جماهيري"}
          </span>
        );
      case LocationType.CONVOY_SEMINARS:
        return (
          <span
            className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md font-bold"
            title="ندوات القوافل"
          >
            <MapPin className="w-3 h-3 shrink-0 text-teal-600 dark:text-teal-400" />
            {plan.external_location_name || "ندوات القوافل"}
          </span>
        );
      case LocationType.INTERNAL_SEMINAR:
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold"
            title="ندوة داخلية"
          >
            <MapPin className="w-3 h-3 shrink-0 text-zinc-600 dark:text-zinc-400" />
            ندوة داخلية
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
            إدارة وتعديل المسودات (جدول الموضوعات والصفوف)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صف جديد</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          لا توجد ندوات في وضع المسودة (Draft) مضافة لهذا المكان.
        </div>
      ) : (
        <div className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[70vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 max-lg:bg-transparent max-lg:border-0 max-lg:shadow-none">
          <table className="w-full custom-scrollbar text-right text-xs max-lg:block max-lg:whitespace-normal">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold max-lg:hidden shadow-sm max-lg:bg-transparent">
              <tr className="text-center">
                <th className="p-1">اسم الجدول الفعلي</th>
                <th className="p-1">الموضوع الرئيسي</th>
                <th className="p-1">الموضوع الفرعي</th>
                <th className="p-1">تاريخ الفعالية</th>
                <th className="p-1">نوع المكان</th>
                <th className="p-1 text-center">العدد</th>
                <th className="p-1 text-center">التغطية الإعلامية</th>
                <th className="p-1 text-center">الحضور المستهدف</th>
                <th className="p-1 text-center">الحالة / الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 max-lg:block max-lg:space-y-4 max-lg:divide-y-0 max-lg:bg-transparent">
              {plans.map((plan) => {
                const actualTableName = getActualTableName(
                  plan.main_topic,
                  plan.sub_topic,
                  plan.schedule_name,
                );
                return (
                  <tr
                    key={plan.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors max-lg:block max-lg:rounded-2xl max-lg:border max-lg:border-slate-200 dark:max-lg:border-slate-800 max-lg:bg-white dark:max-lg:bg-slate-900 max-lg:p-4 max-lg:shadow-sm max-lg:hover:bg-white dark:max-lg:hover:bg-slate-900"
                  >
                    <td
                      data-label="اسم الجدول الفعلي"
                      className="p-1 font-bold text-slate-800 dark:text-slate-100 max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2">{actualTableName}</div>
                    </td>

                    <td
                      data-label="الموضوع الرئيسي"
                      className="p-1 text-slate-700 dark:text-slate-300 font-medium max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2">
                        {plan.main_topic || "—"}
                      </div>
                    </td>

                    <td
                      data-label="الموضوع الفرعي"
                      className="p-1  text-slate-600 dark:text-slate-400 max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2">
                        {plan.sub_topic || "—"}
                      </div>
                    </td>

                    <td
                      data-label="تاريخ الفعالية"
                      className="p-1 text-slate-600 dark:text-slate-400 whitespace-nowrap max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:whitespace-normal max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {plan.planned_date
                          ? plan.planned_date.substring(0, 10)
                          : "—"}
                      </div>
                    </td>

                    <td
                      data-label="نوع المكان"
                      className="p-1 text-slate-600 dark:text-slate-400 max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2">
                        {renderLocationBadge(plan)}
                      </div>
                    </td>

                    <td
                      data-label="العدد"
                      className="p-1 text-center max-lg:text-right max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black rounded-lg inline-block">
                          {plan.count}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="التغطية الإعلامية"
                      className="p-1 text-center max-lg:text-right max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2 flex lg:flex-col xl:flex-row items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 justify-center max-lg:justify-start">
                        <span
                          className="flex items-center gap-1"
                          title="وسائل الإعلام"
                        >
                          <Radio className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {plan.media_outlets_count || 0}
                        </span>
                        <span>•</span>
                        <span
                          className="flex items-center gap-1"
                          title="الأنشطة الرقمية"
                        >
                          <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          {plan.digital_media_activities_count || 0}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="الحضور المستهدف"
                      className="p-1 text-center max-lg:text-right max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:border-b max-lg:border-dashed max-md:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2 flex lg:flex-col xl:flex-row items-center gap-1.5 text-[11px] justify-center max-lg:justify-start max-lg:flex-wrap text-slate-700 dark:text-slate-300">
                        <span title="ذكور">
                          👨 {plan.target_attendees?.males || 0}
                        </span>
                        <span>•</span>
                        <span title="إناث">
                          👩 {plan.target_attendees?.females || 0}
                        </span>
                        <span>•</span>
                        <span title="أطفال">
                          👶 {plan.target_attendees?.children || 0}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="الحالة / الإجراءات"
                      className="p-1 text-center whitespace-nowrap max-lg:grid max-lg:grid-cols-3 max-lg:items-center max-lg:gap-3 max-lg:py-2.5 max-lg:px-1 max-lg:whitespace-normal max-lg:before:content-[attr(data-label)] max-lg:before:col-span-1 max-lg:before:text-xs max-lg:before:font-bold max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                    >
                      <div className="max-lg:col-span-2 flex lg:flex-col xl:flex-row items-center justify-center max-lg:justify-start gap-2 max-lg:flex-wrap">
                        {savingId === plan.id && (
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        )}
                        {savedSuccessId === plan.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(plan)}
                          className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 font-bold"
                          title="تعديل الندوة"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === plan.id}
                          onClick={() =>
                            handlePlanAction(plan.id, { action: "DELETE" })
                          }
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 font-bold disabled:opacity-50"
                          title="حذف الندوة"
                        >
                          {deletingId === plan.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
