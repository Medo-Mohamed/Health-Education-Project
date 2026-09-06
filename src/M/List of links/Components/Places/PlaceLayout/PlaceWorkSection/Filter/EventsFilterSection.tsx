// components/EventsFilterSection.tsx
import React from "react";
import {
  Filter,
  SlidersHorizontal,
  Building,
  Layers,
  CalendarDays,
} from "lucide-react";

export interface FilterState {
  selectedPlaces: string[];
  selectedEventType: string;
  dateRange: { start: string; end: string };
}

interface EventsFilterSectionProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  showFilters: boolean;
  onToggleShowFilters: () => void;
}

export const EventsFilterSection: React.FC<EventsFilterSectionProps> = ({
  filters,
  onChangeFilters,
  showFilters,
  onToggleShowFilters,
}) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h4 className="font-bold text-sm text-gray-800">
            تحديات الفلترة والتصفية الشاملة
          </h4>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
            الافتراضي: تحديد الكل
          </span>
        </div>

        {/* زر إخفاء وإظهار الفلترة لتخصيص الخيارات */}
        <button
          onClick={onToggleShowFilters}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? "إخفاء الفلترة" : "تخصيص الفلترة"}</span>
        </button>
      </div>

      {/* منطقة خيارات الفلترة عند الضغط على تخصيص الفلترة */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 border-dashed animate-fadeIn">
          {/* 1. الأماكن */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-gray-500" />
              <span>نطاق الأماكن:</span>
            </label>
            <select
              value={filters.selectedPlaces[0] || "ALL"}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  selectedPlaces: [e.target.value],
                })
              }
              className="w-full text-xs p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">جميع الأماكن التابعة (الكل)</option>
              <option value="SUB_1">فرع المركز الرئيسي</option>
              <option value="SUB_2">الموقع الميداني الشمالي</option>
            </select>
          </div>

          {/* 2. نوع الندوة */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>نوع الندوة:</span>
            </label>
            <select
              value={filters.selectedEventType}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  selectedEventType: e.target.value,
                })
              }
              className="w-full text-xs p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">كافة أنواع الندوات (الكل)</option>
              <option value="awareness">ندوات توعوية</option>
              <option value="training">ورش تدريبية</option>
              <option value="educational">ندوات تثقيفية</option>
            </select>
          </div>

          {/* 3. الفترة الزمنية */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
              <span>الفترة الزمنية:</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  onChangeFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value },
                  })
                }
                className="w-full text-[11px] p-2 bg-white border rounded-lg"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  onChangeFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value },
                  })
                }
                className="w-full text-[11px] p-2 bg-white border rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
