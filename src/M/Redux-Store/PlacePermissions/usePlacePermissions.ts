// usePlacePermissions.ts
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

export const usePlacePermissions = () => {
  const { currentPlaceId, userPermissions, userRole, isDev, loading, error } =
    useSelector((state: RootState) => state.placePermissions);

  /**
   * دالة للتحقق مما إذا كان المستخدم يملك صلاحية معينة أم لا
   * @param permission اسم الصلاحية المطلوبة
   */
  const hasPermission = (permission: string): boolean => {
    if (isDev) return true; // المطور يملك كافة الصلاحيات دائماً
    return userPermissions.includes(permission);
  };

  /**
   * دالة للتحقق مما إذا كان المستخدم يملك مجموعة كاملة من الصلاحيات
   * @param permissions قائمة الصلاحيات المطلوبة
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (isDev) return true;
    return permissions.every((perm) => userPermissions.includes(perm));
  };

  return {
    currentPlaceId,
    userPermissions,
    userRole,
    isDev,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
  };
};
