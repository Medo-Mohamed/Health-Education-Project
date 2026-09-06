// PlaceStaffTab.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Loader2,
  UserCheck,
  ShieldAlert,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import AxiosApi from "../../../../../../AxiosApi";
import toast from "react-hot-toast";
import { AddStaffModal } from "./AddStaffModal";
// import { PlacePermission } from "../PlaceLayout";
import { usePlacePermissions } from "../../../../../Redux-Store/PlacePermissions/usePlacePermissions";
import { PlacePermission } from "../../types";
// import { usePlacePermissions } from "./usePlacePermissions";

interface StaffUser {
  _id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  avatar_url?: string;
}

interface StaffItem {
  _id: string; // accessId
  user: StaffUser;
  role: string;
  is_direct: boolean;
  granted_by?: string;
  custom_permissions?: string[];
  effective_permissions?: string[];
  inherit_to_children?: boolean;
  role_expires_at?: string | null;
  created_at: string;
}

export const PlaceStaffTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // جلب الصلاحيات من الـ Hook
  const { hasPermission } = usePlacePermissions();

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // جلب قائمة الموظفين
  const fetchStaffList = useCallback(async () => {
    if (!id) return;
    setStaffLoading(true);
    try {
      const res = await AxiosApi.get(
        `/auth/withlogin/places/place-staff/place-staff/${id}/staff`,
      );
      setStaffList(res.data.staff || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("ليس لديك صلاحية لعرض موظفي هذا المكان.");
      } else {
        console.error("خطأ أثناء جلب موظفي المكان:", err);
      }
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  }, [id]);

  // ✅ التعديل الرئيسي: الاعتماد على id و fetchStaffList فقط وتجنب الـ Infinite Loop
  useEffect(() => {
    const canView =
      hasPermission(PlacePermission.VIEW_MEMBERS) ||
      hasPermission(PlacePermission.MANAGE_MEMBERS);

    if (id && canView) {
      void fetchStaffList();
    }
    // eslint-disable-next-deps — نكتفي بـ id و fetchStaffList للحد من إعادة التنفيذ غير المطلوبة
  }, [id, fetchStaffList]);

  const handleStaffAdded = () => {
    fetchStaffList();
  };

  // الانتقال لصفحة تعديل الصلاحيات المخصصة
  const handleEditPermissions = (userId: string) => {
    navigate(
      `/listlinks/places/place-layout/${id}/staff/${userId}/permissions`,
    );
  };

  // حذف موظف من المكان
  const handleRemoveStaff = async (accessId: string) => {
    if (!window.confirm("هل أنت تأكد من إزالة هذا الموظف من المكان؟")) return;

    try {
      await AxiosApi.delete(
        `/auth/withlogin/places/place-staff/place-staff-access/${accessId}/${id}`,
      );
      toast.success("تم إزالة الموظف بنجاح");
      fetchStaffList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل إزالة الموظف من المكان.");
    }
  };

  const canManageMembers = hasPermission(PlacePermission.MANAGE_MEMBERS);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6 dir-rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>إدارة موظفي المكان والصلاحيات</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            استعراض وتعيين الموظفين المباشرين، والمشرفين الموروثين من المكان
            الأعلى
          </p>
        </div>

        {canManageMembers && (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + إضافة موظف جديد
            </button>

            <AddStaffModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              placeId={id || ""}
              onStaffAdded={handleStaffAdded}
            />
          </>
        )}
      </div>

      {staffLoading ? (
        <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-medium">
            جاري تحميل قائمة الموظفين...
          </span>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">
            لا يوجد موظفون مضافون في هذا المكان حالياً.
          </p>
          {canManageMembers && (
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              اضغط على زر "إضافة موظف جديد" لربط وتحديد صلاحيات أول موظف لهذا
              المكان.
            </p>
          )}
        </div>
      ) : (
        <div className="border border-gray-200/70 rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50/80 text-gray-700 border-b font-bold">
                <tr>
                  <th className="p-3.5">الموظف</th>
                  <th className="p-3.5">الدور الوظيفي</th>
                  <th className="p-3.5">نوع التعيين</th>
                  <th className="p-3.5 text-center">الصلاحيات المخصصة</th>
                  {canManageMembers && (
                    <th className="p-3.5 text-center">الإجراءات</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {staffList.map((item: StaffItem) => {
                  const userName =
                    item.user?.first_name || item.user?.last_name
                      ? `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim()
                      : item.user?.name || "مستخدم غير معرف";

                  const roleLabels: Record<string, string> = {
                    place_admin: "مدير المكان (Admin)",
                    place_supervisor: "مشرف تشغيلي (Supervisor)",
                    place_operator: "عضو ميداني / مشغل (Operator)",
                    place_viewer: "مشاهد فقط (Viewer)",
                  };

                  const roleLabel = roleLabels[item.role] || item.role;

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-gray-50/80 transition ${
                        item.role_expires_at &&
                        new Date(item.role_expires_at) < new Date()
                          ? "bg-orange-100"
                          : ""
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {item.user?.avatar_url ? (
                            <img
                              src={item.user.avatar_url}
                              alt={userName}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {userName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                              <span>{userName}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                              {item.user?.email || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                          {roleLabel}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {item.is_direct !== false ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>مباشر على المكان</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>موروث من مكان أعلى</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {item.custom_permissions &&
                        item.custom_permissions.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                            {item.custom_permissions.length} إضافية
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            افتراضية
                          </span>
                        )}
                      </td>

                      {canManageMembers && (
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                handleEditPermissions(item.user._id)
                              }
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1"
                              title="تعديل الصلاحيات والدور"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            {item.is_direct !== false && (
                              <button
                                onClick={() => handleRemoveStaff(item._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="حذف الموظف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
