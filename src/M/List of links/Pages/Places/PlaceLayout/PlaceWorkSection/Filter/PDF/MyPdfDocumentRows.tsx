import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import cairoFont from "../../../../../../../../assets/fonts/Cairo-ExtraBold.ttf";

Font.register({
  family: "Cairo",
  src: cairoFont,
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontFamily: "Cairo",
    direction: "rtl",
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  mainTitleText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
  },
  tableHeaderRowGroup: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  headerRowTop: {
    flexDirection: "row-reverse",
    minHeight: 20,
    alignItems: "stretch",
  },
  headerRowBottom: {
    flexDirection: "row-reverse",
    minHeight: 20,
    alignItems: "stretch",
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 20,
    alignItems: "stretch",
  },
  th: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
    height: "100%",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  td: {
    fontSize: 8,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
    height: "100%",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  // أوزان ونسب الأعمدة
  colIndex: { width: "5%" },
  colDate: { width: "13%" },
  colTitle: { width: "25%" },
  colLocation: { width: "27%" },
  colCount: { width: "10%" },
  colAttendeesGroup: { width: "20%" },
  colSubAttendee: { width: "6.66%" },

  signaturesContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 40,
  },
  signatureBox: {
    alignItems: "center",
  },
  signatureText: {
    fontSize: 9,
    fontWeight: "bold",
  },
});

export interface MyDetailedPdfDocumentProps {
  pageSize?: "A4" | "LETTER";
  orientation?: "portrait" | "landscape";
  rawList?: any[];
  planeOrEvent?: string;
}

// دالة مساعدة لتنسيق التاريخ بشكل YYYY-MM-DD
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
};

// دالة مساعدة لتحديد عنوان أو اسم المكان من العنصر
const getLocationName = (item: any) => {
  if (item.external_location_name) {
    return item.external_location_name;
  }
  return "";
};

export const MyDetailedPdfDocumentRows: React.FC<
  MyDetailedPdfDocumentProps
> = ({
  pageSize = "A4",
  orientation = "landscape",
  rawList = [],
  planeOrEvent = "plane",
}) => {
  // 1. فرز قائمة البيانات تصاعدياً حسب التاريخ
  const sortedList = [...rawList].sort((a, b) => {
    const dateA = new Date(
      a.planned_date || a.date || a.event_date || 0,
    ).getTime();
    const dateB = new Date(
      b.planned_date || b.date || b.event_date || 0,
    ).getTime();
    return dateA - dateB;
  });

  // 2. تحديد تاريخ بداية ونهاية الفعالية
  const startDate =
    sortedList.length > 0
      ? formatDate(
          sortedList[0].planned_date ||
            sortedList[0].date ||
            sortedList[0].event_date,
        )
      : "-";
  const endDate =
    sortedList.length > 0
      ? formatDate(
          sortedList[sortedList.length - 1].planned_date ||
            sortedList[sortedList.length - 1].date ||
            sortedList[sortedList.length - 1].event_date,
        )
      : "-";

  const typeLabel = planeOrEvent === "events" ? "إنجاز" : "خطة";

  // متغيرا التتبع لترقيم المسلسل عند كل تاريخ جديد
  let currentSequence = 0;
  let lastProcessedDate = "";

  return (
    <Document>
      <Page size={pageSize} orientation={orientation} style={styles.page}>
        {/* عنوان الصفحة الرئيسي */}
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitleText}>
            {typeLabel} ندوات الثقافة الصحية التفصيلية خلال الفترة ({startDate}) -
            ({endDate})
          </Text>
        </View>

        {/* الجدول التفصيلي */}
        <View style={[styles.table, { borderTopWidth: 0 }]}>
          <View
            style={[styles.tableHeaderRowGroup, { borderTopWidth: 1 }]}
            fixed
          >
            {/* الصف العلوي للهيدر */}
            <View style={styles.headerRowTop}>
              <Text
                style={[styles.th, styles.colIndex, { borderBottomWidth: 0 }]}
              >
                م
              </Text>
              <Text
                style={[styles.th, styles.colDate, { borderBottomWidth: 0 }]}
              >
                تاريخ الندوة
              </Text>
              <Text
                style={[styles.th, styles.colTitle, { borderBottomWidth: 0 }]}
              >
                موضوع الندوة
              </Text>
              <Text
                style={[
                  styles.th,
                  styles.colLocation,
                  { borderBottomWidth: 0 },
                ]}
              >
                مكان الندوة
              </Text>
              <Text
                style={[styles.th, styles.colCount, { borderBottomWidth: 0 }]}
              >
                عدد الندوات
              </Text>
              <Text
                style={[
                  styles.th,
                  styles.colAttendeesGroup,
                  { borderLeftWidth: 0 },
                ]}
              >
                الحضور المتوقع
              </Text>
            </View>

            {/* الصف السفلي للهيدر لتفاصيل الحضور */}
            <View
              style={[
                styles.headerRowBottom,
                { borderTopWidth: 0, borderTopColor: "#000000" },
              ]}
            >
              <View style={[styles.colIndex, { borderLeftWidth: 1 }]} />
              <View style={[styles.colDate, { borderLeftWidth: 1 }]} />
              <View style={[styles.colTitle, { borderLeftWidth: 1 }]} />
              <View style={[styles.colLocation, { borderLeftWidth: 1 }]} />
              <View style={[styles.colCount, { borderLeftWidth: 1 }]} />

              <Text
                style={[
                  styles.th,
                  styles.colSubAttendee,
                  { borderTopWidth: 1 },
                ]}
              >
                أطفال
              </Text>
              <Text
                style={[
                  styles.th,
                  styles.colSubAttendee,
                  { borderTopWidth: 1 },
                ]}
              >
                ذكور
              </Text>
              <Text
                style={[
                  styles.th,
                  styles.colSubAttendee,
                  { borderLeftWidth: 0 },
                  { borderTopWidth: 1 },
                ]}
              >
                إناث
              </Text>
            </View>
          </View>

          {/* صفوف البيانات من rawList */}
          {sortedList.map((item, idx) => {
            const isLastRow = idx === sortedList.length - 1;
            const attendees = item.target_attendees || item.attendees || {};
            const displayDate = formatDate(
              item.planned_date || item.date || item.event_date,
            );
            const topicText =
              item.sub_topic || item.main_topic || item.title || "-";
            const locationText = getLocationName(item);

            // احتساب الرقم المسلسل فقط عند التغير في التاريخ
            let sequenceDisplay = "";
            if (displayDate !== lastProcessedDate) {
              // eslint-disable-next-line react-hooks/immutability
              currentSequence += 1;
              sequenceDisplay = String(currentSequence);
              lastProcessedDate = displayDate;
            }

            return (
              <View
                key={item._id || item.id || idx}
                style={[
                  styles.tableRow,
                  isLastRow ? { borderBottomWidth: 0 } : undefined,
                ]}
                wrap={false}
              >
                <Text style={[styles.td, styles.colIndex]}>
                  {sequenceDisplay}
                </Text>
                <Text style={[styles.td, styles.colDate]}>{displayDate}</Text>
                <Text style={[styles.td, styles.colTitle]}>{topicText}</Text>
                <Text style={[styles.td, styles.colLocation]}>
                  {locationText}
                </Text>
                <Text style={[styles.td, styles.colCount]}>
                  {item.target_seminars_count ?? item.seminars_count ?? 1}
                </Text>
                <Text style={[styles.td, styles.colSubAttendee]}>
                  {attendees.children ?? 0}
                </Text>
                <Text style={[styles.td, styles.colSubAttendee]}>
                  {attendees.males ?? 0}
                </Text>
                <Text
                  style={[
                    styles.td,
                    styles.colSubAttendee,
                    { borderLeftWidth: 0 },
                  ]}
                >
                  {attendees.females ?? 0}
                </Text>
              </View>
            );
          })}
        </View>

        {/* قسم التوقيعات */}
        <View style={styles.signaturesContainer} wrap={false}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>مسؤول التثقيف</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>يعتمد</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
