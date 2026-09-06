// components/EventsListSection.tsx
import React from "react";
import { Sparkles, Edit, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FilterState } from "./EventsFilterSection.tsx";

interface EventsListSectionProps {
  placeId: string;
  canEditEvent?: boolean;
  canCreateEvent: boolean;
  filters: FilterState;
}

export const EventsListSection: React.FC<EventsListSectionProps> = ({
  placeId,
  canEditEvent = true,
  canCreateEvent,
  filters,
}) => {
  const navigate = useNavigate();

  // بيانات توضيحية مؤقتة (يمكن استبدالها بـ API response)
  const eventsList: any[] = [];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-base text-gray-900">
          قائمة الندوات المسجلة نطاق الفلترة
        </h4>
        <span className="text-xs text-gray-500">
          العدد الإجمالي: {eventsList.length}
        </span>
      </div>

      {eventsList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">
            لا توجد ندوات أو أعمال مسجلة ضمن نطاق البحث والفلترة المحدد حالياً.
          </p>
          {canCreateEvent && (
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              يمكنك تغيير خيارات الفلترة أو الضغط على "إضافة ندوة جديدة" لبدء
              التسجيل.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventsList.map((event) => (
            <div
              key={event.id}
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-white flex justify-between items-start"
            >
              <div className="space-y-2">
                <h5 className="font-bold text-sm text-gray-800">
                  {event.title}
                </h5>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {event.location}
                  </span>
                </div>
              </div>

              {canEditEvent && (
                <button
                  onClick={() =>
                    navigate(
                      `/listlinks/places/${placeId}/events/${event.id}/edit`,
                    )
                  }
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="تعديل الندوة"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
