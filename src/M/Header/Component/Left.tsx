import { BsList } from "react-icons/bs";
import { GoX } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { IoMdPerson } from "react-icons/io";
import { CiLight } from "react-icons/ci";
import { IoMoon } from "react-icons/io5";
import { changeTheme } from "../../Redux-Store/ThemesControle/ThemeSlice";
import { useEffect } from "react";
import { openLoginModal } from "../../../H/Redux-Store/LoginSlice";
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
  const Dispatch = useDispatch();
  return (
    <div className="flex items-center gap-4">
      {User.status == "success" ? (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full "
            style={{
              backgroundImage: `url(${User.data.user.avatar_url})`,
              backgroundSize: "cover",
            }}
          ></div>
          <span className="text-2xl">{User.data.user.username}</span>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button onClick={() => Dispatch(openLoginModal())} className="border p-2 rounded gap-1.5 flex items-center bg-green-600 hover:bg-green-700 transition-colors duration-300">
            <IoMdPerson />
            Login
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
    </div>
  );
}

export default Left;
