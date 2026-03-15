import { useDispatch } from "react-redux";
import { changeTheme } from "../Redux-Store/ThemesControle/ThemeSlice";

function Check() {
  const dispatch = useDispatch();
  return (
    <div className="card">
      {/* الكارد هنا سيأخذ خلفية ونصوص بناءً على المتغيرات المعرفة في الـ CSS */}
      <h2>عنوان البطاقة</h2>
      <p>هذا النص سيتغير لونه تلقائياً.</p>

      <button className="my-button" onClick={()=> dispatch(changeTheme())}>تغير الخلفية</button>
    </div>
  );
}

export default Check;
