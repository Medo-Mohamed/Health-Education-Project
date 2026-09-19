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
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex justify-center items-center z-[1000]">
      <div className="bg-white dark:bg-gray-900 w-[85%] h-[90%] rounded-lg flex flex-col overflow-hidden border border-transparent dark:border-gray-800 shadow-xl">
        <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex flex-wrap gap-2.5 justify-between items-center text-gray-800 dark:text-gray-200">
          <div className="flex flex-wrap gap-2.5 items-center">
            <label className="text-xs sm:text-sm font-medium flex items-center">
              حجم الورقة:
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as "A4" | "LETTER")}
                className="mr-2 px-2 py-1 rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="A4">A4</option>
                <option value="LETTER">Letter</option>
              </select>
            </label>

            <label className="text-xs sm:text-sm font-medium flex items-center">
              الاتجاه:
              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as "portrait" | "landscape")
                }
                className="mr-2 px-2 py-1 rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="landscape">أفقي (Landscape)</option>
                <option value="portrait">عمودي (Portrait)</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs sm:text-sm font-bold no-underline transition-colors"
            >
              {({ loading }) => (loading ? "جاري التجهيز..." : "تحميل PDF")}
            </PDFDownloadLink>

            <button
              onClick={onClose}
              className="bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white border-none px-4 py-1.5 rounded text-xs sm:text-sm font-medium cursor-pointer transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-100 dark:bg-gray-950">
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
