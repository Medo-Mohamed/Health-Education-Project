// PlaceOverview.tsx
import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Plus,
  ChevronLeft,
  FolderTree,
  FileText,
  Edit,
} from "lucide-react";
import { PlacePermission, type IPlace, type IPlacePermission } from "../types";

interface PlaceContextType {
  place: IPlace;
  subPlaces: IPlace[];
  hasPermission: (perm: IPlacePermission) => boolean;
}

const PlaceOverviewInner: React.FC = () => {
  const { place, subPlaces, hasPermission } =
    useOutletContext<PlaceContextType>();
  const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();

  // console.log("test");

  // console.log("test");

  const handleEditPlace = () => {
    navigate(`/listlinks/places/edit/${place._id}`);
  };

  // const handleDeletePlace = async () => {
  //   if (!window.confirm(`هل أنت تأكد من إزالة وحذف المكان "${place.name}"؟`))
  //     return;

  //   try {
  //     dispatch(loading());
  //     await AxiosApi.delete(`/auth/withlogin/places/${place._id}`);
  //     dispatch(open({ state: "success", title: "تم حذف المكان بنجاح" }));
  //     navigate("/listlinks/places");
  //   } catch (err: any) {
  //     dispatch(
  //       open({
  //         state: "faild",
  //         title: err.response?.data?.message || "فشل حذف المكان.",
  //       }),
  //     );
  //   }
  // };

  const getPlaceTypeLabel = (type: string) => {
    switch (type) {
      case "administrative":
        return {
          label: "إداري (إشراف ومتابعة)",
          bg: "bg-purple-100 text-purple-700 border-purple-200",
        };
      case "operational":
        return {
          label: "عملي (ميداني)",
          bg: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "external_location":
        return {
          label: "خارجي (فعاليات)",
          bg: "bg-amber-100 text-amber-700 border-amber-200",
        };
      default:
        return { label: type, bg: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const typeInfo = getPlaceTypeLabel(place.type);

  return (
    <div className="space-y-6">
      {/* هيدر المكان */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
            {place.metadata?.photo_url ? (
              <img
                src={place.metadata.photo_url}
                alt={place.name}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 border rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h1 className="text-2xl font-bold text-gray-900">
                  {place.name}
                </h1>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${typeInfo.bg}`}
                >
                  {typeInfo.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasPermission(PlacePermission.CREATE_SUB_PLACE) && (
              <button
                onClick={() =>
                  navigate(`/listlinks/places/create/${place._id}`)
                }
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مكان فرعي</span>
              </button>
            )}
            {hasPermission(PlacePermission.EDIT_PLACE_INFO) && (
              <button
                onClick={handleEditPlace}
                className="flex cursor-pointer items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border transition"
              >
                <Edit className="w-4 h-4 text-gray-600" />
                <span>تعديل المكان</span>
              </button>
            )}
            {/* {hasPermission(PlacePermission.DELETE_PLACE) && (
              <button
                onClick={handleDeletePlace}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>حذف المكان</span>
              </button>
            )} */}
          </div>
        </div>
      </div>

      {/* تفاصيل البيانات */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b">
          البيانات التفصيلية للمكان
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-3.5 bg-gray-50 border rounded-lg">
            <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">
                وصف المكان
              </span>
              <p className="text-sm text-gray-800 leading-relaxed">
                {place.metadata?.description || "لا يوجد وصف مدون لهذا المكان."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-gray-50 border rounded-lg">
            <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">
                العنوان
              </span>
              <p className="text-sm text-gray-800">
                {place.metadata?.address_details || "لم يتم تحديد العنوان."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-gray-50 border rounded-lg">
            <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">
                أرقام التواصل
              </span>
              {place.metadata?.phone_numbers?.length ? (
                <div className="flex flex-col gap-1 dir-ltr text-right">
                  {place.metadata.phone_numbers.map((phone, i) => (
                    <span
                      key={i}
                      className="text-sm font-medium text-gray-800 font-mono"
                    >
                      {phone}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">لا توجد أرقام مسجلة</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* الأماكن الفرعية */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FolderTree className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg text-gray-900">
            الأماكن الفرعية التابعة
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border">
            {subPlaces.length}
          </span>
        </div>

        {subPlaces.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
            لا توجد أي أماكن فرعية مضافة حتى الآن.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subPlaces.map((sub) => (
              <div
                key={sub._id}
                onClick={() =>
                  navigate(`/listlinks/places/place-layout/${sub._id}`)
                }
                className="p-4 border rounded-xl hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    {sub.name}
                  </h4>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const PlaceOverview = React.memo(PlaceOverviewInner);
