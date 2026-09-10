// components/EventsAnalyticsSection.tsx
import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../../store.tsx";

export const EventsAnalyticsSection: React.FC = () => {
  const { events, plans, filterLoading } = useSelector(
    (state: RootState) => state.eventsFilter,
  );

  // const executedCount = `events`?.length || 0;
  const executedCount = events?.reduce((count, event) => {
    return count + event.seminars_count;
  }, 0);

  const targetCount = plans?.reduce((count, plan) => {
    return count + plan.target_seminars_count;
  }, 0);

  // حساب المتبقي ونسبة التحقيق
  const remainingCount = Math.max(0, targetCount - executedCount);
  const completionPercentage =
    targetCount > 0
      ? Math.round((executedCount / targetCount) * 100)
      : executedCount > 0
        ? Infinity
        : 100;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6 relative">
      {filterLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between border-b pb-3">
        <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>معدلات ونسب إنجاز الخطة المقررة</span>
        </h4>
        <span className="text-[11px] text-gray-500">
          تتحدث النسب تلقائياً بناءً على خيارات الفلترة
        </span>
      </div>

      {/* كروت الإحصائيات النسبية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* كارت المستهدف vs المنفذ */}
        <div className="p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 border border-blue-100 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-600 font-bold block">
              معدل تحقيق الخطة
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700">
                {completionPercentage}%
              </span>
              <span className="text-xs text-gray-500">
                ({executedCount} / {targetCount} ندوة)
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* كارت المنفذ */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-100 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-600 font-bold block">
              الندوات المنفذة
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">
                {executedCount}
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                ندوة منجزة
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* كارت المتبقي */}
        <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/30 border border-amber-100 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-600 font-bold block">
              المتبقي في الخطة
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">
                {remainingCount}
              </span>
              <span className="text-xs text-amber-600 font-bold">
                ندوات متبقية
              </span>
            </div>
          </div>
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Progress Bar visual */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-bold text-gray-600">
          <span>تقدم إنجاز الأماكن والندوات</span>
          <span className="text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
