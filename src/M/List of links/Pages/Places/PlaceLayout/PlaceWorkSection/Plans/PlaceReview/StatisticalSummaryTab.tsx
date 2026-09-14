import AxiosApi from "../../../../../../../../AxiosApi";
import { Layers, PieChart, Send } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../../../../store";
import { loading, open } from "../../../../../../../Redux-Store/SuccessFaildState/SFS";
import type { ITableGroupedStat } from "./PlanReviewPage";

interface IStatisticalSummaryTabProps {
  groupedTables: ITableGroupedStat[];
  placeId: string | undefined;
  fetchData: () => void;
}

export default function StatisticalSummaryTab({
  groupedTables,
  placeId,
  fetchData,
}: IStatisticalSummaryTabProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmitPlanForApproval = async () => {
    if (!window.confirm("هل أنت تأكد من رغبتك في رفع الخطة للإعتماد؟")) return;

    dispatch(loading());
    try {
      await AxiosApi.post(
        `/auth/withlogin/places/place-plans/update-plan-draft/${placeId}`,
      );
      dispatch(open({ state: "success", title: "تم رفع الخطة للإعتماد بنجاح." }));
      fetchData();
    } catch (err: any) {
      dispatch(
        open({
          state: "faild",
          title:
            err?.response?.data?.message ||
            "حدث خطأ أثناء رفع الخطة للإعتماد.",
        }),
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* الهيدر وزر الرفع */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <PieChart className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-black text-slate-800">
            التجميعة الإحصائية النهائية (حسب اسم الجدول الفعلي)
          </h2>
        </div>

        <button
          type="button"
          disabled={groupedTables.length === 0}
          onClick={handleSubmitPlanForApproval}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>رفع الخطة للإعتماد</span>
        </button>
      </div>

      {groupedTables.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-3xl bg-slate-50">
          لا توجد مسودات مسجلة حالياً لعرض التجميعة.
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTables.map((tableGroup, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* عنوان الجدول */}
              <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                <span className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  {tableGroup.schedule_name}
                </span>
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  عدد المواضيع: {tableGroup.rows.length}
                </span>
              </div>

              {/* الجدول التفصيلي الشامل */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 border-l border-slate-200">
                        الموضوع الرئيسي
                      </th>
                      <th className="p-3 border-l border-slate-200">
                        الموضوع الفرعي
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        ندوة داخلية
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        ندوة خارجية
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        مشورة عامة
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        لقاء جماهيري
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        ندوات القوافل
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        وسائل إعلامية
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        أنشطة إعلام رقمي
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        أطفال
                      </th>
                      <th className="p-3 border-l border-slate-200 text-center">
                        ذكور
                      </th>
                      <th className="p-3 text-center">إناث</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tableGroup.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50 text-slate-700"
                      >
                        <td className="p-3 font-medium border-l border-slate-200">
                          {row.main_topic}
                        </td>
                        <td className="p-3 font-medium border-l border-slate-200">
                          {row.sub_topic}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-blue-600">
                          {row.internal_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-purple-600">
                          {row.external_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-teal-600">
                          {row.consultation_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-indigo-600">
                          {row.meeting_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-emerald-600">
                          {row.convoy_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-cyan-600">
                          {row.media_outlets_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-sky-600">
                          {row.digital_media_count}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-amber-600">
                          {row.children}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-slate-800">
                          {row.males}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">
                          {row.females}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* صف الإجمالي للجدول */}
                  <tfoot>
                    <tr className="bg-slate-100/80 font-black text-slate-800 border-t-2 border-slate-300">
                      <td
                        colSpan={2}
                        className="p-3 border-l border-slate-200 text-left pl-4"
                      >
                        الإجمالي:
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-blue-700">
                        {tableGroup.totals.internal_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-purple-700">
                        {tableGroup.totals.external_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-teal-700">
                        {tableGroup.totals.consultation_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-indigo-700">
                        {tableGroup.totals.meeting_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-emerald-700">
                        {tableGroup.totals.convoy_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-cyan-700">
                        {tableGroup.totals.media_outlets_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-sky-700">
                        {tableGroup.totals.digital_media_count}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-amber-700">
                        {tableGroup.totals.children}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 text-slate-900">
                        {tableGroup.totals.males}
                      </td>
                      <td className="p-3 text-center text-slate-900">
                        {tableGroup.totals.females}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
