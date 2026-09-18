import type { ITableGroupedStat } from "./PlanApprovalPage";
import AxiosApi from "../../../../../../../../AxiosApi";
import { CheckCircle2, Layers } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../../../../store";
import {
  loading,
  open,
} from "../../../../../../../Redux-Store/SuccessFaildState/SFS";

interface IApprovedStatisticalSummaryTabProps {
  groupedTables: ITableGroupedStat[];
  placeId: string | undefined;
  fetchData: () => void;
}

export const ApprovedStatisticalSummaryTab: React.FC<
  IApprovedStatisticalSummaryTabProps
> = ({ groupedTables, placeId, fetchData }) => {
  const dispatch = useDispatch<AppDispatch>();

  //   console.log("groupedTables in ApprovedStatisticalSummaryTab:", groupedTables);
  const handleApprovePlan = async () => {
    if (
      !window.confirm("هل أنت تأكد من رغبتك في اعتماد الخطة نهائياً وتأكيدها؟")
    )
      return;

    dispatch(loading());
    try {
      await AxiosApi.post(
        `/auth/withlogin/places/place-plans/approve-plan/${placeId}`,
        { userIdToApprove: null },
      );
      dispatch(
        open({ state: "success", title: "تم اعتماد الخطة بنجاح في السيرفر." }),
      );
      fetchData();
    } catch (err: any) {
      dispatch(
        open({
          state: "faild",
          title: err?.response?.data?.message || "حدث خطأ أثناء اعتماد الخطة.",
        }),
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* الهيدر وزر الاعتماد النهائي */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
            ملخص الخطة المعتمدة نهائياً
          </h2>
        </div>

        <button
          type="button"
          disabled={groupedTables.length === 0}
          onClick={handleApprovePlan}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>تأكيد اعتماد الخطة (Approved)</span>
        </button>
      </div>

      {groupedTables.length === 0 ? (
        <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/50 transition-colors">
          لا توجد خطط حالية لإعتمادها.
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTables.map((tableGroup, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors max-lg:bg-transparent max-lg:border-0 max-lg:shadow-none"
            >
              {/* عنوان الجدول */}
              <div className="bg-slate-800 dark:bg-slate-950 text-white p-4 flex flex-wrap items-center justify-between gap-2 max-lg:rounded-2xl max-lg:mb-3">
                <span className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400 dark:text-emerald-300" />
                  {tableGroup.schedule_name}
                </span>
                <span className="bg-emerald-600 dark:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  عدد المواضيع: {tableGroup.rows.length}
                </span>
              </div>

              {/* الجدول التفصيلي الشامل */}
              <div className="w-full">
                <table className="w-full text-right text-[11px] border-collapse lg:table-fixed max-lg:block">
                  <thead className="max-lg:hidden">
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="xl:p-2 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 w-auto">
                        الموضوع الرئيسي
                      </th>
                      <th className="xl:p-2 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 w-auto">
                        الموضوع الفرعي
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        ندوة داخلية
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        ندوة خارجية
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        مشورة عامة
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        لقاء جماهيري
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        ندوات القوافل
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        وسائل إعلامية
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[58px] leading-tight">
                        أنشطة إعلام رقمي
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[48px]">
                        أطفال
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 border-l border-slate-200 dark:border-slate-800 text-center xl:w-[48px]">
                        ذكور
                      </th>
                      <th className="xl:p-1.5 max-lg:p-0.5 text-center xl:w-[48px]">
                        إناث
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 max-lg:block max-lg:space-y-4 max-lg:divide-y-0">
                    {tableGroup.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 max-lg:block max-lg:rounded-2xl max-lg:border max-lg:border-slate-200 dark:max-lg:border-slate-800 max-lg:bg-white dark:max-lg:bg-slate-900 max-lg:p-4 max-lg:shadow-sm"
                      >
                        <td
                          data-label="الموضوع الرئيسي"
                          className="xl:p-2 font-medium border-l border-slate-200 dark:border-slate-800 break-words max-lg:block max-lg:py-2 max-lg:px-1 max-lg:border-l-0 max-lg:font-bold max-lg:border-b max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:block max-lg:before:text-[10px] max-lg:before:font-bold max-lg:before:text-slate-400 dark:max-lg:before:text-slate-500"
                        >
                          {row.main_topic}
                        </td>
                        <td
                          data-label="الموضوع الفرعي"
                          className="xl:p-2 font-medium border-l border-slate-200 dark:border-slate-800 break-words max-lg:block max-lg:py-2 max-lg:px-1 max-lg:border-l-0 max-lg:border-b max-lg:border-slate-100 dark:max-lg:border-slate-800 max-lg:before:content-[attr(data-label)] max-lg:before:block max-lg:before:text-[10px] max-lg:before:font-bold max-lg:before:text-slate-400 dark:max-lg:before:text-slate-500"
                        >
                          {row.sub_topic}
                        </td>
                        <td
                          data-label="ندوة داخلية"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-blue-600 dark:text-blue-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:ml-3 max-lg:mt-3 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.internal_count}</span>
                        </td>
                        <td
                          data-label="ندوة خارجية"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-purple-600 dark:text-purple-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:mt-3 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.external_count}</span>
                        </td>
                        <td
                          data-label="مشورة عامة"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-teal-600 dark:text-teal-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:ml-3 max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.consultation_count}</span>
                        </td>
                        <td
                          data-label="لقاء جماهيري"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-indigo-600 dark:text-indigo-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.meeting_count}</span>
                        </td>
                        <td
                          data-label="ندوات القوافل"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:ml-3 max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.convoy_count}</span>
                        </td>
                        <td
                          data-label="وسائل إعلامية"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-cyan-600 dark:text-cyan-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.media_outlets_count}</span>
                        </td>
                        <td
                          data-label="أنشطة إعلام رقمي"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-sky-600 dark:text-sky-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:ml-3 max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.digital_media_count}</span>
                        </td>
                        <td
                          data-label="أطفال"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-amber-600 dark:text-amber-400 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.children}</span>
                        </td>
                        <td
                          data-label="ذكور"
                          className="xl:p-2 text-center border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:ml-3 max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:border-l-0 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.males}</span>
                        </td>
                        <td
                          data-label="إناث"
                          className="xl:p-2 text-center font-bold text-slate-800 dark:text-slate-200 max-lg:inline-flex max-lg:w-[calc(50%-0.375rem)] max-lg:mt-2 max-lg:items-center max-lg:justify-between max-lg:py-2 max-lg:px-3 max-lg:rounded-xl max-lg:bg-slate-50 dark:max-lg:bg-slate-800/50 max-lg:before:content-[attr(data-label)] max-lg:before:text-[11px] max-lg:before:font-medium max-lg:before:text-slate-500 dark:max-lg:before:text-slate-400"
                        >
                          <span>{row.females}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* صف الإجمالي للجدول */}
                  <tfoot className="max-lg:hidden">
                    <tr className="bg-slate-100/80 dark:bg-slate-800/90 font-black text-slate-800 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700">
                      <td
                        colSpan={2}
                        className="p-2 border-l border-slate-200 dark:border-slate-800 text-right"
                      >
                        الإجمالي:
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-400">
                        {tableGroup.totals.internal_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-purple-700 dark:text-purple-400">
                        {tableGroup.totals.external_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400">
                        {tableGroup.totals.consultation_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-400">
                        {tableGroup.totals.meeting_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">
                        {tableGroup.totals.convoy_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-400">
                        {tableGroup.totals.media_outlets_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-400">
                        {tableGroup.totals.digital_media_count}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400">
                        {tableGroup.totals.children}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                        {tableGroup.totals.males}
                      </td>
                      <td className="p-2 text-center text-slate-900 dark:text-slate-100">
                        {tableGroup.totals.females}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* كارت الإجمالي — موبايل فقط */}
              <div className="lg:hidden p-4 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    الإجمالي:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      ندوة داخلية
                    </span>
                    <span className="font-black text-blue-700 dark:text-blue-400 text-sm">
                      {tableGroup.totals.internal_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      ندوة خارجية
                    </span>
                    <span className="font-black text-purple-700 dark:text-purple-400 text-sm">
                      {tableGroup.totals.external_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      مشورة عامة
                    </span>
                    <span className="font-black text-teal-700 dark:text-teal-400 text-sm">
                      {tableGroup.totals.consultation_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      لقاء جماهيري
                    </span>
                    <span className="font-black text-indigo-700 dark:text-indigo-400 text-sm">
                      {tableGroup.totals.meeting_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      ندوات القوافل
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                      {tableGroup.totals.convoy_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      وسائل إعلامية
                    </span>
                    <span className="font-black text-cyan-700 dark:text-cyan-400 text-sm">
                      {tableGroup.totals.media_outlets_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      أنشطة إعلام رقمي
                    </span>
                    <span className="font-black text-sky-700 dark:text-sky-400 text-sm">
                      {tableGroup.totals.digital_media_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      أطفال
                    </span>
                    <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                      {tableGroup.totals.children}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      ذكور
                    </span>
                    <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                      {tableGroup.totals.males}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      إناث
                    </span>
                    <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                      {tableGroup.totals.females}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
