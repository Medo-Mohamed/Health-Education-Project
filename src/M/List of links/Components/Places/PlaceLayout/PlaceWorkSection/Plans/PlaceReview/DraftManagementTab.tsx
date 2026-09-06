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
            className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold"
            title="ندوة خارجية"
          >
            <MapPin className="w-3 h-3 shrink-0 text-amber-600" />
            {plan.external_location_name || "ندوة خارجية"}
          </span>
        );
      case LocationType.GENERAL_CONSULTATION:
        return (
          <span
            className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold"
            title="مشورة عامة"
          >
            <MapPin className="w-3 h-3 shrink-0 text-purple-600" />
            مشورة عامة
          </span>
        );
      case LocationType.PUBLIC_MEETING:
        return (
          <span
            className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold"
            title="لقاء جماهيري"
          >
            <MapPin className="w-3 h-3 shrink-0 text-blue-600" />
            {plan.external_location_name || "لقاء جماهيري"}
          </span>
        );
      case LocationType.CONVOY_SEMINARS:
        return (
          <span
            className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold"
            title="ندوات القوافل"
          >
            <MapPin className="w-3 h-3 shrink-0 text-teal-600" />
            {plan.external_location_name || "ندوات القوافل"}
          </span>
        );
      case LocationType.INTERNAL_SEMINAR:
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-shadow-zinc-700 bg-zinc-50 px-2 py-0.5 rounded-md font-bold"
            title="ندوة داخلية"
          >
            <MapPin className="w-3 h-3 shrink-0 text-shadow-zinc-600" />
            ندوة داخلية
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-800">
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
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 flex items-center gap-2 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-3xl">
          لا توجد ندوات في وضع المسودة (Draft) مضافة لهذا المكان.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5">اسم الجدول الفعلي</th>
                <th className="p-3.5">الموضوع الرئيسي</th>
                <th className="p-3.5">الموضوع الفرعي</th>
                <th className="p-3.5">تاريخ الفعالية</th>
                <th className="p-3.5">نوع المكان</th>
                <th className="p-3.5 text-center">العدد</th>
                <th className="p-3.5 text-center">التغطية الإعلامية</th>
                <th className="p-3.5 text-center">الحضور المستهدف</th>
                <th className="p-3.5 text-center">الحالة / الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => {
                const actualTableName = getActualTableName(
                  plan.main_topic,
                  plan.sub_topic,
                  plan.schedule_name,
                );
                // console.log("from darft",plan)
                return (
                  <tr
                    key={plan.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-800">
                      {actualTableName}
                    </td>

                    <td className="p-3.5 text-slate-700 font-medium">
                      {plan.main_topic || "—"}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {plan.sub_topic || "—"}
                    </td>

                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {plan.planned_date
                          ? plan.planned_date.substring(0, 10)
                          : "—"}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {renderLocationBadge(plan)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-black rounded-lg">
                        {plan.count}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600">
                        <span
                          className="flex items-center gap-0.5"
                          title="وسائل الإعلام"
                        >
                          <Radio className="w-3 h-3 text-cyan-600" />
                          {plan.media_outlets_count || 0}
                        </span>
                        <span>•</span>
                        <span
                          className="flex items-center gap-0.5"
                          title="الأنشطة الرقمية"
                        >
                          <Globe className="w-3 h-3 text-indigo-600" />
                          {plan.digital_media_activities_count || 0}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[11px]">
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
                        <span className="font-bold text-emerald-600 mr-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                          (إجمالي {plan.target_total_attendees})
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {savingId === plan.id && (
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        )}
                        {savedSuccessId === plan.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(plan)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-bold"
                          title="تعديل الندوة"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === plan.id}
                          onClick={() =>
                            handlePlanAction(plan.id, { action: "DELETE" })
                          }
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-bold disabled:opacity-50"
                          title="حذف الندوة"
                        >
                          {deletingId === plan.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>حذف</span>
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
