import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function UserList({
  isOpen,
  handelCloseUserList,
}: {
  isOpen: boolean;
  handelCloseUserList: () => void;
}) {
  const User = useSelector((state: RootState) => state.User);
  // console.log("Rendering UserList with user data:", User);

  useEffect(() => {
    window.addEventListener("click", handelCloseUserList);
    return () => window.removeEventListener("click", handelCloseUserList);
  }, [isOpen, handelCloseUserList]);

  const List = [
    { name: "الصفحة الشخصية", to: "/profile" },
    { name: "قائمة الاصدقاء", to: "/friends" },
    { name: "الاماكن", to: "/places" },
  ];

  if (!isOpen || User.status !== "idle") return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="userList absolute top-full left-[50%] translate-x-[-50%]  p-1 rounded-md  filter  shadow-lg  backdrop-blur-sm  mt-2 z-50 cursor-default "
    >
      <div className="flex items-center gap-3 p-2 rounded-lg transition-colors ">
        {/* حاوية الصورة الشخصية أو الحرف */}
        <div className="w-10 h-10 flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-black/10 border border-gray-500/30 transition-colors duration-300">
          {User.data.user?.avatar_url ? (
            <img
              src={User.data.user.avatar_url}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold leading-none select-none ">
              {User.data.user?.first_name?.[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* حاوية النصوص (الاسم والإيميل) */}
        <div className="flex flex-col justify-center overflow-hidden">
          <div className="text-sm font-bold  truncate leading-tight">
            {`${User.data.user?.first_name} ${User.data.user?.last_name}`}
          </div>
          <div className="text-xs font-medium  truncate">
            {User.data.user?.email}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-500/30 my-1" />
      {List.map((item) => (
        <Link
          to={item.to}
          key={item.name}
          className="block px-3 py-2 rounded-md  transition-colors linksList truncate"
          onClick={handelCloseUserList}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export default UserList;
