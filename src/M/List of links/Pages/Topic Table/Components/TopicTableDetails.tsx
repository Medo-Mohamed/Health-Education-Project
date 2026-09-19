import { memo, useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  PencilSquareIcon,
  PlusIcon,
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  Bars3Icon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import AxiosApi from "../../../../../AxiosApi";
import EditRowModal from "./EditRowModal";
import {
  loading,
  open,
  close,
} from "../../../../Redux-Store/SuccessFaildState/SFS";
// استيراد أدوات السحب والقيود
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  TouchSensor, // لدعم أفضل للموبايل
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// استيراد القيود لتقييد الحركة
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../../store";
import CreateTopicModal from "./CreateTopicModal";

interface Row {
  _id?: string;
  mainTopic: string;
  supTopic: string;
  comments?: string;
  text_color: string;
  bg_color: string;
}

export interface Table {
  _id: string;
  title: string;
  description: string;
  table_rows: Row[];
}

const SortableRow = memo(
  ({
    row,
    index,
    isEditable,
    handleEditClick,
  }: {
    row: Row;
    index: number;
    isEditable: boolean;
    handleEditClick: (index: number) => void;
  }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row._id || `row-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: row.text_color,
    backgroundColor: row.bg_color,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    touchAction: "none", // ضروري جداً للموبايل لمنع التمرير أثناء السحب
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-1 md:grid-cols-12 items-center transition-colors group text-center border-t ${
        isDragging
          ? "shadow-xl ring-2 ring-indigo-500/50 opacity-90 scale-[1.01]"
          : ""
      }`}
    >
      <div className="col-span-1 md:col-span-3 py-2 font-bold md:font-medium">
        <span className="md:hidden font-bold block mb-1">
          الموضوع الرئيسي:
        </span>
        {row.mainTopic}
      </div>

      <div className="col-span-1 md:col-span-3 py-2  ">
        <span className="md:hidden font-bold block mb-1">
          الموضوع الفرعي:
        </span>
        {row.supTopic}
      </div>

      <div className="col-span-1 md:col-span-4 py-2 text-sm italic ">
        <span className="md:hidden font-bold not-italic block mb-1">
          ملاحظات:
        </span>
        {row.comments || "---"}
      </div>

      {isEditable && (
        <div className="col-span-1 md:col-span-2 py-2 flex justify-center gap-2 overflow-hidden">
          {/* مقبض السحب */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing hover:bg-black/10 transition-all touch-none p-1  text-indigo-600 rounded-full"
          >
            <Bars3Icon className="w-7 h-7" />
          </button>

          <button
            onClick={() => handleEditClick(index)}
            className="p-1  text-indigo-600 rounded-full cursor-pointer hover:bg-black/10"
          >
            <PencilSquareIcon className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
  },
);

const TopicTableDetails = () => {
  const navigate = useNavigate();
  const UserState =
    useSelector((state: RootState) => state.User.status) === "unAuthenticated";
  const UserRole = useSelector(
    (state: RootState) => state.User.data?.user?.role,
  );
  const { id } = useParams<{ id: string }>();
  const [tableData, setTableData] = useState<Table>({
    _id: "",
    title: "",
    description: "",
    table_rows: [],
  } as Table);
  // const [loading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [isTitleAndDescOpen, setIsTitleAndDescOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedRow, setSelectedRow] = useState<{
    index: number;
    rowData?: Row;
  }>({
    index: 0,
    rowData: {} as Row,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);

  // تحسين الحساسات للموبايل والكمبيوتر
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // يتطلب حركة بسيطة لبدء السحب (يمنع السحب بالخطأ)
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }), // للموبايل: يحتاج ضغطة مطولة قليلاً
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchTable = async () => {
      try {
        // setLoading(true);
        dispatch(loading());
        const response = await AxiosApi.get(
          `/auth/withlogin/topictabels/displayonetable/${id}`,
        );
        setTableData(response.data.data || response.data);
        dispatch(close());
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data?.message || "حدث خطأ ما");
          dispatch(
            open({
              title: error.response?.data?.message || "حدث خطأ ما",
              state: "faild",
            }),
          );
        } else {
          console.error("حدث خطأ غير متوقع", error);
          dispatch(
            open({
              title: "حدث خطأ غير متوقع",
              state: "faild",
            }),
          );
        }
      }
    };

    // console.log("UserState:", UserState);
    if (UserState) {
      navigate("/");
    } else {
      fetchTable();
    }
  }, [UserState, id, navigate, dispatch]);

  const handleAddNewRow = () => {
    setSelectedRow({ index: tableData.table_rows.length });
    setIsEditOpen(true);
  };

  const handleEditClick = useCallback(
    (index: number) => {
      setSelectedRow({ index, rowData: tableData.table_rows[index] });
      setIsEditOpen(true);
    },
    [tableData.table_rows],
  );

  const handleSaveRowLocally = (index: number, newRowData: Row) => {
    const updatedRows = [...tableData.table_rows];
    if (index === updatedRows.length) {
      updatedRows.push(newRowData);
    } else {
      updatedRows[index] = newRowData;
    }
    setTableData({ ...tableData, table_rows: updatedRows });
    setIsEditOpen(false);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTableData((prev) => {
        const oldIndex = prev.table_rows.findIndex(
          (r, i) => (r._id || `row-${i}`) === active.id,
        );
        const newIndex = prev.table_rows.findIndex(
          (r, i) => (r._id || `row-${i}`) === over.id,
        );
        return {
          ...prev,
          table_rows: arrayMove(prev.table_rows, oldIndex, newIndex),
        };
      });
    }
  }, []);

  const handldeDeleteTable = async () => {
    if (window.confirm("هل انت متأكد من حذف هذا الجدول بالكامل ؟")) {
      try {
        dispatch(loading());
        const response = await AxiosApi.delete(
          `/auth/withlogin/topictabels/delete/${id}`,
        );
        dispatch(
          open({
            title: response?.data?.message || "تم حذف الجدول بنجاح",
            state: "success",
          }),
        );
        navigate("../..", { relative: "path" });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data?.message || "حدث خطأ ما");
          dispatch(
            open({
              title: error.response?.data?.message || "حدث خطأ ما",
              state: "faild",
            }),
          );
        } else {
          console.error("حدث خطأ غير متوقع", error);
          dispatch(
            open({
              title: "حدث خطأ غير متوقع",
              state: "faild",
            }),
          );
        }
      }
    }
  };

  const handleFinalSave = async () => {
    // console.log(tableData);
    try {
      const supTopics = tableData.table_rows.map((row: Row) => row.supTopic);

      const supTopicExest =
        supTopics.length !== supTopics.filter(Boolean).length;
      const hasDuplicates = new Set(supTopics).size !== supTopics.length;

      if (supTopicExest) {
        dispatch(
          open({
            title: "هناك مواضيع فرعية فارغة",
            state: "faild",
          }),
        );
        return;
      }
      if (hasDuplicates) {
        dispatch(
          open({
            title: "هناك مواضيع فرعية مكررة",
            state: "faild",
          }),
        );
        return;
      }
      dispatch(loading());
      const response = await AxiosApi.patch(
        `/auth/withlogin/topictabels/rows`,
        {
          id,
          table_rows: tableData.table_rows,
        },
      );

      console.log(response.data);
      setTableData(response.data.data);
      dispatch(
        open({
          title: response.data?.message || "تم حفظ التغييرات بنجاح",
          state: "success",
        }),
      );

      setIsEditable(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.message || "حدث خطأ ما");
        dispatch(
          open({
            title: error.response?.data?.message || "حدث خطأ ما",
            state: "faild",
          }),
        );
      } else {
        console.error("حدث خطأ غير متوقع", error);
        dispatch(
          open({
            title: "حدث خطأ غير متوقع",
            state: "faild",
          }),
        );
      }
    }
  };

  return (
    <div className="space-y-4 pb-28 md:pb-10 relative">
      {/* الهيدر (بدون تغيير) */}
      <div className="p-2 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ">
        <div>
          <h1 className="text-2xl font-bold">{tableData.title}</h1>
          <p className="mt-1 ">{tableData.description}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-col">
          {UserRole && (UserRole === "dev" || UserRole === "admin") && (
            <button
              onClick={() => setIsEditable(!isEditable)}
              className={`px-2 py-2 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer ${
                isEditable
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEditable ? (
                <LockOpenIcon className="w-5 h-5" />
              ) : (
                <LockClosedIcon className="w-5 h-5" />
              )}
              {isEditable ? "إيقاف التعديل" : "تفعيل التعديل"}
            </button>
          )}
          {isEditable && (
            <button
              onClick={handleAddNewRow}
              className="bg-indigo-600 text-white p-1 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusIcon className="w-5" /> إضافة صف
            </button>
          )}
          {isEditable && (
            <button
              onClick={() => setIsTitleAndDescOpen(true)}
              className="bg-indigo-600 text-white p-1 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusIcon className="w-5" /> تعديل العنوان والوصف
            </button>
          )}
          {isEditable && (
            <button
              onClick={handldeDeleteTable}
              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <TrashIcon className="w-5" /> حذف الجدول
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border shadow-sm bg-white overflow-hidden relative">
        <div className="hidden md:grid grid-cols-12 bg-gray-50 border-b text-sm font-bold py-2 text-center text-black">
          <div className="col-span-3">الموضوع الرئيسي</div>
          <div className="col-span-3 border-r ">الموضوع الفرعي</div>
          <div className="col-span-4 border-r ">ملاحظات</div>
          <div className="col-span-2 border-r ">إجراءات</div>
        </div>

        <div className=" relative">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]} // تقييد الحركة للمحور Y وداخل الحاوية
          >
            <SortableContext
              items={tableData.table_rows.map((r, i) => r._id || `row-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {tableData.table_rows?.map((row, index) => (
                <SortableRow
                  key={row._id || `row-${index}`}
                  row={row}
                  index={index}
                  isEditable={isEditable}
                  handleEditClick={handleEditClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {isEditable && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={handleFinalSave}
            className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-3"
          >
            (
            <>
              <CheckIcon className="w-6 h-6" /> حفظ كافة التغييرات
            </>
            )
          </button>
        </div>
      )}
      {isEditOpen && (
        <EditRowModal
          key={selectedRow.index}
          isOpen={isEditOpen}
          rowData={selectedRow}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveRowLocally}
        />
      )}

      {isTitleAndDescOpen && (
        <CreateTopicModal
          isOpen={isTitleAndDescOpen}
          onClose={() => setIsTitleAndDescOpen(false)}
          type={"updata"}
          info={{
            title: tableData.title || "",
            description: tableData.description || "",
          }}
          id={id}
          setTable={(data: Table) => setTableData(data)}
        />
      )}
    </div>
  );
};

export default TopicTableDetails;
