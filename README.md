# واجهة منصة الثقافة الصحية — Health-Education-Project (الفرونت‑إند)

هذا المشروع هو **واجهة المستخدم** لمنصة الثقافة الصحية (Full‑Stack موجّه بالعربية RTL).

- **الخادم / الـ API** المرافق لهذه الواجهة موجود في المجلد الجارٍ `Health-Education-server` — راجع قراءته هناك.
- الواجهة تعمل محلياً على المنفذ **`5173`** (Vite)، وتتصل بالخادم على منفذ **`5000`**.

واجهة عربية (RTL) مبنية على **React 19** و**Vite 7**، مع **Redux Toolkit** لإدارة الحالة،
و**React Router v7** للتنقّل، و**Tailwind CSS v4** للتنسيق، و**Axios** للتواصل مع الخادم.

---

## الفهرس

1. [بنية المجلدات](#بنية-المجلدات)
2. [أهم التقنيات](#أهم-التقنيات)
3. [المتطلبات والتشغيل](#المتطلبات-والتشغيل)
4. [متغيرات البيئة](#متغيرات-البيئة)
5. [خريطة المسارات (Routes)](#خريطة-المسارات-routes)
6. [إدارة الحالة (Redux)](#إدارة-الحالة-redux)
7. [تنظيم المكوّنات](#تنظيم-المكوّنات)
8. [النشر على Vercel (الواجهة)](#النشر-على-vercel-الواجهة)
9. [مراجعة تقنية وملاحظات (Code Review)](#مراجعة-تقنية-وملاحظات-code-review)
10. [خارطة طريق مقترحة](#خارطة-طريق-مقترحة)

---

## بنية المجلدات

```
Health-Education-Project/
├── src/
│   ├── main.tsx                    # نقطة الدخول: Redux Provider + Router + وضع RTL
│   ├── Route.tsx                   # تعريف كل المسارات وقوائم القائمة (MENU_DATA)
│   ├── App.tsx / M/App.tsx         # التخطيط العام (Header + Footer + Outlet)
│   ├── store.tsx                   # إعداد Redux Store
│   ├── Constant.ts                 # تحديد رابط الـ API حسب بيئة التشغيل
│   ├── AxiosApi/                   # إعداد Axios (الاتصال بالخادم)
│   ├── G-Component/                # مكوّنات عامة مشتركة (ThemeHandler, ProtectedRoute…)
│   ├── H/                          # مكوّنات المصادقة (Login…)
│   └── M/                          # المكوّنات الرئيسية والصفحات
│       ├── Redux-Store/            # شرائح (Slices) الخاصة بـ Redux
│       ├── Landing page/           # صفحة الهبوط
│       ├── Header/ / Footer/       # الترويسة والتذييل
│       ├── Register/               # التسجيل
│       ├── Profile/                # الملف الشخصي
│       ├── List of links/          # لوحة التحكم والصفحات الداخلية
│       │   └── Pages/              # البحث، الجداول، الملفات، المنشورات، الأماكن…
│       └── NOT FOUND PAGE/         # صفحة 404
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── .env                            # متغيّرات البيئة (لا تُرفع للمستودع)
└── vercel.json                     # إعداد النشر على Vercel
```

---

## أهم التقنيات

| الفئة | المكتبات |
|-------|-----------|
| الأساس | `react` ^19.2, `react-dom`, `vite` ^7.3, `typescript` ~5.9 |
| التوجيه | `react-router-dom` ^7.13 |
| الحالة | `@reduxjs/toolkit` ^2.11, `react-redux` ^9.2 |
| التنسيق | `tailwindcss` ^4.2, `@tailwindcss/forms` |
| الاتصال | `axios` ^1.13 |
| الأيقونات | `react-icons`, `lucide-react`, `@heroicons/react` |
| السحب والإفلات | `@dnd-kit/*` |
| الإشعارات | `react-hot-toast` |
| الملفات/المخرجات | `xlsx` (جداول), `@react-pdf/renderer`, `docx-preview` |
| أدوات | `uuid`, `validator`, `vite-plugin-svgr` |

---

## المتطلبات والتشغيل

```bash
cd Health-Education-Project

# 1) تثبيت الاعتماديات
npm install

# 2) تجهيز ملف .env (انظر الجدول أدناه)

# 3) تشغيل خادم التطوير (مع HMR)
npm run dev          # vite → http://localhost:5173

# 4) البناء للإنتاج (فحص TypeScript ثم vite build)
npm run build        # tsc -b && vite build

# 5) معاينة البناء محلياً
npm run preview
```

---

## متغيرات البيئة

أنشئ ملف `.env` في جذر `Health-Education-Project/`:

```env
# وضع التشغيل: "DEVOLOP" للاستخدام المحلي، وأي شيء آخر للأونلاين
VITE_NEV="DEVOLOP"

# رابط الخادم المحلي
VITE_LOCAL_API_URL="http://localhost:5000"

# رابط الخادم الأونلاين (Vercel)
VITE_ONLINE_API_URL="https://health-education-server.vercel.app"
```

### شرح المتغيرات

| المتغير | الوصف |
|---------|-------|
| `VITE_NEV` | مفتاح التبديل بين المحلي والأونلاين. القيمة الحالية **`"DEVOLOP"`**. |
| `VITE_LOCAL_API_URL` | عنوان الخادم المحلي (`localhost:5000`). |
| `VITE_ONLINE_API_URL` | عنوان الخادم المنشور على Vercel. |

الاختيار يتم في `src/Constant.ts`:

```ts
const url =
  import.meta.env.VITE_NEV === "DEVOLOP"
    ? import.meta.env.VITE_LOCAL_API_URL
    : import.meta.env.VITE_ONLINE_API_URL;

export const API_BASE_URL = url;
```

> **ملاحظة:** للاستخدام المحلي اترك `VITE_NEV="DEVOLOP"`. وللنشر غيّره إلى أي قيمة أخرى
> ليفعل `VITE_ONLINE_API_URL`.

---

## خريطة المسارات (Routes)

كلها معرّفة في `src/Route.tsx`. التخطيط العام `App` يوفّر `Header` + `Footer` + `Outlet`.

| المسار | المكوّن | الوصف / الحماية |
|--------|---------|-----------------|
| `/` | `Landing` | صفحة الهبوط |
| `/register` | `Register` | التسجيل |
| `/listlinks` | `ListOfLinks` | لوحة التحكم — محميّة بـ `CheckForStart` (تفتح مودال الدخول إن لم يكن مسجلاً) |
| `/profile/:id` | `ProfilePage` | الملف الشخصي — محميّ بـ `ProtectedRoute` |
| `/profile_view/:userId` | `ModernProfilePage` | عرض ملف مستخدم آخر |
| `*` | `NotFound` | صفحة 404 |

### صفحات لوحة التحكم (`MENU_DATA` — فروع `/listlinks`)

| المسار | العنوان | الوصف |
|--------|---------|-------|
| `/listlinks/search` | البحث عن المستخدمين | `FriendSearsh` (mode: searchUsers) |
| `/listlinks/following` | أُتابع | `FriendSearsh` (mode: followingUsers) |
| `/listlinks/topics` | جداول | `TopicApp` |
| ↳ `/topics/topictabledetails/:id` | تفاصيل جدول | `TopicTableDetails` |
| `/listlinks/files` | الملفات | `FileIndex` → `DisplayFiles` |
| `/listlinks/posts` | المنشورات | `PostIndex` → `DisplayPosts` |
| `/listlinks/places` | الاماكن | `PlaceApp` |

### صفحات «الأماكن» (`/listlinks/places`)

| المسار | المكوّن | الوصف |
|--------|---------|-------|
| `/places` | `MyPlacesPage` | قائمتي |
| `/places/create/:parentId?` | `CreatePlacePage` | إنشاء مكان (اختياري: مكان أب) |
| `/places/edit/:placeId` | `EditPlacePage` | تعديل مكان |
| `/places/place-layout/:id` | `PlaceLayout` | تخطيط المكان |
| ↳ `/place-layout/:id` | `PlaceOverview` | نظرة عامة |
| ↳ `.../staff` | `PlaceStaffTab` | الموظفون |
| ↳ `.../staff/:userId/permissions` | `EditStaffPermissionsPage` | تعديل صلاحيات موظف |
| ↳ `.../work-section` | `PlaceWork` | قسم العمل |
| ↳ `.../work-section/create-event` | `CreatePlaceEvent` | إنشاء ندوة/حدث |
| ↳ `.../work-section/plan-manegment` | `PlanManagementLayout` | إدارة الخطط |
| ↳ `.../plan-manegment/review` | `PlanReviewPage` | مراجعة الخطط |
| ↳ `.../plan-manegment/approval` | `PlanApprovalPage` | اعتماد الخطط |

### مكوّنات الحماية

- **`ProtectedRoute`** — يحمي `/profile/:id`:
  - `status === "loading"` → يعرض مؤشر تحميل صامت.
  - `status !== "idle"` → يعيد التوجيه إلى `/` (بلا مودال) لحل مشكلة «السبام».
  - `idle` → يعرض المحتوى المحمي.

- **`CheckForStart`** — يحمي `/listlinks`:
  - إن لم يكن المستخدم مسجّلاً → يفتح مودال الدخول ويحوّل إلى `/`.
  - يعرض مؤشر تحميل أثناء `loading`.

> **ملاحظة:** المصادقة تُدار عبر **كوكي الجلسة** (httpOnly) يعيده الخادم، والواجهة تعتمد على
> `UserKeepLogin` (يفحص الجلسة عند الإقلاع) و `refreshauth`.

---

## إدارة الحالة (Redux)

الـ Store مُعدّل في `src/store.tsx` ويشمل شرائح `MStore`:

| الشريحة (Slice) | الملف | المسؤولية |
|-----------------|-------|-----------|
| `Theme` | `ThemesControle/ThemeSlice.ts` | الوضع الفاتح/الداكن |
| `User` | `UserControle/UserDisplatSlice.ts` | بيانات المستخدم، حالة الجلسة (`loading`/`idle`/`unAuthenticated`)، فتح/إغلاق مودال الدخول |
| `SuccFaildComponent` | `SuccessFaildState/SFS.ts` | حالة التحميل والنجاح/الفشل العامة (تغذّي `Loading` و `ResponseStateModal`) |
| `UserSearch` | `UserSearch/UserSearch.ts` | نتائج بحث المستخدمين |
| `TopicTabel` | `TopicTablesControle/TopicTables.ts` | بيانات جداول المواضيع |
| `placePermissions` | `PlacePermissions/placePermissionsSlice.ts` | صلاحيات الأماكن |
| `eventsFilter` | `EventsFilter/eventsFilterSlice.ts` | فلترة الأحداث |

---

## تنظيم المكوّنات

| المجلد | المحتوى |
|--------|---------|
| `G-Component/` | مكوّنات عامة مشتركة: `ThemeHandler`, `UserKeepLogin`, `ProtectedRoute`, `CheckForStart`, `Loading`, `ResponseStateModal` |
| `H/` | مكوّنات المصادقة: `Login` (مودال الدخول) |
| `M/` | المكوّنات الرئيسية والصفحات + `Redux-Store/` |

### التخطيط العام (`M/App.tsx`)

يعرض بالترتيب: مؤشر التحميل العام (عند `loading`)، مودال الدخول (عند `unAuthenticated`)،
`ResponseStateModal` (للرسائل)، ثم `Header`، محتوى الصفحة (`Outlet`)، ثم `Footer`.
الاتجاه `dir="rtl"` مُضبط على مستوى الجذر في `main.tsx`.

### نقطة الدخول (`main.tsx`)

```tsx
<Provider store={store}>
  <ThemeHandler />
  <UserKeepLogin />
  <div dir="rtl">
    <RouterProvider router={router} />
  </div>
</Provider>
```

---

## النشر على Vercel (الواجهة)

ملف `vercel.json` يعيد توجيه كل المسارات إلى `index.html` (لأن React Router يدير المسارات في المتصفح).

### خطوات نشر الواجهة

1. انشر `Health-Education-Project` على Vercel.
2. اضبط متغيّر البيئة `VITE_NEV` بقيمة **غير** `DEVOLOP` (مثلاً `PRODUCTION`) ليفعل `VITE_ONLINE_API_URL`.
3. أضف نطاق الواجهة النهائي في `Config/allowedOrigins.ts` بالخادم (`Health-Education-server`)،
   وإلا سيرفض الخادم طلبات الواجهة (CORS).

---

## مراجعة تقنية وملاحظات (Code Review)

هذه **ملاحظات لافتة** على مستوى الواجهة — لم أغيّر أي كود، بل أعرضها لقرارك:

### 🟡 أولوية متوسطة

1. **`package.json` اسم الحزمة `shop-project`** — تسمية متبقّية من قالب/مشروع سابق؛ يُنصح بتصحيحها
   إلى اسم المشروع الفعلي.

2. **إملاء متكرر في أسماء المكوّنات/المتغيّرات:**
   - `VITE_NEV="DEVOLOP"` (الصحيح: `VITE_ENV` و `DEVELOP`) — يعمل لكنه غير متسق.
   - `plan-manegment` (الصحيح `plan-management`) في المسارات، و`TopicTabel`/`UserDisplatSlice`
     في أسماء الملفات.
   - يُستحسن التوحيد تدريجياً (مع مزامنة الـ API والخادم معاً).

3. **أسماء مجلدات بها مسافات ومسارات طويلة** (`List of links`, `NOT FOUND PAGE`, `Redux-Store`…).
   هذا يعمل لكنه يجعل الاستيرادات أطول؛ يُفضّل أسماء بدون مسافات (`list-of-links`, `not-found-page`).

### 🟢 ملاحظات تحسينية

4. **ملف `.env` الحالي يحوي روابط فقط** (لا أسرار)، لكن يُستحسن إضافته إلى `.gitignore`
   في جذر المستودع حتى لا يُرفع أبداً.

5. **ازدواج `App.tsx` و `M/App.tsx`.** `src/App.tsx` مجرد غلاف يستورد `M/App`؛ يُستحسن دمجهما
   لتقليل طبقة غير ضرورية.

6. **الاعتماد على `dotenv` في الفرونت.** Vite يقرأ متغيّرات البيئة تلقائياً بادئة `VITE_`؛
   استيراد `dotenv` غير ضروري غالباً في بيئة Vite.

---

## خارطة طريق مقترحة (الواجهة)

ترتيب منطقي للأولويات على مستوى الواجهة:

1. **الأمان:** إضافة `.env` إلى `.gitignore` في جذر المستودع.
2. **التناسق:** تصحيح اسم الحزمة في `package.json`، وتوحيد الإملاء (`DEVOLOP`، `plan-manegment`، أسماء الملفات).
3. **التنظيف:** توحيد `App.tsx` مع `M/App.tsx`، وتسمية المجلدات بدون مسافات.
4. **تجهيز النشر:** ضبط `VITE_NEV` للإنتاج، والتأكد من مزامنة النطاق مع `allowedOrigins` في الخادم.

---

> **ملاحظة ختامية:** هذا الدليل مبني على قراءة كود الواجهة المصدري الفعلي كما هو الآن.
> إن أجريت تعديلاً على المسارات أو المتغيّرات، يُرجى تحديث هذا الملف للحفاظ على دقته.
