// components/EventsFilterSection.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Filter,
  SlidersHorizontal,
  Building,
  Layers,
  CalendarDays,
  Search,
  Check,
  Plus,
  X,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { LocationType } from "../../../types";

export interface CustomTopicFilter {
  id: string;
  scheduleId: string;
  schedule_name: string;
  mainTopic?: string;
  subTopic?: string;
}

export interface PlaceOption {
  id: string;
  name: string;
  isMain?: boolean;
}

export interface ScheduleOption {
  id: string;
  title: string;
  mainTopics: {
    name: string;
    subTopics: string[];
  }[];
}

export interface FilterState {
  selectedPlaces: string[];
  selectedEventTypes: string[];
  dateRange: { start: string; end: string };
  topicsFilter: {
    isAllTopics: boolean;
    customTopics: CustomTopicFilter[];
  };
}

interface EventsFilterSectionProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  showFilters: boolean;
  onToggleShowFilters: () => void;
  placesList?: PlaceOption[];
  schedulesList?: ScheduleOption[];
}

const EVENT_TYPE_OPTIONS = [
  {
    value: LocationType.INTERNAL_SEMINAR,
    label: "ندوة داخلية",
  },
  {
    value: LocationType.EXTERNAL_SEMINAR,
    label: "ندوة خارجية",
  },
  {
    value: LocationType.GENERAL_CONSULTATION,
    label: "مشورة عامة",
  },
  {
    value: LocationType.PUBLIC_MEETING,
    label: "لقاء جماهيري",
  },
  {
    value: LocationType.CONVOY_SEMINARS,
    label: "ندوات قوافل",
  },
];

const EventsFilterSectionInner: React.FC<EventsFilterSectionProps> = ({
  filters,
  onChangeFilters,
  showFilters,
  onToggleShowFilters,
  placesList = [],
  schedulesList = [],
}) => {
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [isPlacesDropdownOpen, setIsPlacesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tempScheduleId, setTempScheduleId] = useState("");
  const [tempMainTopic, setTempMainTopic] = useState("");
  const [tempSubTopic, setTempSubTopic] = useState("");
  const customTopicIdRef = useRef(0);

  // إغلاق القائمة المنسدلة عند الضغط خارج المكون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPlacesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPlaces = useMemo(
    () =>
      placesList.filter((p) =>
        p.name.toLowerCase().includes(placeSearchQuery.toLowerCase()),
      ),
    [placesList, placeSearchQuery],
  );

  // --- إصلاح تحديد وتراجع الأماكن ---
  const handleTogglePlace = (placeId: string) => {
    let updatedPlaces: string[];

    if (placeId === "ALL") {
      // إذا كان "ALL" محدداً بالفعل، نلغي تحديده ونحوله للمكان الرئيسي الحالي
      if (filters.selectedPlaces.includes("ALL")) {
        const mainPlace = placesList.find((p) => p.isMain)?.id || "MAIN_PLACE";
        updatedPlaces = [mainPlace];
      } else {
        // إذا لم يكن محدداً، نحدد الكل فقط
        updatedPlaces = ["ALL"];
      }
    } else {
      // عند الضغط على مكان معين
      if (filters.selectedPlaces.includes("ALL")) {
        // إذا كان "ALL" مفعلاً، يتم إلغاء "ALL" وتحديد هذا المكان فقط
        updatedPlaces = [placeId];
      } else {
        // تحديد أو إلغاء تحديد عنصر مفرد
        if (filters.selectedPlaces.includes(placeId)) {
          updatedPlaces = filters.selectedPlaces.filter((id) => id !== placeId);
          // إذا أصبحت القائمة فارغة، نلجأ إلى المكان الرئيسي افتراضياً
          if (updatedPlaces.length === 0) {
            const mainPlace =
              placesList.find((p) => p.isMain)?.id || "MAIN_PLACE";
            updatedPlaces = [mainPlace];
          }
        } else {
          updatedPlaces = [...filters.selectedPlaces, placeId];
        }
      }
    }

    onChangeFilters({ ...filters, selectedPlaces: updatedPlaces });
  };

  // --- إصلاح تحديد وتراجع أنواع الندوات ---
  const handleToggleEventType = (typeValue: string) => {
    let updatedTypes: string[];

    if (typeValue === "ALL") {
      // إذا كان "ALL" محدداً بالفعل، نلغي التحديد بالكامل (نتركه فارغاً)
      if (filters.selectedEventTypes.includes("ALL")) {
        updatedTypes = [];
      } else {
        // تحديد كافة الأنواع
        updatedTypes = ["ALL"];
      }
    } else {
      // عند الضغط على نوع معين
      if (filters.selectedEventTypes.includes("ALL")) {
        // إذا كان "ALL" مفعلاً، نلغي "ALL" ونكتفي بهذا النوع
        updatedTypes = [typeValue];
      } else {
        // إضافة أو إزالة نوع من القائمة
        if (filters.selectedEventTypes.includes(typeValue)) {
          updatedTypes = filters.selectedEventTypes.filter(
            (t) => t !== typeValue,
          );
        } else {
          updatedTypes = [...filters.selectedEventTypes, typeValue];
        }
      }
    }

    onChangeFilters({ ...filters, selectedEventTypes: updatedTypes });
  };

  const handleAddCustomTopic = () => {
    if (!tempScheduleId) return;

    const selectedSchedule = schedulesList.find((s) => s.id === tempScheduleId);
    if (!selectedSchedule) return;

    const newTopicFilter: CustomTopicFilter = {
      id: `${tempScheduleId}-${tempMainTopic || "all"}-${
        tempSubTopic || "all"
      }-${customTopicIdRef.current++}`,
      scheduleId: tempScheduleId,
      schedule_name: selectedSchedule.title,
      mainTopic: tempMainTopic || undefined,
      subTopic: tempSubTopic || undefined,
    };

    onChangeFilters({
      ...filters,
      topicsFilter: {
        isAllTopics: false,
        customTopics: [...filters.topicsFilter.customTopics, newTopicFilter],
      },
    });

    setTempScheduleId("");
    setTempMainTopic("");
    setTempSubTopic("");
  };

  const handleRemoveCustomTopic = (topicId: string) => {
    const updatedCustoms = filters.topicsFilter.customTopics.filter(
      (t) => t.id !== topicId,
    );

    onChangeFilters({
      ...filters,
      topicsFilter: {
        isAllTopics:
          updatedCustoms.length === 0 ? true : filters.topicsFilter.isAllTopics,
        customTopics: updatedCustoms,
      },
    });
  };

  const selectedScheduleObj = schedulesList.find(
    (s) => s.id === tempScheduleId,
  );
  const availableMainTopics = selectedScheduleObj?.mainTopics || [];
  const selectedMainTopicObj = availableMainTopics.find(
    (m) => m.name === tempMainTopic,
  );
  const availableSubTopics = selectedMainTopicObj?.subTopics || [];

  return (
    <div
      className="bg-white border border-gray-200/80 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4 dir-rtl"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h4 className="font-bold text-sm text-gray-800">
            تحديدات الفلترة والتصفية الشاملة
          </h4>
          <span className="text-[10px] bg-gray-50 text-blue-500 font-bold px-2.5 py-0.5 rounded-full border border-gray-100">
            تصفية الخطط والندوات
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleShowFilters}
          className="flex items-center dark:hover:bg-[#ffffff] gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-slate-400 px-3 py-1.5 rounded-xl border transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? "إخفاء الفلترة" : "تخصيص الفلترة"}</span>
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. نطاق الأماكن */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-500" />
                <span>نطاق الأماكن:</span>
              </label>

              <div className="relative ">
                <button
                  type="button"
                  onClick={() => setIsPlacesDropdownOpen((prev) => !prev)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg text-right flex justify-between items-center focus:ring-2 focus:ring-blue-500"
                >
                  <span className="truncate">
                    {filters.selectedPlaces.includes("ALL")
                      ? "جميع الأماكن بالأبناء (الكل)"
                      : `تم تحديد (${filters.selectedPlaces.length}) مكان`}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isPlacesDropdownOpen && (
                  <div className="custom-scrollbar absolute z-30 right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="بحث عن مكان..."
                        value={placeSearchQuery}
                        onChange={(e) => setPlaceSearchQuery(e.target.value)}
                        className="w-full text-xs pr-8 pl-2 py-1.5 bg-gray-50 border rounded-md focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 ">
                      <label className="flex items-center gap-2 p-1.5 text-xs rounded hover:bg-gray-50 dark:hover:bg-[#111827] cursor-pointer border-b pb-1.5">
                        <input
                          type="checkbox"
                          checked={filters.selectedPlaces.includes("ALL")}
                          onChange={() => handleTogglePlace("ALL")}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-blue-800">
                          المكان كله بأبنائه جميعاً (الكل)
                        </span>
                      </label>

                      {filteredPlaces.map((place) => {
                        const isChecked =
                          filters.selectedPlaces.includes("ALL") ||
                          filters.selectedPlaces.includes(place.id);
                        return (
                          <label
                            key={place.id}
                            className="flex items-center justify-between p-1.5 text-xs rounded hover:bg-gray-50 dark:hover:bg-[#111827] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePlace(place.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span
                                className={
                                  place.isMain
                                    ? "font-bold text-gray-800"
                                    : "text-gray-600"
                                }
                              >
                                {place.name} {place.isMain && "(المكان الحالي)"}
                              </span>
                            </div>
                            {isChecked && (
                              <Check className="w-3 h-3 text-blue-600" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. أنواع الندوات */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>نوع الندوة:</span>
              </label>

              <div className="custom-scrollbar p-2 bg-white border border-gray-300 rounded-lg space-y-1.5 max-h-36 overflow-y-auto">
                <label className="flex items-center gap-2 text-xs font-bold text-blue-700 cursor-pointer border-b pb-1">
                  <input
                    type="checkbox"
                    checked={filters.selectedEventTypes.includes("ALL")}
                    onChange={() => handleToggleEventType("ALL")}
                    className="rounded text-blue-600"
                  />
                  <span>كافة الأنواع (الكل)</span>
                </label>

                {EVENT_TYPE_OPTIONS.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-0.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={
                        filters.selectedEventTypes.includes("ALL") ||
                        filters.selectedEventTypes.includes(type.value)
                      }
                      onChange={() => handleToggleEventType(type.value)}
                      className="rounded text-blue-600"
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. الفترة الزمنية */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                <span>الفترة الزمنية:</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">
                    من:
                  </span>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      onChangeFilters({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">
                    إلى:
                  </span>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      onChangeFilters({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          end: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. فلترة الموضوعات */}
          <div className="pt-3 border-t border-gray-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                <span>تحديد الموضوعات المطلوب فلترتها:</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.topicsFilter.isAllTopics}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      topicsFilter: {
                        ...filters.topicsFilter,
                        isAllTopics: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-blue-600"
                />
                <span>جميع الموضوعات من كافة الجداول (الكل)</span>
              </label>
            </div>

            {!filters.topicsFilter.isAllTopics && (
              <div className="bg-white p-3 border border-gray-200 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={tempScheduleId}
                    onChange={(e) => {
                      setTempScheduleId(e.target.value);
                      setTempMainTopic("");
                      setTempSubTopic("");
                    }}
                    className="text-xs p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- اختر جدول العمل بالكامل --</option>
                    {schedulesList.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={tempMainTopic}
                    disabled={!tempScheduleId}
                    onChange={(e) => {
                      setTempMainTopic(e.target.value);
                      setTempSubTopic("");
                    }}
                    className="text-xs p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  >
                    <option value="">
                      {!tempScheduleId
                        ? "اختر الجدول أولاً"
                        : "-- كافة الموضوعات الرئيسية --"}
                    </option>
                    {availableMainTopics.map((m, idx) => (
                      <option key={idx} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={tempSubTopic}
                    disabled={!tempMainTopic}
                    onChange={(e) => setTempSubTopic(e.target.value)}
                    className="text-xs p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  >
                    <option value="">
                      {!tempMainTopic
                        ? "اختر الرئيسي أولاً"
                        : "-- كافة الموضوعات الفرعية --"}
                    </option>
                    {availableSubTopics.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomTopic}
                  disabled={!tempScheduleId}
                  className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg disabled:bg-gray-300 dark:disabled:bg-[#3b4a63] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة شرط فلترة الموضوعات</span>
                </button>

                {filters.topicsFilter.customTopics.length > 0 && (
                  <div className="pt-2 border-t space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-600 block">
                      الموضوعات المحددة للفلترة:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {filters.topicsFilter.customTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs px-2.5 py-1 rounded-full"
                        >
                          <span>
                            {topic.schedule_name}
                            {topic.mainTopic && ` ← ${topic.mainTopic}`}
                            {topic.subTopic && ` ← ${topic.subTopic}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTopic(topic.id)}
                            className="text-blue-500 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const EventsFilterSection = React.memo(EventsFilterSectionInner);
