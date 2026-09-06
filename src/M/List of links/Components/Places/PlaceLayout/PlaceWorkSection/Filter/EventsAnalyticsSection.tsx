// components/EventsAnalyticsSection.tsx
import React from "react";
import { TrendingUp, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import type { FilterState } from "./EventsFilterSection.tsx";

interface EventsAnalyticsSectionProps {
  filters: FilterState;
}

export const EventsAnalyticsSection: React.FC<EventsAnalyticsSectionProps> = ({
  filters,
}) => {
  // ملاحظة: النسب تتأثر مستقبلاً بالـ filters الممررة هنا
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6">
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
              <span className="text-2xl font-black text-blue-700">65%</span>
              <span className="text-xs text-gray-500">(13 / 20 ندوة)</span>
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
              <span className="text-2xl font-black text-emerald-700">13</span>
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
              المتبقي في الخطة القادمة
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">7</span>
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
          <span className="text-blue-600">65%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: "65%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
