import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UserPlus,
  Shield,
  Check,
  Search,
  Loader2,
  UserCheck,
} from "lucide-react";
import AxiosApi from "../../../../../../AxiosApi.ts";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../../../store";
import { loading, open } from "../../../../../Redux-Store/SuccessFaildState/SFS";
// import { PlaceRole } from "./EditStaffPermissionsPage.tsx";
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_OPTIONS,
  PlaceRole,
  type IPlacePermission,
  type IPlaceRole,
} from "../../types.ts";

interface SearchedUser {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
}

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  onStaffAdded?: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  placeId,
  onStaffAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [role, setRole] = useState<IPlaceRole>(PlaceRole.OPERATOR);
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [inheritToChildren, setInheritToChildren] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  // إعادة ضبط ومزامنة الصلاحيات المخصصة عند تغيير الدور
  const handleRoleChange = (newRole: IPlaceRole) => {
    setRole(newRole);
    const newDefaultPerms = DEFAULT_ROLE_PERMISSIONS[newRole] || [];
    // الإبقاء فقط على الصلاحيات التي اختارها المستخدم يدويًا والتي لا ينص عليها الدور الجديد تلقائياً
    setCustomPermissions((prev) =>
      prev.filter((perm) => !newDefaultPerms.includes(perm as IPlacePermission)),
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (
      !searchQuery.trim() ||
      searchQuery.trim().length < 3 ||
      selectedUser ||
      !isOpen
    ) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await AxiosApi.get(
          `/auth/withlogin/places/place-staff/eligible-users/${placeId}?q=${encodeURIComponent(searchQuery)}`,
        );

        const users = response.data?.data || [];
        setSearchResults(users);
        setShowDropdown(true);
      } catch (err: any) {
        console.error("خطأ أثناء البحث عن المستخدمين:", err);
        const message =
          err.response?.data?.message || "حدث خطأ أثناء البحث عن المستخدمين";
        dispatch(open({ state: "faild", title: message }));
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedUser, placeId, isOpen, dispatch]);

  if (!isOpen) return null;

  const handleSelectUser = (user: SearchedUser) => {
    setSelectedUser(user);
    setSearchQuery(user.email ? `${user.name} (${user.email})` : user.name);
    setShowDropdown(false);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setSearchQuery("");
  };

  const togglePermission = (permId: string) => {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
    // تمنع تعديل الصلاحيات المضمنة تلقائياً في الدور الحالي
    if (defaultPerms.includes(permId as IPlacePermission)) return;

    setCustomPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      dispatch(
        open({ state: "faild", title: "يرجى البحث واختيار مستخدم أولاً" }),
      );
      return;
    }

    dispatch(loading());

    try {
      const response = await AxiosApi.post(
        `/auth/withlogin/places/place-staff/place-staff/${placeId}/staff`,
        {
          user_id: selectedUser.id,
          role,
          custom_permissions: customPermissions,
          inherit_to_children: inheritToChildren,
        },
      );

      const successMsg =
        response.data?.message || "تمت إضافة الموظف وتعيين الدور بنجاح!";
      dispatch(open({ state: "success", title: successMsg }));

      if (onStaffAdded) onStaffAdded();
      handleClose();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "فشلت العملية، يرجى المحاولة لاحقاً.";
      dispatch(open({ state: "faild", title: errorMsg }));
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setRole(PlaceRole.OPERATOR);
    setCustomPermissions([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 dir-rtl">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                إضافة موظف جديد للمكان
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ابحث عن مستخدم وحدد دوره الوظيفي وصلاحياته المخصصة
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* User Search Field */}
          <div className="relative" ref={searchRef}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              البحث عن مستخدم <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                required={!selectedUser}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedUser) setSelectedUser(null);
                }}
                onFocus={() =>
                  searchResults.length > 0 && setShowDropdown(true)
                }
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني..."
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all ${
                  selectedUser
                    ? "border-emerald-500 bg-emerald-50/20 text-emerald-900 dark:text-emerald-200 font-medium"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : selectedUser ? (
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSelectedUser}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDropdown &&
              !isSearching &&
              searchQuery &&
              searchResults.length === 0 && (
                <div className="absolute z-20 w-full mt-1 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
                  لم يتم العثور على أي مستخدم مؤهل بهذا الاسم أو البريد.
                </div>
              )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              الرتبة / الدور الوظيفي <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: PlaceRole.ADMIN,
                  label: "مدير مكان (Admin)",
                  desc: "كافة الصلاحيات والإشراف التام",
                },
                {
                  id: PlaceRole.SUPERVISOR,
                  label: "مشرف (Supervisor)",
                  desc: "إشراف ومتابعة العمليات",
                },
                {
                  id: PlaceRole.OPERATOR,
                  label: "مشغّل (Operator)",
                  desc: "صلاحيات تنفيذية وتعديل محدود",
                },
                {
                  id: PlaceRole.VIEWER,
                  label: "مستعرض (Viewer)",
                  desc: "عرض البيانات والتقارير فقط",
                },
              ].map((item) => {
                const isSelected = role === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleRoleChange(item.id as IPlaceRole)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Place Permissions Selection Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              الصلاحيات المخصصة (Place Permissions)
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-800 max-h-48 overflow-y-auto">
              {PERMISSION_OPTIONS.map((perm) => {
                const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
                const isDefault = defaultPerms.includes(perm.id);
                const isChecked =
                  isDefault || customPermissions.includes(perm.id);

                return (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      isDefault
                        ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-not-allowed opacity-80"
                        : "hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDefault}
                      onChange={() => togglePermission(perm.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {perm.label}
                      {isDefault && (
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-normal">
                          (مضمنة بالدور)
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Inherit to Children Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                توريث الدور للأماكن الفرعية
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                تمكين الموظف من الوصول للأماكن التابعة لهذا المكان بنفس الدور
                تلقائياً
              </div>
            </div>
            <input
              type="checkbox"
              checked={inheritToChildren}
              onChange={(e) => setInheritToChildren(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedUser}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>إضافة الموظف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
