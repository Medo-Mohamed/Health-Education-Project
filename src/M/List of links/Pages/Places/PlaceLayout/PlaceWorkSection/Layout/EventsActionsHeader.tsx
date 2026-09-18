// components/EventsActionsHeader.tsx
import { Calendar, Plus, Target } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { usePlacePermissions } from "../../../../../../Redux-Store/PlacePermissions/usePlacePermissions";
import { PlacePermission } from "../../../types";

export const EventsActionsHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isDev, hasPermission } = usePlacePermissions();

  return (
    <div className="bg-white border border-gray-200/80  dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>إدارة خطة وفعاليات المكان</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            استعراض الخطة المستقبلية ومتابعة معدلات الإنجاز وإدارة الندوات
            الميدانية.
          </p>
        </div>

        {/* أزرار التوجيه للصفحات الخارجية */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {/* 1. زر التوجيه لصفحة إنشاء/إعداد الخطة المستهدفة */}
          {(isDev || hasPermission(PlacePermission.CREATE_PLAN)) && (
            <button
              onClick={() => navigate(`plan-manegment`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Target className="w-4 h-4 text-purple-600" />
              <span>إعداد الخطة المستهدفة</span>
            </button>
          )}

          {/* 2. زر التوجيه لصفحة إضافة ندوة جديدة */}
          {(isDev || hasPermission(PlacePermission.CREATE_EVENT)) && (
            <button
              onClick={() => navigate(`create-event`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ندوة جديدة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
