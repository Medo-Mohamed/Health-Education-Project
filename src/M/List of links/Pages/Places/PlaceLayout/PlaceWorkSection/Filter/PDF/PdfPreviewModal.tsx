import React, { useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { MyPdfDocumentTables } from "./MyPdfDocumentTables";
import { MyDetailedPdfDocumentRows } from "./MyPdfDocumentRows";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: any[];
  rawList: any[];
  placeInfo?: any;
  planeOrEvent?: string;
  for: "tables" | "rows";
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  schedules = [],
  rawList = [],
  placeInfo,
  planeOrEvent,
  for: reportType,
}) => {
  //   console.log("Schedules in PdfPreviewModal:", schedules);
  //   console.log("Raw List in PdfPreviewModal:", rawList);

  const [pageSize, setPageSize] = useState<"A4" | "LETTER">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape",
  );

  if (!isOpen) return null;

  const pdfProps = {
    pageSize,
    orientation,
    schedules,
    rawList,
    placeInfo,
    planeOrEvent,
    for: reportType,
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={toolbarStyle}>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <label>
              حجم الورقة:
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as "A4" | "LETTER")}
                style={selectStyle}
              >
                <option value="A4">A4</option>
                <option value="LETTER">Letter</option>
              </select>
            </label>

            <label>
              الاتجاه:
              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as "portrait" | "landscape")
                }
                style={selectStyle}
              >
                <option value="landscape">أفقي (Landscape)</option>
                <option value="portrait">عمودي (Portrait)</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <PDFDownloadLink
              key={`${pageSize}-${orientation}-${schedules.length}-${rawList.length}`}
              document={
                reportType === "tables" ? (
                  <MyPdfDocumentTables {...pdfProps} />
                ) : (
                  <MyDetailedPdfDocumentRows {...pdfProps} />
                )
              }
              fileName={`${planeOrEvent}-report-${new Date().toISOString().slice(0, 10)}.pdf`}
              style={downloadBtnStyle}
            >
              {({ loading }) => (loading ? "جاري التجهيز..." : "تحميل PDF")}
            </PDFDownloadLink>

            <button onClick={onClose} style={closeBtnStyle}>
              إغلاق
            </button>
          </div>
        </div>

        <div style={{ flex: 1, width: "100%" }}>
          <PDFViewer width="100%" height="100%" showToolbar={true}>
            {reportType === "tables" ? (
              <MyPdfDocumentTables {...pdfProps} />
            ) : (
              <MyDetailedPdfDocumentRows {...pdfProps} />
            )}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "#FFF",
  width: "85%",
  height: "90%",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const toolbarStyle: React.CSSProperties = {
  padding: "12px 20px",
  backgroundColor: "#F8FAFC",
  borderBottom: "1px solid #E2E8F0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const selectStyle: React.CSSProperties = {
  marginRight: "8px",
  padding: "4px 8px",
  borderRadius: "4px",
  border: "1px solid #CBD5E1",
};

const downloadBtnStyle: React.CSSProperties = {
  backgroundColor: "#2563EB",
  color: "#FFF",
  padding: "6px 16px",
  borderRadius: "4px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "bold",
};

const closeBtnStyle: React.CSSProperties = {
  backgroundColor: "#64748B",
  color: "#FFF",
  border: "none",
  padding: "6px 16px",
  borderRadius: "4px",
  cursor: "pointer",
};
