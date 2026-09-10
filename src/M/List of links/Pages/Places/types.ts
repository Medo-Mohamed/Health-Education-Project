// types.ts

// import { PlaceRole } from "./PlaceLayout/PlaceStaff/EditStaffPermissionsPage";

export type PlaceType = "administrative" | "operational" | "external_location";

export const PlaceRole = {
  ADMIN: "place_admin",
  SUPERVISOR: "place_supervisor",
  OPERATOR: "place_operator",
  VIEWER: "place_viewer",
} as const;

export type IPlaceRole = (typeof PlaceRole)[keyof typeof PlaceRole];

export interface IPlaceMetadata {
  description?: string;
  address_details?: string;
  phone_numbers?: string[];
  photo_url?: string;
}

export interface IPlace {
  _id: string;
  name: string;
  type: PlaceType;
  parent_id?: string | null;
  ancestors?: string[];
  created_by: string;
  metadata?: IPlaceMetadata;
  createdAt?: string;
  updatedAt?: string;
}

// 1. تعريف ثوابت الصلاحيات (محدث بالصلاحيات الجديدة للخطط)
export const PlacePermission = {
  // إدارة المكان والتسلسل الهرمي
  CREATE_SUB_PLACE: "place:create_sub",
  EDIT_PLACE_INFO: "place:edit_info",
  DELETE_PLACE: "place:delete",

  // إدارة الأعضاء والصلاحيات
  MANAGE_MEMBERS: "place:manage_members",
  VIEW_MEMBERS: "place:view_members",

  // إدارة الخطط المستهدفة والعمليات المرتبطة بها
  VIEW_PLAN: "place:view_plan",
  // للإنشاء الاولي
  CREATE_PLAN: "place:create_plan",
  // للمراجعة قبل رفعها للتأكيد
  SUBMIT_PLAN: "place:submit_plan",
  // المشرف للإعتماد والتعديل
  APPROVE_PLAN: "place:approve_plan",
  MERGE_PLANS: "place:merge_plans",
  // المدير العام بالنسبة للخطط المعتمدة
  EDIT_PLAN: "place:edit_plan",
  DELETE_PLAN: "place:delete_plan",

  // إدارة العمليات الميدانية والندوات
  CREATE_EVENT: "place:create_event",
  EDIT_EVENT: "place:edit_event",
  DELETE_EVENT: "place:delete_event",

  // التوثيق والقراءة
  VIEW_PLACE: "place:view",
  UPLOAD_MEDIA: "place:upload_media",
} as const;

export type IPlacePermission =
  (typeof PlacePermission)[keyof typeof PlacePermission];

// 2. خريطة الصلاحيات التلقائية لكل دور (مطابقة للسيرفر)
export const DEFAULT_ROLE_PERMISSIONS: Record<IPlaceRole, IPlacePermission[]> =
  {
    [PlaceRole.ADMIN]: [
      PlacePermission.CREATE_SUB_PLACE,
      PlacePermission.EDIT_PLACE_INFO,
      PlacePermission.DELETE_PLACE,
      PlacePermission.MANAGE_MEMBERS,
      PlacePermission.VIEW_MEMBERS,
      // صلاحيات الخطط الكاملة للآدمن
      PlacePermission.CREATE_PLAN,
      PlacePermission.EDIT_PLAN,
      PlacePermission.DELETE_PLAN,
      PlacePermission.VIEW_PLAN,
      PlacePermission.SUBMIT_PLAN,
      PlacePermission.APPROVE_PLAN,
      PlacePermission.MERGE_PLANS,
      // العمليات
      PlacePermission.CREATE_EVENT,
      PlacePermission.EDIT_EVENT,
      PlacePermission.DELETE_EVENT,
      PlacePermission.VIEW_PLACE,
      PlacePermission.UPLOAD_MEDIA,
    ],
    [PlaceRole.SUPERVISOR]: [
      PlacePermission.VIEW_MEMBERS,

      // صلاحيات الخطط للمشرف (المراجعة والرفع والدمج)
      PlacePermission.CREATE_PLAN,
      PlacePermission.EDIT_PLAN,
      PlacePermission.DELETE_PLAN,
      PlacePermission.VIEW_PLAN,
      PlacePermission.SUBMIT_PLAN,
      PlacePermission.APPROVE_PLAN,
      PlacePermission.MERGE_PLANS,
      // العمليات
      PlacePermission.CREATE_EVENT,
      PlacePermission.EDIT_EVENT,
      PlacePermission.VIEW_PLACE,
      PlacePermission.UPLOAD_MEDIA,
    ],
    [PlaceRole.OPERATOR]: [
      // PlacePermission.CREATE_PLAN,
      // PlacePermission.EDIT_PLAN,
      PlacePermission.VIEW_PLAN, // قراءة الخطة لمعرفة المستهدفات
      // PlacePermission.SUBMIT_PLAN, // إمكانية رفع الخطة للمراجعة
      PlacePermission.CREATE_EVENT,
      PlacePermission.VIEW_PLACE,
      // PlacePermission.UPLOAD_MEDIA,
    ],
    [PlaceRole.VIEWER]: [PlacePermission.VIEW_PLACE, PlacePermission.VIEW_PLAN],
  };

// 3. مصفوفة الصلاحيات مع المسميات العربية المحدثة للواجهة
export const PERMISSION_OPTIONS = [
  // إدارة المكان والأعضاء
  { id: PlacePermission.CREATE_SUB_PLACE, label: "إنشاء مكان فرعي" },
  { id: PlacePermission.EDIT_PLACE_INFO, label: "تعديل معلومات المكان" },
  { id: PlacePermission.DELETE_PLACE, label: "حذف المكان" },
  { id: PlacePermission.MANAGE_MEMBERS, label: "إدارة الأعضاء والصلاحيات" },
  { id: PlacePermission.VIEW_MEMBERS, label: "عرض قائمة الأعضاء" },

  // إدارة الخطط المستهدفة
  { id: PlacePermission.CREATE_PLAN, label: "إنشاء خطة مستهدفة" },
  { id: PlacePermission.EDIT_PLAN, label: "تعديل الخطة المستهدفة" },
  { id: PlacePermission.DELETE_PLAN, label: "حذف الخطة المستهدفة" },
  { id: PlacePermission.VIEW_PLAN, label: "عرض الخطط المستهدفة" },
  { id: PlacePermission.SUBMIT_PLAN, label: "رفع الخطط للمراجعة" },
  { id: PlacePermission.APPROVE_PLAN, label: "اعتماد أو رفض الخطط" },
  { id: PlacePermission.MERGE_PLANS, label: "دمج الخطط التشغيلية" },

  // إدارة الفعاليات والوسائط
  { id: PlacePermission.CREATE_EVENT, label: "إنشاء الفعاليات" },
  { id: PlacePermission.EDIT_EVENT, label: "تعديل الفعاليات" },
  { id: PlacePermission.DELETE_EVENT, label: "حذف الفعاليات" },
  { id: PlacePermission.VIEW_PLACE, label: "عرض بيانات المكان" },
  { id: PlacePermission.UPLOAD_MEDIA, label: "رفع وسائط وملفات" },
];

export const ROLES_LIST = [
  {
    id: PlaceRole.ADMIN,
    label: "مدير المكان (Admin)",
    desc: "صلاحيات كاملة تشمل إدارة الفروع، الاعتماد الكلي للخطط والدمج، وإدارة الأعضاء.",
  },
  {
    id: PlaceRole.SUPERVISOR,
    label: "مشرف تشغيلي (Supervisor)",
    desc: "مراجعة ودمج واعتماد الخطط، إدارة الفعاليات، وتحديث بيانات المكان والوسائط.",
  },
  {
    id: PlaceRole.OPERATOR,
    label: "عضو ميداني (Operator)",
    desc: "إنشاء مسودات الخطط ورفعها للمراجعة، تسجيل الندوات، ورفع التوثيق.",
  },
  {
    id: PlaceRole.VIEWER,
    label: "مشاهد فقط (Viewer)",
    desc: "الاطلاع واستعراض بيانات المكان والخطط والأنشطة فقط.",
  },
];

export const ROLES_LABELS: Record<IPlaceRole, string> = {
  [PlaceRole.ADMIN]: "مدير المكان (Admin)",
  [PlaceRole.SUPERVISOR]: "مشرف تشغيلي (Supervisor)",
  [PlaceRole.OPERATOR]: "عضو ميداني (Operator)",
  [PlaceRole.VIEWER]: "مشاهد فقط (Viewer)",
};

// تحديث أنواع مواقع الانعقاد بالقيم الفعلية للـ Backend
export const LocationType = {
  INTERNAL_SEMINAR: "internal_seminar", // ندوة داخلية
  EXTERNAL_SEMINAR: "external_seminar", // ندوة خارجية
  GENERAL_CONSULTATION: "general_consultation", // مشورة عامة
  PUBLIC_MEETING: "public_meeting", // لقاء جماهيري
  CONVOY_SEMINARS: "convoy_seminars", // ندوات قوافل
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const locationTypeLabels: Record<LocationType, string> = {
  internal_seminar: "ندوة داخلية",
  external_seminar: "ندوة خارجية",
  general_consultation: "مشورة عامة",
  public_meeting: "لقاء جماهيري",
  convoy_seminars: "ندوات قوافل",
};
