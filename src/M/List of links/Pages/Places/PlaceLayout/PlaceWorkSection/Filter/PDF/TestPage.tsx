import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { PdfPreviewModal } from "./PdfPreviewModal";

// --- بيانات وهمية غنية لتجربة الصفحة والتصدير مباشرة ---
const DUMMY_EVENTS = [
  {
    id: "evt-101",
    main_topic: "ندوة الذكاء الاصطناعي وتطبيقاته في الطب",
    sub_topic: "تعلم الآلة في التشخيص المبكر",
    schedule_name: "الجدول السنوي - Q1",
    instructor_info: "د. أحمد زويل",
    event_date: "2026-03-15",
    location_type: "INTERNAL",
    attendees: { males: 45, females: 30, children: 0 },
    media_outlets_count: 3,
    digital_media_activities_count: 12,
  },
  {
    id: "evt-102",
    main_topic: "ورشة عمل الأمن السيبراني للمؤسسات",
    sub_topic: "الحماية من الهندسة الاجتماعية",
    schedule_name: "خطة التدريب التقني",
    instructor_info: "م. سارة البكري",
    event_date: "2026-03-20",
    location_type: "EXTERNAL",
    external_location_name: "مركز المؤتمرات الدولي",
    attendees: { males: 80, females: 65, children: 0 },
    media_outlets_count: 5,
    digital_media_activities_count: 25,
  },
  {
    id: "evt-103",
    main_topic: "الملتقى الأسري والتوعية الرقمية للأطفال",
    sub_topic: "الأمان الأسرى في شبكات التواصل",
    schedule_name: "فعاليات المجتمع",
    instructor_info: "د. منى محمود",
    event_date: "2026-04-02",
    location_type: "INTERNAL",
    attendees: { males: 20, females: 50, children: 35 },
    media_outlets_count: 2,
    digital_media_activities_count: 8,
  },
  {
    id: "evt-104",
    main_topic: "ندوة التغير المناخي والاستدامة البيئية",
    sub_topic: "الطاقة المتجددة في المدن الذكية",
    schedule_name: "الجدول البيئي",
    instructor_info: "د. خالد عبد الرحمن",
    event_date: "2026-04-10",
    location_type: "ONLINE",
    attendees: { males: 110, females: 95, children: 0 },
    media_outlets_count: 8,
    digital_media_activities_count: 45,
  },
  {
    id: "evt-105",
    main_topic: "مؤتمر الابتكار والريادة للشباب",
    sub_topic: "تأسيس الشركات الناشئة من الفكرة للتطبيق",
    schedule_name: "برنامج دعم الشباب",
    instructor_info: "أ. عمر الشريف",
    event_date: "2026-05-01",
    location_type: "EXTERNAL",
    external_location_name: "فندق الفورسيزونز",
    attendees: { males: 150, females: 120, children: 10 },
    media_outlets_count: 10,
    digital_media_activities_count: 60,
  },
];

export const EventsPage = () => {
  // 1. حالة التحكم في نافذة الـ PDF المنبثقة
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // 2. حالات الفلترة والبحث داخل الصفحة التفاعلية
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocationType, setSelectedLocationType] = useState("ALL");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [exportScope, setExportScope] = useState<
    "ALL" | "FILTERED" | "SELECTED"
  >("FILTERED");

  // 3. جلب البيانات من Redux Store مع استخدام البيانات الوهمية كبديل افتراضي لتجربة الكود
  const { events: reduxEvents, loading } = useSelector(
    (state: any) => state.eventsFilter || {},
  );
  const events = useMemo(() => {
    return reduxEvents && reduxEvents.length > 0 ? reduxEvents : DUMMY_EVENTS;
  }, [reduxEvents]);

  // 4. تصفية البيانات المباشرة اعتماداً على البحث والفلترة
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];

    return events.filter((event: any) => {
      const matchesSearch =
        (event.main_topic || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (event.sub_topic || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (event.instructor_info || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesLocation =
        selectedLocationType === "ALL" ||
        event.location_type === selectedLocationType;

      return matchesSearch && matchesLocation;
    });
  }, [events, searchTerm, selectedLocationType]);

  // 5. تحديد البيانات التي سيتم إرسالها للتقرير (PDF) بناءً على نطاق التصدير
  const pdfDataToExport = useMemo(() => {
    if (exportScope === "SELECTED") {
      return events.filter((e: any) =>
        selectedEventIds.includes(e.id || e._id),
      );
    }
    if (exportScope === "ALL") {
      return events || [];
    }
    return filteredEvents; // DEFAULT: FILTERED
  }, [exportScope, events, filteredEvents, selectedEventIds]);

  // 6. التعامل مع تحديد وإلغاء التحديد في الجدول
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredEvents.map((item: any) => item.id || item._id);
      setSelectedEventIds(allIds);
    } else {
      setSelectedEventIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 7. حساب الإحصائيات المباشرة
  const stats = useMemo(() => {
    const list = exportScope === "SELECTED" ? pdfDataToExport : filteredEvents;
    const totalEvents = list.length;
    const totalAttendees = list.reduce((sum: number, item: any) => {
      const attendees = item.attendees || {};
      return (
        sum +
        (attendees.males || 0) +
        (attendees.females || 0) +
        (attendees.children || 0)
      );
    }, 0);

    return { totalEvents, totalAttendees };
  }, [pdfDataToExport, filteredEvents, exportScope]);

  return (
    <div style={containerStyle}>
      {/* هيدر الصفحة والزر الرئيسي */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#0F172A", fontSize: "24px" }}>
            إدارة وتقارير الفعاليات والندوات
          </h1>
          <p
            style={{ margin: "5px 0 0 0", color: "#64748B", fontSize: "14px" }}
          >
            عرض، تصفية، وتصدير تقارير رسمية بصيغة PDF للفعاليات المعتمدة
          </p>
        </div>

        <button
          onClick={() => setIsPdfModalOpen(true)}
          style={exportBtnStyle}
          disabled={pdfDataToExport.length === 0}
        >
          📄 معاينة وتصدير التقرير ({pdfDataToExport.length})
        </button>
      </div>

      {/* كروت الإحصائيات السريعة (KPIs) */}
      <div style={kpiGridStyle}>
        <div style={kpiCardStyle}>
          <span style={kpiTitleStyle}>عدد الفعاليات المعروضة</span>
          <span style={kpiValueStyle}>{stats.totalEvents}</span>
        </div>
        <div style={kpiCardStyle}>
          <span style={kpiTitleStyle}>إجمالي الحضور التقديري</span>
          <span style={kpiValueStyle}>{stats.totalAttendees} شخص</span>
        </div>
        <div style={kpiCardStyle}>
          <span style={kpiTitleStyle}>العناصر المحددة للتصدير</span>
          <span style={{ ...kpiValueStyle, color: "#2563EB" }}>
            {selectedEventIds.length} عنصر
          </span>
        </div>
      </div>

      {/* شريط أدوات الفلترة للبحث وتحديد نطاق التصدير */}
      <div style={filterBarStyle}>
        <div
          style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}
        >
          {/* البحث بكلمة مفتاحية */}
          <input
            type="text"
            placeholder="بحث بالموضوع أو المحاضر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          {/* الفلترة بنوع المكان */}
          <select
            value={selectedLocationType}
            onChange={(e) => setSelectedLocationType(e.target.value)}
            style={selectStyle}
          >
            <option value="ALL">جميع الأماكن</option>
            <option value="INTERNAL">داخلي</option>
            <option value="EXTERNAL">خارجي</option>
            <option value="ONLINE">عبر الإنترنت (Online)</option>
          </select>
        </div>

        {/* خيارات تحديد نطاق تصدير الـ PDF */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{ fontSize: "13px", fontWeight: "bold", color: "#475569" }}
          >
            نطاق التقرير:
          </span>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="exportScope"
              checked={exportScope === "FILTERED"}
              onChange={() => setExportScope("FILTERED")}
            />
            النتائج المفلترة فقط ({filteredEvents.length})
          </label>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="exportScope"
              checked={exportScope === "SELECTED"}
              onChange={() => setExportScope("SELECTED")}
              disabled={selectedEventIds.length === 0}
            />
            المحدد فقط ({selectedEventIds.length})
          </label>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="exportScope"
              checked={exportScope === "ALL"}
              onChange={() => setExportScope("ALL")}
            />
            الكل ({events?.length || 0})
          </label>
        </div>
      </div>

      {/* جدول البيانات التفاعلي */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
          جاري تحميل البيانات...
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={thGroupStyle}>
                <th style={thStyle} rowSpan={2}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredEvents.length > 0 &&
                      selectedEventIds.length === filteredEvents.length
                    }
                  />
                </th>
                <th style={thStyle} rowSpan={2}>
                  #
                </th>
                <th style={thStyle} rowSpan={2}>
                  الموضوع والجدول
                </th>
                <th style={thStyle} rowSpan={2}>
                  المحاضر
                </th>
                <th style={thStyle} rowSpan={2}>
                  التاريخ والمكان
                </th>
                <th style={{ ...thStyle, textAlign: "center" }} colSpan={3}>
                  تفاصيل الحضور
                </th>
                <th style={{ ...thStyle, textAlign: "center" }} colSpan={2}>
                  التغطية الإعلامية
                </th>
              </tr>
              <tr style={thGroupStyle}>
                <th style={thSubStyle}>رجال</th>
                <th style={thSubStyle}>نساء</th>
                <th style={thSubStyle}>أطفال</th>
                <th style={thSubStyle}>وسائل إعلام</th>
                <th style={thSubStyle}>أنشطة رقمية</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#94A3B8",
                    }}
                  >
                    لا توجد فعاليات مطابقة للفلترة الحالية
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item: any, index: number) => {
                  const itemId = item.id || item._id;
                  const isSelected = selectedEventIds.includes(itemId);
                  const attendees = item.attendees || {};

                  return (
                    <tr
                      key={itemId || index}
                      style={{
                        ...trStyle,
                        backgroundColor: isSelected
                          ? "#EFF6FF"
                          : index % 2 === 0
                            ? "#FFFFFF"
                            : "#F8FAFC",
                      }}
                    >
                      <td style={tdStyle}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(itemId)}
                        />
                      </td>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: "bold", color: "#1E293B" }}>
                          {item.main_topic || "بدون عنوان رئيسي"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>
                          {item.sub_topic || "—"} |{" "}
                          {item.schedule_name || "جدول عام"}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {item.instructor_info || "غير محدد"}
                      </td>
                      <td style={tdStyle}>
                        <div>{item.event_date || item.date || "غير محدد"}</div>
                        <span style={locationBadgeStyle(item.location_type)}>
                          {item.location_type === "EXTERNAL"
                            ? `خارجي: ${item.external_location_name || ""}`
                            : item.location_type === "ONLINE"
                              ? "عبر الإنترنت"
                              : "داخلي"}
                        </span>
                      </td>
                      <td style={tdCenterStyle}>{attendees.males || 0}</td>
                      <td style={tdCenterStyle}>{attendees.females || 0}</td>
                      <td style={tdCenterStyle}>{attendees.children || 0}</td>
                      <td style={tdCenterStyle}>
                        {item.media_outlets_count || 0}
                      </td>
                      <td style={tdCenterStyle}>
                        {item.digital_media_activities_count || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* النافذة المنبثقة لمعاينة وتصدير الـ PDF */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        data={pdfDataToExport}
      />
    </div>
  );
};

// --- Styles (CSS-in-JS) ---

const containerStyle: React.CSSProperties = {
  padding: "24px",
  backgroundColor: "#F1F5F9",
  minHeight: "100vh",
  direction: "rtl",
  fontFamily: "sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  backgroundColor: "#FFFFFF",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const exportBtnStyle: React.CSSProperties = {
  backgroundColor: "#10B981",
  color: "#FFFFFF",
  padding: "12px 24px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
};

const kpiGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const kpiCardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
};

const kpiTitleStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748B",
  marginBottom: "6px",
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#0F172A",
};

const filterBarStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "16px",
  borderRadius: "8px",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  width: "250px",
};

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
};

const radioLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#334155",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  cursor: "pointer",
};

const tableContainerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "8px",
  overflowX: "auto",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "right",
  fontSize: "14px",
};

const thGroupStyle: React.CSSProperties = {
  backgroundColor: "#F8FAFC",
  borderBottom: "1px solid #E2E8F0",
};

const thStyle: React.CSSProperties = {
  padding: "12px",
  color: "#334155",
  fontWeight: "bold",
  borderBottom: "1px solid #E2E8F0",
};

const thSubStyle: React.CSSProperties = {
  padding: "8px",
  color: "#64748B",
  fontSize: "12px",
  textAlign: "center",
  borderBottom: "1px solid #E2E8F0",
};

const trStyle: React.CSSProperties = {
  borderBottom: "1px solid #F1F5F9",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  color: "#334155",
};

const tdCenterStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "center",
};

const locationBadgeStyle = (type: string): React.CSSProperties => ({
  display: "inline-block",
  fontSize: "10px",
  padding: "2px 6px",
  borderRadius: "4px",
  marginTop: "4px",
  backgroundColor:
    type === "EXTERNAL" ? "#FEF3C7" : type === "ONLINE" ? "#E0E7FF" : "#E2E8F0",
  color:
    type === "EXTERNAL" ? "#92400E" : type === "ONLINE" ? "#3730A3" : "#334155",
});
