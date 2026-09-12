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
// import type { LocationType } from "../../../../types";
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
    marginBottom: 10,
    alignItems: "center",
  },
  mainTitleBox: {
    backgroundColor: "#F9B185",
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 4,
    paddingHorizontal: 25,
    marginBottom: 8,
  },
  mainTitleText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  topStatsTable: {
    flexDirection: "row-reverse",
    marginBottom: 10,
  },
  topStatsCol: {
    borderWidth: 1,
    borderColor: "#000000",
  },
  topStatsRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 18,
    alignItems: "stretch", // يضمن تمدد الأعمدة برأسية الصف بالكامل
  },
  topStatsCellLabel: {
    backgroundColor: "#F9B185",
    width: 90,
    height: "100%", // يمتد بطول الخلية بالكامل
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
  },
  topStatsCellValue: {
    width: 130,
    height: "100%", // يمتد بطول الخلية بالكامل
    fontSize: 8,
    textAlign: "center",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
  },
  tableHeaderRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#F9B185",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 28,
    alignItems: "stretch", // تمدد الخلايا برأسية الهيدر
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 22,
    alignItems: "stretch", // تمدد الخلايا برأسية صفوف البيانات
  },
  th: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
    height: "100%", // يمتد لأسفل الخلية لتغطية الحدود بالكامل
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  td: {
    fontSize: 7,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
    height: "100%", // يمتد لأسفل الخلية لتغطية الحدود بالكامل
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  colAdmin: { width: "7%" },
  colMonth: { width: "5%" },
  colMainTopic: { width: "18%" },
  colSubTopic: { width: "18%" },
  colInternalSeminar: { width: "6%" },
  colPublicAdvice: { width: "6%" },
  colExternalSeminar: { width: "6%" },
  colMassMeeting: { width: "6%" },
  colConvoys: { width: "6%" },
  colChildren: { width: "4%" },
  colMales: { width: "4%" },
  colFemales: { width: "4%" },
  colMediaOutlets: { width: "5%" },
  colDigitalMedia: { width: "5%" },
  colNotes: { width: "6%", borderLeftWidth: 0 },
  signaturesContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
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

export interface MyPdfDocumentProps {
  pageSize?: "A4" | "LETTER";
  orientation?: "portrait" | "landscape";
  schedules?: any[];
  rawList?: any[];
  placeInfo?: any;
  planeOrEvent?: string;
}

export const MyPdfDocumentTables: React.FC<MyPdfDocumentProps> = ({
  pageSize = "A4",
  orientation = "landscape",
  schedules = [],
  rawList = [],
  planeOrEvent,
}) => {
  return (
    <Document>
      {schedules.map((schedule: any, sIdx: number) => {
        const scheduleTitle = schedule.title || schedule.name;
        const scheduleItems = rawList.filter(
          (item) =>
            item.schedule_name === scheduleTitle ||
            item.schedule_id === schedule.id ||
            item.schedule_id === schedule._id,
        );

        const flatTopicsList: { mainTopic: string; subTopic: string }[] = [];

        if (Array.isArray(schedule.mainTopics)) {
          schedule.mainTopics.forEach((mainObj: any) => {
            const mainName = mainObj.name || "";
            if (
              Array.isArray(mainObj.subTopics) &&
              mainObj.subTopics.length > 0
            ) {
              mainObj.subTopics.forEach((subName: string) => {
                flatTopicsList.push({ mainTopic: mainName, subTopic: subName });
              });
            } else {
              flatTopicsList.push({ mainTopic: mainName, subTopic: "-" });
            }
          });
        }

        return (
          <Page
            key={schedule.id || schedule._id || sIdx}
            size={pageSize}
            orientation={orientation}
            style={styles.page}
          >
            <View style={styles.headerContainer}>
              <View style={styles.mainTitleBox}>
                <Text style={styles.mainTitleText}>
                  نموذج {planeOrEvent === "events" ? "الانجاز" : "الخطة"} -{" "}
                  {scheduleTitle || "جدول بدون اسم"}
                </Text>
              </View>

              <View style={styles.topStatsTable}>
                <View
                  style={[
                    styles.topStatsCol,
                    { marginLeft: 15, borderWidth: 0 },
                  ]}
                >
                  <View style={[styles.topStatsRow, { borderWidth: 1 }]}>
                    <Text style={styles.topStatsCellLabel}>
                      الإدارة / الوحدة
                    </Text>
                    <Text style={styles.topStatsCellValue}></Text>
                  </View>
                  <View
                    style={[
                      styles.topStatsRow,
                      { borderWidth: 1, borderTopWidth: 0 },
                    ]}
                  >
                    <Text style={styles.topStatsCellLabel}>الشهر</Text>
                  </View>
                  <View style={[styles.topStatsRow, { borderWidth: 0 }]}></View>
                </View>

                <View style={styles.topStatsCol}>
                  <View style={styles.topStatsRow}>
                    <Text style={styles.topStatsCellLabel}>عدد السكان</Text>
                    <Text style={styles.topStatsCellValue}></Text>
                  </View>
                  <View style={styles.topStatsRow}>
                    <Text style={styles.topStatsCellLabel}>
                      عدد المثقفين المتفرغين
                    </Text>
                    <Text style={styles.topStatsCellValue}></Text>
                  </View>
                  <View style={[styles.topStatsRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.topStatsCellLabel}>
                      إجمالي عدد المثقفين
                    </Text>
                    <Text style={styles.topStatsCellValue}></Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.table, { borderTopWidth: 0 }]}>
              <View
                style={[styles.tableHeaderRow, { borderTopWidth: 1 }]}
                fixed
              >
                <Text style={[styles.th, styles.colAdmin]}>
                  الإدارة / الوحدة
                </Text>
                <Text style={[styles.th, styles.colMonth]}>الشهر</Text>
                <Text style={[styles.th, styles.colMainTopic]}>
                  الموضوع الرئيسي
                </Text>
                <Text style={[styles.th, styles.colSubTopic]}>
                  الموضوع الفرعي
                </Text>
                <Text style={[styles.th, styles.colInternalSeminar]}>
                  ندوة داخلية
                </Text>
                <Text style={[styles.th, styles.colPublicAdvice]}>
                  مشورة عامة
                </Text>
                <Text style={[styles.th, styles.colExternalSeminar]}>
                  ندوة خارجية
                </Text>
                <Text style={[styles.th, styles.colMassMeeting]}>
                  لقاء جماهيري
                </Text>
                <Text style={[styles.th, styles.colConvoys]}>ندوات قوافل</Text>
                <Text style={[styles.th, styles.colChildren]}>أطفال</Text>
                <Text style={[styles.th, styles.colMales]}>ذكور</Text>
                <Text style={[styles.th, styles.colFemales]}>إناث</Text>
                <Text style={[styles.th, styles.colMediaOutlets]}>
                  استخدام وسائل إعلامية
                </Text>
                <Text style={[styles.th, styles.colDigitalMedia]}>
                  أنشطة إعلامية رقمية
                </Text>
                <Text style={[styles.th, styles.colNotes]}>ملاحظات</Text>
              </View>

              {flatTopicsList.map((topic, tIdx) => {
                const matchedEvents = scheduleItems.filter(
                  (item) =>
                    String(item.main_topic || item.mainTopic) ===
                      String(topic.mainTopic) &&
                    String(item.sub_topic || item.subTopic) ===
                      String(topic.subTopic),
                );

                let internalCount = 0;
                let externalCount = 0;
                let publicAdviceCount = 0;
                let massMeetingCount = 0;
                let convoyCount = 0;
                let children = 0;
                let males = 0;
                let females = 0;
                let mediaOutlets = 0;
                let digitalMedia = 0;

                matchedEvents.forEach((ev) => {
                  const locType = String(ev.location_type || "").toLowerCase();
                  const count =
                    ev.target_seminars_count || ev.seminars_count || 1;

                  if (locType === "internal_seminar") {
                    internalCount += count;
                  } else if (locType === "external_seminar") {
                    externalCount += count;
                  } else if (locType === "general_consultation") {
                    publicAdviceCount += count;
                  } else if (locType === "public_meeting") {
                    massMeetingCount += count;
                  } else if (locType === "convoy_seminars") {
                    convoyCount += count;
                  }

                  const att = ev.target_attendees || ev.attendees || {};
                  children += Number(att.children || 0);
                  males += Number(att.males || 0);
                  females += Number(att.females || 0);

                  mediaOutlets += Number(ev.media_outlets_count || 0);
                  digitalMedia += Number(
                    ev.digital_media_activities_count || 0,
                  );
                });

                const isLastRow = tIdx === flatTopicsList.length - 1;

                return (
                  <View
                    style={[
                      styles.tableRow,
                      isLastRow ? { borderBottomWidth: 0 } : undefined,
                    ]}
                    key={tIdx}
                    wrap={false}
                  >
                    <Text style={[styles.td, styles.colAdmin]}></Text>
                    <Text style={[styles.td, styles.colMonth]}></Text>
                    <Text style={[styles.td, styles.colMainTopic]}>
                      {topic.mainTopic || "-"}
                    </Text>
                    <Text style={[styles.td, styles.colSubTopic]}>
                      {topic.subTopic || "-"}
                    </Text>
                    <Text style={[styles.td, styles.colInternalSeminar]}>
                      {internalCount || ""}
                    </Text>
                    <Text style={[styles.td, styles.colPublicAdvice]}>
                      {publicAdviceCount || ""}
                    </Text>
                    <Text style={[styles.td, styles.colExternalSeminar]}>
                      {externalCount || ""}
                    </Text>
                    <Text style={[styles.td, styles.colMassMeeting]}>
                      {massMeetingCount || ""}
                    </Text>
                    <Text style={[styles.td, styles.colConvoys]}>
                      {convoyCount || ""}
                    </Text>
                    <Text style={[styles.td, styles.colChildren]}>
                      {children || ""}
                    </Text>
                    <Text style={[styles.td, styles.colMales]}>
                      {males || ""}
                    </Text>
                    <Text style={[styles.td, styles.colFemales]}>
                      {females || ""}
                    </Text>
                    <Text style={[styles.td, styles.colMediaOutlets]}>
                      {mediaOutlets || ""}
                    </Text>
                    <Text style={[styles.td, styles.colDigitalMedia]}>
                      {digitalMedia || ""}
                    </Text>
                    <Text style={[styles.td, styles.colNotes]}></Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.signaturesContainer} wrap={false}>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureText}>مسؤول التثقيف</Text>
              </View>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureText}>يعتمد</Text>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
