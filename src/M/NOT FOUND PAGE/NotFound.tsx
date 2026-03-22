import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="element-center flex-col  h-screen">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page Not Found</p>
      <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded">
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}

export default NotFound;
