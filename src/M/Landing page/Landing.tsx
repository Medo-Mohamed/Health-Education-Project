import "./Landing.css";
import LightImg from "../../assets/NJ219(1).png";
import nightImg from "../../assets/nightMode2.png";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import LitterAnimate from "./Component/LitterAnimate";
function Landing() {
  const isDarkMode =
    useSelector((state: RootState) => state.Theme.value) === "dark";
  return (
    <div id="landing" className="min-h-screen flex flex-col">
      <div className="flex-1 element-center">
        <div className="container grid md:grid-cols-2 items-center gap-8 min-h-full grid-cols-1 p-4">
          <div className="text-content order-1" dir="rtl">
            <h2 className="text-3xl font-extrabold border-b-2 border-r-2 border-primary inline-block mb-4 p-2 border-dashed">
              مـنـصـة الـتـثـقـيــف الـصـحـــي
            </h2>
            <div className="description text-lg mb-6">
              مرحبًا بك في منصتنا، حيث نهدف إلى تعزيز الوعي الصحي من خلال توفير
              محتوى تعليمي موثوق ومتنوع. انضم إلينا في رحلتنا نحو صحة أفضل وحياة
              أكثر نشاطًا!
            </div>
            <div className="text-2xl font-bold text-primary min-h-30">
              <span className="">حيث يمكنك عمل </span>
              <LitterAnimate />
              <span className="text-1xl font-normal text-gray-400 crs">|</span>
            </div>
            <div className="element-center">
              <button className="w-full md:w-70 p-4 transition-colors duration-300 rounded-full text-2xl font-bold start-btn cursor-pointer">
                ابدأ الآن
              </button>
            </div>
          </div>
          <div className="image-content order-0 md:order-2 element-center">
            <img
              src={isDarkMode ? nightImg : LightImg}
              alt="Health and Education"
              draggable="false"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
