import { BsList } from "react-icons/bs";
import { GoX } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { IoMdPerson } from "react-icons/io";
import { CiLight } from "react-icons/ci";
import { IoMoon } from "react-icons/io5";
import { changeTheme } from "../../Redux-Store/ThemesControle/ThemeSlice";
import { useEffect, useState } from "react";
import {
  logOutUser,
  openLoginModal,
} from "../../Redux-Store/UserControle/UserDisplatSlice";
import { MdOutlineLogout } from "react-icons/md";
import UserList from "./UserList";

function Left({
  isClicked,
  openMobileBar,
  closeMobileBar,
}: {
  isClicked: boolean;
  openMobileBar: () => void;
  closeMobileBar: () => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isClicked) {
      closeMobileBar();
    } else {
      openMobileBar();
    }
  };
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      closeMobileBar();
    }
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const User = useSelector((state: RootState) => state.User);
  const Theme = useSelector((state: RootState) => state.Theme.value);
  const Dispatch = useDispatch<AppDispatch>();

  const [openUserList, setOpenUserList] = useState(false);
  const handleOpenUserList = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setOpenUserList((prev) => !prev);
  };
  const handleCloseUserList = () => {
    setOpenUserList(false);
  };
  return (
    <div className="element-center gap-4">
      {User.status == "idle" ? (
        <div className="element-center gap-2">
          <div
            className="element-center gap-0.5 text-xl  p-1 rounded-md  transition-colors duration-300 cursor-pointer group relative"
            onClick={handleOpenUserList}
          >
            <div className="flex items-center gap-2 group cursor-pointer">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-black/20 border border-gray-500/50 group-hover:bg-black/60 transition-all duration-300 relative"
                style={{
                  backgroundImage: User.data.user?.avatar_url
                    ? `url(${User.data.user.avatar_url})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* إذا لم توجد صورة، نظهر الأيقونة في المنتصف تماماً */}
                {!User.data.user?.avatar_url && (
                  <IoMdPerson className="w-2/3 h-2/3 " />
                )}
              </div>

              {/* اسم المستخدم بجانب الصورة */}
              <div className="hidden md:block text-sm font-medium transition-colors group-hover:text-blue-500">
                {User.data.user?.first_name}
              </div>
            </div>
            <UserList
              isOpen={openUserList}
              handelCloseUserList={handleCloseUserList}
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button
            onClick={() => Dispatch(openLoginModal())}
            className="border p-2 rounded gap-1.5 flex items-center bg-green-600 hover:bg-green-700 transition-colors duration-300"
          >
            <IoMdPerson />
            <div className="hidden md:block">تسجيل الدخول</div>
          </button>
          {/* <button className="border p-2 rounded hoverAction">Register</button> */}
        </div>
      )}

      <div
        className="cursor-pointer text-3xl p-1 rounded-md"
        onClick={() => Dispatch(changeTheme())}
        title={`Switch to ${Theme === "light" ? "dark" : "light"} mode`}
      >
        {Theme === "light" ? <IoMoon /> : <CiLight />}
      </div>
      <div
        className="cursor-pointer hoverAction text-3xl p-1 rounded-md lg:hidden"
        onClick={handleClick}
      >
        {isClicked ? <GoX /> : <BsList />}
      </div>
      {/* to test now */}
      {User.status === "idle" && (
        <button
          onClick={() => Dispatch(logOutUser())}
          className="text-2xl rounded element-center text-red-600 hover:text-red-700 transition-colors duration-300 cursor-pointer rotate-180"
          title="تسجيل خروج"
        >
          <MdOutlineLogout />
        </button>
      )}

      {/*== to test now ==*/}
    </div>
  );
}

export default Left;
